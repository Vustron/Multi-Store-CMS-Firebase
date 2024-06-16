import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Size } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

// patch size handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; sizeId: string } },
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

    // throw error if no size id
    if (!params.sizeId) {
      return NextResponse.json("Size ID is missing", {
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
    // add data to firestore and retrieve reference id
    const sizeRef = await getDoc(
      doc(db, "stores", params.storeId, "sizes", params.sizeId),
    );
    // update the size data if exists
    if (sizeRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "sizes", params.sizeId),
        {
          ...sizeRef.data(),
          name,
          value,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Size not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedSizeDoc = await getDoc(
      doc(db, "stores", params.storeId, "sizes", params.sizeId),
    );
    const updatedSize = updatedSizeDoc.data() as Size;

    // Update the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    const cachedSizes = await redis.get(cacheKey);
    const sizes = cachedSizes ? JSON.parse(cachedSizes) : [];

    // Find and update the specific size in the cached list
    const index = sizes.findIndex((c: Size) => c.id === params.sizeId);
    if (index !== -1) {
      sizes[index] = updatedSize;
    } else {
      sizes.push(updatedSize); // If size is not in cache, add it
    }

    // Save the updated sizes list back to Redis
    await redis.set(cacheKey, JSON.stringify(sizes));

    return NextResponse.json(updatedSize, { status: 200 });
  } catch (error) {
    console.log(`SIZE_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete size handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; sizeId: string } },
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
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }
    // throw error if no category id
    if (!params.sizeId) {
      return NextResponse.json("Size ID is missing", {
        status: 400,
      });
    }

    // get store
    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    // get size ref from store
    const sizeRef = doc(db, "stores", params.storeId, "sizes", params.sizeId);

    // delete if found
    await deleteDoc(sizeRef);

    // Invalidate the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Size deleted", { status: 200 });
  } catch (error) {
    console.log(`SIZE_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
