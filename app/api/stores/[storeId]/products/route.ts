import {
  doc,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDoc,
  where,
  query,
  and,
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
    const productData = {
      name,
      price,
      images,
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
        return NextResponse.json("Unauthorized access", { status: 400 });
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
    await redis.set(cacheKey, JSON.stringify(products), "EX", 3600);

    return NextResponse.json({ id, ...productData }, { status: 200 });
  } catch (error) {
    console.log(`PRODUCTS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get product handler
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    // if there's no storeId throw an error
    if (!params.storeId) {
      return new NextResponse("Store ID is missing", {
        status: 400,
      });
    }

    // get search params
    const { searchParams } = new URL(request.url);
    const hasSearchParams = searchParams.toString() !== "";

    // construct a unique cache key
    const baseCacheKey = `products_${params.storeId}`;
    const cacheKey = hasSearchParams
      ? `${baseCacheKey}_${searchParams.toString()}`
      : baseCacheKey;

    // check if data exists in cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return new NextResponse(JSON.stringify(JSON.parse(cachedData)), {
        status: 200,
      });
    }

    const productRef = collection(
      doc(db, "stores", params.storeId),
      "products",
    );

    let productQuery;
    const queryConstraints = [];

    // construct query based on the searchParams
    if (searchParams.has("size")) {
      queryConstraints.push(where("size", "==", searchParams.get("size")));
    }

    if (searchParams.has("category")) {
      queryConstraints.push(
        where("category", "==", searchParams.get("category")),
      );
    }

    if (searchParams.has("kitchen")) {
      queryConstraints.push(
        where("kitchen", "==", searchParams.get("kitchen")),
      );
    }

    if (searchParams.has("cuisine")) {
      queryConstraints.push(
        where("cuisine", "==", searchParams.get("cuisine")),
      );
    }

    if (searchParams.has("isFeatured")) {
      queryConstraints.push(
        where(
          "isFeatured",
          "==",
          searchParams.get("isFeatured") === "true" ? true : false,
        ),
      );
    }

    if (searchParams.has("isArchived")) {
      queryConstraints.push(
        where(
          "isArchived",
          "==",
          searchParams.get("isArchived") === "true" ? true : false,
        ),
      );
    }

    if (queryConstraints.length > 0) {
      productQuery = query(productRef, and(...queryConstraints));
    } else {
      productQuery = query(productRef);
    }

    // execute query
    const querySnapshot = await getDocs(productQuery);

    const productsData: Product[] = querySnapshot.docs.map((doc) =>
      doc.data(),
    ) as Product[];

    // store the data in cache
    await redis.set(cacheKey, JSON.stringify(productsData), "EX", 3600);

    return new NextResponse(JSON.stringify(productsData), {
      status: 200,
    });
  } catch (error) {
    console.log(`PRODUCTS_GET: ${error}`);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
