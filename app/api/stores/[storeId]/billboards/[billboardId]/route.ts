import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { Billboard } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// patch billboard handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; billboardId: string } },
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
    if (!body || !body.label || !body.imageUrl) {
      return NextResponse.json("Billboard name or imageUrl is missing", {
        status: 400,
      });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }
    // throw error if no billboard id
    if (!params.billboardId) {
      return NextResponse.json("Billboard ID is missing", {
        status: 400,
      });
    }
    // assign data
    const { label, imageUrl } = body;

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const billboardRef = await getDoc(
      doc(db, "stores", params.storeId, "billboards", params.billboardId),
    );

    if (billboardRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "billboards", params.billboardId),
        {
          ...billboardRef.data(),
          label,
          imageUrl,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Billboard not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedBillboardDoc = await getDoc(
      doc(db, "stores", params.storeId, "billboards", params.billboardId),
    );
    const billboardSize = updatedBillboardDoc.data() as Billboard;

    // Update the Redis cache
    const cacheKey = `billboards_${params.storeId}`;
    const cachedBillboards = await redis.get(cacheKey);
    const billboards = cachedBillboards ? JSON.parse(cachedBillboards) : [];

    // Find and update the specific billboard in the cached list
    const index = billboards.findIndex(
      (c: Billboard) => c.id === params.billboardId,
    );
    if (index !== -1) {
      billboards[index] = billboardSize;
    } else {
      billboards.push(billboardSize); // If billboard is not in cache, add it
    }

    // Save the updated billboards list back to Redis
    await redis.set(cacheKey, JSON.stringify(billboards), "EX", 3600);

    return NextResponse.json(billboardSize, { status: 200 });
  } catch (error) {
    console.log(`BILLBOARD_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete billboard handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; billboardId: string } },
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
    // throw error if no billboard id
    if (!params.billboardId) {
      return NextResponse.json("Billboard ID is missing", {
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

    const billboardRef = doc(
      db,
      "stores",
      params.storeId,
      "billboards",
      params.billboardId,
    );

    // Invalidate the Redis cache
    const cacheKey = `billboards_${params.storeId}`;
    await redis.del(cacheKey);

    await deleteDoc(billboardRef);

    return NextResponse.json("Billboard deleted", { status: 200 });
  } catch (error) {
    console.log(`BILLBOARD_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
