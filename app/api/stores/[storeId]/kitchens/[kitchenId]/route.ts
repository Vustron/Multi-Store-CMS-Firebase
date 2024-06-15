import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { Kitchen } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// patch kitchen handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; kitchenId: string } },
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
      return NextResponse.json("Kitchen name or Kitchen value is missing", {
        status: 400,
      });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }

    // throw error if no kitchen id
    if (!params.kitchenId) {
      return NextResponse.json("Kitchen ID is missing", {
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
    const kitchenRef = await getDoc(
      doc(db, "stores", params.storeId, "kitchens", params.kitchenId),
    );
    // update the kitchen data if exists
    if (kitchenRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "kitchens", params.kitchenId),
        {
          ...kitchenRef.data(),
          name,
          value,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Kitchen not found", { status: 404 });
    }

    // get the newly updated data
    const kitchen = (
      await getDoc(
        doc(db, "stores", params.storeId, "kitchens", params.kitchenId),
      )
    ).data() as Kitchen;

    // Invalidate the Redis cache
    const cacheKey = `kitchens_${params.storeId}`;
    const cachedKitchens = await redis.get(cacheKey);
    const kitchens = cachedKitchens ? JSON.parse(cachedKitchens) : [];

    // Find and update the specific kitchen in the cached list
    const index = kitchens.findIndex((s: Kitchen) => s.id === params.storeId);
    if (index !== -1) {
      kitchens[index] = { ...kitchens[index], ...store };
    } else {
      kitchens.push(store); // If kitchen is not in cache, add it
    }

    // Save the updated kitchens list back to Redis
    await redis.set(cacheKey, JSON.stringify(kitchens));

    return NextResponse.json(kitchen, { status: 200 });
  } catch (error) {
    console.log(`KITCHEN_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete kitchen handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; kitchenId: string } },
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
    if (!params.kitchenId) {
      return NextResponse.json("Kitchen ID is missing", {
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

    // get kitchen ref from store
    const kitchenRef = doc(
      db,
      "stores",
      params.storeId,
      "kitchens",
      params.kitchenId,
    );

    // delete if found
    await deleteDoc(kitchenRef);

    // Invalidate the Redis cache
    const cacheKey = `kitchens_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Kitchen deleted", { status: 200 });
  } catch (error) {
    console.log(`KITCHEN_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
