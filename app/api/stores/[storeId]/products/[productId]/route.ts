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
import { Product } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

// patch product handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } },
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
    if (
      !body ||
      !body.name ||
      !body.price ||
      !body.image ||
      !body.isFeatured ||
      !body.isArchived ||
      !body.category ||
      !body.size ||
      !body.kitchen ||
      !body.cuisine
    ) {
      return NextResponse.json(
        "Either of the Product's name,price,image,isFeatured,isArchived,category,size,kitchen,cuisine are missing",
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

    // throw error if no product id
    if (!params.productId) {
      return NextResponse.json("Product ID is missing", {
        status: 400,
      });
    }
    // assign data
    const {
      name,
      price,
      image,
      isFeatured,
      isArchived,
      category,
      size,
      kitchen,
      cuisine,
    } = body;

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }
    // add data to firestore and retrieve reference id
    const productRef = await getDoc(
      doc(db, "stores", params.storeId, "products", params.productId),
    );
    // update the product data if exists
    if (productRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "products", params.productId),
        {
          ...productRef.data(),
          name,
          price,
          image,
          isFeatured,
          isArchived,
          category,
          size,
          kitchen,
          cuisine,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Product not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedProductDoc = await getDoc(
      doc(db, "stores", params.storeId, "products", params.productId),
    );
    const updatedProduct = updatedProductDoc.data() as Product;

    // Update the Redis cache
    const cacheKey = `products_${params.storeId}`;
    const cachedProducts = await redis.get(cacheKey);
    const products = cachedProducts ? JSON.parse(cachedProducts) : [];

    // Find and update the specific product in the cached list
    const index = products.findIndex((c: Product) => c.id === params.productId);
    if (index !== -1) {
      products[index] = updatedProduct;
    } else {
      products.push(updatedProduct); // If product is not in cache, add it
    }

    // Save the updated products list back to Redis
    await redis.set(cacheKey, JSON.stringify(products));

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.log(`PRODUCT_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete product handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } },
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
    if (!params.productId) {
      return NextResponse.json("Product ID is missing", {
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

    // get product ref from store
    const productRef = doc(
      db,
      "stores",
      params.storeId,
      "products",
      params.productId,
    );

    // delete if found
    await deleteDoc(productRef);

    // Invalidate the Redis cache
    const cacheKey = `products_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Product deleted", { status: 200 });
  } catch (error) {
    console.log(`PRODUCT_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
