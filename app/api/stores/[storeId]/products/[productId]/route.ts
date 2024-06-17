import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db, storage } from "@/lib/services/firebase";
import { deleteObject, ref } from "firebase/storage";
import { Product } from "@/lib/helpers/types";
import { auth } from "@clerk/nextjs/server";
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
    // throw error if any required fields are missing
    const requiredFields = ["name", "price", "images", "category"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(`Product ${field} is missing`, {
          status: 400,
        });
      }
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
      images,
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
          images,
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
    await redis.set(cacheKey, JSON.stringify(products), "EX", 3600);

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

    // images check
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return NextResponse.json("Product not found", { status: 404 });
    }

    // delete images if exists
    const images = productDoc.data()?.images;
    if (images && Array.isArray(images)) {
      await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, image.url);
          await deleteObject(imageRef);
        }),
      );
    }

    // delete if found
    await deleteDoc(productRef);

    // Invalidate the Redis cache
    const cacheKey = `products_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Product and associated images deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`PRODUCT_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get product id handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } },
) {
  try {
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

    // get redis cache
    const cacheKey = `products_${params.storeId}`;
    const cachedProduct = await redis.get(cacheKey);

    if (cachedProduct) {
      return NextResponse.json(JSON.parse(cachedProduct), { status: 200 });
    }

    // get product
    const product = (
      await getDoc(
        doc(db, "stores", params.storeId, "products", params.productId),
      )
    ).data() as Product;

    if (product) {
      await redis.set(cacheKey, JSON.stringify(product), "EX", 3600);
      return NextResponse.json(product, { status: 200 });
    } else {
      return NextResponse.json("Product not found", { status: 404 });
    }
  } catch (error) {
    console.log(`PRODUCT_ID_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
