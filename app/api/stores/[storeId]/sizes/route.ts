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
import redisClient from "@/lib/services/redis";
import { db } from "@/lib/services/firebase";
import { Size } from "@/lib/helpers/types";
import { auth } from "@clerk/nextjs/server";

// create new category handler
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
      return NextResponse.json("Size name or Size value is missing", {
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

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const sizeData = {
      name,
      value,
      createdAt: serverTimestamp(),
    };

    const sizeRef = await addDoc(
      collection(db, "stores", params.storeId, "sizes"),
      sizeData,
    );

    const id = sizeRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "sizes", id), {
      ...sizeData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Invalidate the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json({ id, ...sizeData }, { status: 200 });
  } catch (error) {
    console.log(`SIZES_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get categories by id handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // if there's no userId throw an error
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }

    const cacheKey = `store_${params.storeId}`;
    const cachedStore = await redisClient.get(cacheKey);

    if (cachedStore) {
      return NextResponse.json(JSON.parse(cachedStore), { status: 200 });
    }

    const sizes = (
      await getDocs(collection(doc(db, "stores", params.storeId), "sizes"))
    ).docs.map((doc) => doc.data()) as Size[];

    if (sizes) {
      await redisClient.set(cacheKey, JSON.stringify(sizes), {
        EX: 60 * 60, // Cache expires in 1 hour
      });
      return NextResponse.json(sizes, { status: 200 });
    } else {
      return NextResponse.json("Sizes not found", { status: 404 });
    }
  } catch (error) {
    console.log(`SIZES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
