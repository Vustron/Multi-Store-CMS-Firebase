import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { Category } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// patch category handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; categoryId: string } },
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
    if (!body || !body.name || !body.billboardLabel || !body.billboardId) {
      return NextResponse.json(
        "Category Name or Billboard name or Billboard ID is missing",
        {
          status: 400,
        },
      );
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }

    // throw error if no category id
    if (!params.categoryId) {
      return NextResponse.json("Category ID is missing", {
        status: 400,
      });
    }
    // assign data
    const { name, billboardLabel, billboardId } = body;

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const categoryRef = await getDoc(
      doc(db, "stores", params.storeId, "categories", params.categoryId),
    );

    if (categoryRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "categories", params.categoryId),
        {
          ...categoryRef.data(),
          name,
          billboardId,
          billboardLabel,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Category not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedCategoryDoc = await getDoc(
      doc(db, "stores", params.storeId, "categories", params.categoryId),
    );
    const categorySize = updatedCategoryDoc.data() as Category;

    // Update the Redis cache
    const cacheKey = `categories_${params.storeId}`;
    const cachedCategories = await redis.get(cacheKey);
    const categories = cachedCategories ? JSON.parse(cachedCategories) : [];

    // Find and update the specific category in the cached list
    const index = categories.findIndex(
      (c: Category) => c.id === params.categoryId,
    );
    if (index !== -1) {
      categories[index] = categorySize;
    } else {
      categories.push(categorySize); // If category is not in cache, add it
    }

    // Save the updated categories list back to Redis
    await redis.set(cacheKey, JSON.stringify(categories), "EX", 3600);

    return NextResponse.json(categorySize, { status: 200 });
  } catch (error) {
    console.log(`CATEGORIES_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete category handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; categoryId: string } },
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
    if (!params.categoryId) {
      return NextResponse.json("Category ID is missing", {
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

    const categoryRef = doc(
      db,
      "stores",
      params.storeId,
      "categories",
      params.categoryId,
    );

    await deleteDoc(categoryRef);

    // Invalidate the Redis cache
    const cacheKey = `categories_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Category deleted", { status: 200 });
  } catch (error) {
    console.log(`CATEGORY_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
