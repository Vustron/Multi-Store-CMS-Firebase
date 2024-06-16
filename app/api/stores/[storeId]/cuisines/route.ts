import {
  doc,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { Cuisine } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// create new cuisine handler
export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // get user
    const { userId } = auth();
    // get body
    const body = await request.json();
    // throw error if no user
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    // throw error if no data
    if (!body || !body.name || !body.value) {
      return NextResponse.json("Cuisine name or Cuisine value is missing", {
        status: 400,
      });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }
    // assign data
    const { name, value } = body;
    const cuisineData = {
      name,
      value,
      createdAt: serverTimestamp(),
    };

    // get store id
    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    // add data to firestore and retrieve reference id
    const cuisineRef = await addDoc(
      collection(db, "stores", params.storeId, "cuisines"),
      cuisineData,
    );
    // get reference id
    const id = cuisineRef.id;
    // update newly created store data
    await updateDoc(doc(db, "stores", params.storeId, "cuisines", id), {
      ...cuisineData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedCuisine = await getDoc(
      doc(db, "stores", params.storeId, "cuisines", id),
    );
    const cuisine = updatedCuisine.data() as Cuisine;

    // Invalidate the Redis cache
    const cacheKey = `cuisines_${params.storeId}`;
    const cachedCuisines = await redis.get(cacheKey);
    const cuisines = cachedCuisines ? JSON.parse(cachedCuisines) : [];

    // Append the new cuisine to the cached cuisines list
    cuisines.push(cuisine);

    // Save the updated cuisines list back to Redis
    await redis.set(cacheKey, JSON.stringify(cuisines));

    return NextResponse.json(cuisine, { status: 200 });
  } catch (error) {
    console.log(`CUISINES_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get cuisine handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // if there's no userId throw an error
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }
    // get redis cache
    const cacheKey = `cuisines_${params.storeId}`;
    const cachedCuisine = await redis.get(cacheKey);

    if (cachedCuisine) {
      return NextResponse.json(JSON.parse(cachedCuisine), { status: 200 });
    }
    // get cuisines if no redis cache
    const cuisines = (
      await getDocs(collection(doc(db, "stores", params.storeId), "cuisines"))
    ).docs.map((doc) => doc.data()) as Cuisine[];

    if (cuisines) {
      await redis.set(cacheKey, JSON.stringify(cuisines));
      return NextResponse.json(cuisines, { status: 200 });
    } else {
      return NextResponse.json("Cuisines not found", { status: 404 });
    }
  } catch (error) {
    console.log(`CUISINES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
