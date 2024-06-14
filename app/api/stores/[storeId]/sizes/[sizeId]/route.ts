import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import redisClient from "@/lib/services/redis";
import { Category } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";

// patch category handler
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

    // throw error if no category id
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

    const sizeRef = await getDoc(
      doc(db, "stores", params.storeId, "sizes", params.sizeId),
    );

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

    const size = (
      await getDoc(doc(db, "stores", params.storeId, "sizes", params.sizeId))
    ).data() as Category;

    // Invalidate the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log(`SIZE_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete billboard handler
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

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const sizeRef = doc(db, "stores", params.storeId, "sizes", params.sizeId);

    await deleteDoc(sizeRef);

    // Invalidate the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json("Size deleted", { status: 200 });
  } catch (error) {
    console.log(`SIZE_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
