import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { Cuisine } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// patch cuisine handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; cuisineId: string } },
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
    // throw error if no cuisine id
    if (!params.cuisineId) {
      return NextResponse.json("Cuisine ID is missing", {
        status: 400,
      });
    }

    // assign data
    const { name, value } = body;

    // Verify store ownership
    const store = await getDoc(doc(db, "stores", params.storeId));
    if (store.exists()) {
      const storeData = store.data();
      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 403 });
      }
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }

    // Retrieve the existing cuisine document
    const cuisineRef = await getDoc(
      doc(db, "stores", params.storeId, "cuisines", params.cuisineId),
    );

    // Update the cuisine data if it exists
    if (cuisineRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "cuisines", params.cuisineId),
        {
          name,
          value,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Cuisine not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedCuisineDoc = await getDoc(
      doc(db, "stores", params.storeId, "cuisines", params.cuisineId),
    );
    const updatedCuisine = updatedCuisineDoc.data() as Cuisine;

    // Update the Redis cache
    const cacheKey = `cuisines_${params.storeId}`;
    const cachedCuisines = await redis.get(cacheKey);
    const cuisines = cachedCuisines ? JSON.parse(cachedCuisines) : [];

    // Find and update the specific cuisine in the cached list
    const index = cuisines.findIndex((c: Cuisine) => c.id === params.cuisineId);
    if (index !== -1) {
      cuisines[index] = updatedCuisine;
    } else {
      cuisines.push(updatedCuisine); // If cuisine is not in cache, add it
    }

    // Save the updated cuisines list back to Redis
    await redis.set(cacheKey, JSON.stringify(cuisines), "EX", 3600);

    return NextResponse.json(updatedCuisine, { status: 200 });
  } catch (error) {
    console.log(`CUISINE_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete cuisine handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; cuisineId: string } },
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
    if (!params.cuisineId) {
      return NextResponse.json("Cuisine ID is missing", {
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

    // get cuisine ref from store
    const cuisineRef = doc(
      db,
      "stores",
      params.storeId,
      "cuisines",
      params.cuisineId,
    );

    // delete if found
    await deleteDoc(cuisineRef);

    // Invalidate the Redis cache
    const cacheKey = `cuisines_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Cuisine deleted", { status: 200 });
  } catch (error) {
    console.log(`CUISINE_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
