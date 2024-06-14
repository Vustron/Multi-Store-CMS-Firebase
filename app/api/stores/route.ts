import {
  doc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDocs,
  where,
  query,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import redisClient from "@/lib/services/redis";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";

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

    await updateDoc(doc(db, "stores", id), {
      ...storeData,
      id,
      updatedAt: serverTimestamp(),
    });

    const cacheKey = `stores_${userId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json({ id, ...storeData }, { status: 200 });
  } catch (error) {
    console.log(`Stores_POST: ${error}`);
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
    // get user
    const { userId } = auth();
    // throw error if no user
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const cacheKey = `store_${userId}_${params.storeId}`;
    const cachedStores = await redisClient.get(cacheKey);

    if (cachedStores) {
      return NextResponse.json(JSON.parse(cachedStores), { status: 200 });
    }

    const storeSnap = await getDocs(
      query(collection(db, "stores"), where("userId", "==", userId)),
    );

    const stores: Store[] = [];

    storeSnap.forEach((doc) => {
      stores.push(doc.data() as Store);
    });

    if (stores) {
      await redisClient.set(cacheKey, JSON.stringify(stores), {
        EX: 60 * 60, // Cache expires in 1 hour
      });
      return NextResponse.json(stores, { status: 200 });
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
