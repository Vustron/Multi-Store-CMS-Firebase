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
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Size } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

// create new size handler
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
    // assign data
    const { name, value } = body;
    const sizeData = {
      name,
      value,
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
    const sizeRef = await addDoc(
      collection(db, "stores", params.storeId, "sizes"),
      sizeData,
    );
    // get reference id
    const id = sizeRef.id;
    // update newly created store data
    await updateDoc(doc(db, "stores", params.storeId, "sizes", id), {
      ...sizeData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedSize = await getDoc(
      doc(db, "stores", params.storeId, "sizes", id),
    );
    const size = updatedSize.data() as Size;

    // Invalidate the Redis cache
    const cacheKey = `sizes_${params.storeId}`;
    const cachedSizes = await redis.get(cacheKey);
    const sizes = cachedSizes ? JSON.parse(cachedSizes) : [];

    // Append the new size to the cached sizes list
    sizes.push(size);

    // Save the updated sizes list back to Redis
    await redis.set(cacheKey, JSON.stringify(sizes), "EX", 3600);

    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log(`SIZES_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get size handler
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

    // get redis cache
    const cacheKey = `sizes_${params.storeId}`;
    const cachedSize = await redis.get(cacheKey);

    if (cachedSize) {
      return new NextResponse(JSON.stringify(JSON.parse(cachedSize)), {
        status: 200,
      });
    }

    // get sizes if no redis cache
    const sizes = (
      await getDocs(collection(doc(db, "stores", params.storeId), "sizes"))
    ).docs.map((doc) => doc.data()) as Size[];

    if (sizes.length > 0) {
      await redis.set(cacheKey, JSON.stringify(sizes), "EX", 3600);
      return new NextResponse(JSON.stringify(sizes), {
        status: 200,
      });
    } else {
      return new NextResponse("Sizes not found", {
        status: 404,
      });
    }
  } catch (error) {
    console.log(`SIZES_GET: ${error}`);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
