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
import { Product } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// create new product handler
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
    const productData = {
      name,
      price,
      image,
      isFeatured,
      isArchived,
      category,
      size,
      kitchen,
      cuisine,
      createdAt: serverTimestamp(),
    };

    // get store id
    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    // add data to firestore and retrieve reference id
    const productRef = await addDoc(
      collection(db, "stores", params.storeId, "products"),
      productData,
    );
    // get reference id
    const id = productRef.id;
    // update newly created store data
    await updateDoc(doc(db, "stores", params.storeId, "products", id), {
      ...productData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedProduct = await getDoc(
      doc(db, "stores", params.storeId, "products", id),
    );
    const product = updatedProduct.data() as Product;

    // Invalidate the Redis cache
    const cacheKey = `products_${params.storeId}`;
    const cachedProducts = await redis.get(cacheKey);
    const products = cachedProducts ? JSON.parse(cachedProducts) : [];

    // Append the new product to the cached products list
    products.push(product);

    // Save the updated products list back to Redis
    await redis.set(cacheKey, JSON.stringify(products));

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.log(`PRODUCTS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get product handler
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
    const cacheKey = `products_${params.storeId}`;
    const cachedProduct = await redis.get(cacheKey);

    if (cachedProduct) {
      return NextResponse.json(JSON.parse(cachedProduct), { status: 200 });
    }
    // get products if no redis cache
    const products = (
      await getDocs(collection(doc(db, "stores", params.storeId), "products"))
    ).docs.map((doc) => doc.data()) as Product[];

    if (products) {
      await redis.set(cacheKey, JSON.stringify(products));
      return NextResponse.json(products, { status: 200 });
    } else {
      return NextResponse.json("Products not found", { status: 404 });
    }
  } catch (error) {
    console.log(`PRODUCTS_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
