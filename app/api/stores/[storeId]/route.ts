import {
  getDocs,
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";
import redisClient from "@/lib/services/redis";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";

// update store handler
export async function PATCH(
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
    // throw error if no store name
    if (!body) {
      return NextResponse.json("Store name is missing", { status: 400 });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store id is missing", { status: 400 });
    }

    const { name } = body;

    const docRef = doc(db, "stores", params.storeId);
    await updateDoc(docRef, { name });
    const store = (await getDoc(docRef)).data() as Store;

    // Invalidate the Redis cache
    const cacheKey = `store_${userId}_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log(`Stores_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete store handler
export async function DELETE(
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

    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store id is missing", { status: 400 });
    }

    const docRef = doc(db, "stores", params.storeId);

    // TODO: delete all sub collections

    await deleteDoc(docRef);

    // Invalidate the Redis cache
    const cacheKey = `store_${userId}_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json("Store and sub-collections deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`STORES_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get stores by id handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // // get user
    // const { userId } = auth();
    // // throw error if no user
    // if (!userId) {
    //   return NextResponse.json("Unauthorized", { status: 401 });
    // }
    // if there's no userId throw an error
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }

    const cacheKey = `store_${params.storeId}`;
    const cachedStore = await redisClient.get(cacheKey);

    if (cachedStore) {
      return NextResponse.json(JSON.parse(cachedStore), { status: 200 });
    }
    // get store
    const stores = (
      await getDoc(doc(db, "stores", params.storeId))
    ).data() as Store;

    if (stores) {
      await redisClient.set(cacheKey, JSON.stringify(stores), {
        EX: 60 * 60, // Cache expires in 1 hour
      });
      return NextResponse.json(stores, { status: 200 });
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORE_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
