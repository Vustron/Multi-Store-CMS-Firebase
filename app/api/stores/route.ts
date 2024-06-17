import {
  doc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

// create new store handler
export async function POST(request: NextRequest) {
  try {
    // get user
    const { userId } = auth();
    // get body
    const body = await request.json();
    // throw error if no user
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    // throw error if no store name
    if (!body || !body.name) {
      return NextResponse.json("Store name is missing", { status: 400 });
    }
    // assign data
    const { name } = body;
    const storeData = {
      name,
      userId,
      createdAt: serverTimestamp(),
    };
    // add data to firestore and retrieve reference id
    const storeRef = await addDoc(collection(db, "stores"), storeData);
    // get reference id
    const id = storeRef.id;

    // update newly created store data
    await updateDoc(doc(db, "stores", id), {
      ...storeData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedStore = await getDoc(doc(db, "stores", id));
    const store = updatedStore.data() as Store;

    // Invalidate the Redis cache
    const cacheKey = `stores_${id}`;
    const cachedStores = await redis.get(cacheKey);
    const stores = cachedStores ? JSON.parse(cachedStores) : [];

    // Append the new store to the cached stores list
    stores.push(store);

    // Save the updated stores list back to Redis
    await redis.set(cacheKey, JSON.stringify(stores), "EX", 3600);

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log(`STORES_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get all stores handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store id is missing", { status: 400 });
    }
    // get redis cache
    const cacheKey = `stores_${params.storeId}`;
    const cachedStores = await redis.get(cacheKey);

    if (cachedStores) {
      return NextResponse.json(JSON.parse(cachedStores), { status: 200 });
    }

    // get store if no redis cache
    const storeSnap = await getDocs(
      query(collection(db, "stores"), where("userId", "==", params.storeId)),
    );

    const stores: Store[] = [];

    storeSnap.forEach((doc) => {
      stores.push(doc.data() as Store);
    });

    if (stores) {
      // set the new stores data into redis cache
      await redis.set(cacheKey, JSON.stringify(stores), "EX", 3600);
      return NextResponse.json(stores, { status: 200 });
    } else {
      return NextResponse.json("Stores not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
