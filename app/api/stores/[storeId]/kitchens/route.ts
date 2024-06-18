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
import { Kitchen } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// create new kitchen handler
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
    // assign data
    const { name, value } = body;
    const kitchenData = {
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
    const kitchenRef = await addDoc(
      collection(db, "stores", params.storeId, "kitchens"),
      kitchenData,
    );
    // get reference id
    const id = kitchenRef.id;
    // update newly created store data
    await updateDoc(doc(db, "stores", params.storeId, "kitchens", id), {
      ...kitchenData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedKitchen = await getDoc(
      doc(db, "stores", params.storeId, "kitchens", id),
    );
    const kitchen = updatedKitchen.data() as Kitchen;

    // Invalidate the Redis cache
    const cacheKey = `kitchens_${params.storeId}`;
    const cachedKitchens = await redis.get(cacheKey);
    const kitchens = cachedKitchens ? JSON.parse(cachedKitchens) : [];

    // Append the new kitchen to the cached kitchens list
    kitchens.push(kitchen);

    // Save the updated kitchens list back to Redis
    await redis.set(cacheKey, JSON.stringify(kitchens), "EX", 3600);

    return NextResponse.json(kitchen, { status: 200 });
  } catch (error) {
    console.log(`KITCHENS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get kitchen handler
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    // if there's no userId throw an error
    if (!params.storeId) {
      return new NextResponse("Store ID is missing", {
        status: 400,
      });
    }
    // get redis cache
    const cacheKey = `kitchens_${params.storeId}`;
    const cachedKitchen = await redis.get(cacheKey);

    if (cachedKitchen) {
      return new NextResponse(JSON.stringify(JSON.parse(cachedKitchen)), {
        status: 200,
      });
    }

    // get kitchens if no redis cache
    const kitchens = (
      await getDocs(collection(doc(db, "stores", params.storeId), "kitchens"))
    ).docs.map((doc) => doc.data()) as Kitchen[];

    if (kitchens.length > 0) {
      await redis.set(cacheKey, JSON.stringify(kitchens), "EX", 3600);
      return new NextResponse(JSON.stringify(kitchens), {
        status: 200,
      });
    } else {
      return new NextResponse("Kitchens not found", {
        status: 404,
      });
    }
  } catch (error) {
    console.log(`KITCHENS_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
