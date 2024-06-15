import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

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

    // update redis cache
    const cacheKey = `stores_${params.storeId}`;
    await redis.del(cacheKey);
    await redis.set(`stores_${params.storeId}`, JSON.stringify(store));

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log(`STORES_PATCH: ${error}`);
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
    const cacheKey = `stores_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Store and sub-collections deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`STORES_DELETE: ${error}`);
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
    // if there's no userId throw an error
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }

    // get redis cache
    const cacheKey = `stores_${params.storeId}`;
    const cachedStore = await redis.get(cacheKey);

    if (cachedStore) {
      return NextResponse.json(JSON.parse(cachedStore), { status: 200 });
    }

    // get store if no redis cache
    const stores = (
      await getDoc(doc(db, "stores", params.storeId))
    ).data() as Store;

    if (stores) {
      // set the new stores data into redis cache
      await redis.set(cacheKey, JSON.stringify(stores));
      return NextResponse.json(stores, { status: 200 });
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORE_ID_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
