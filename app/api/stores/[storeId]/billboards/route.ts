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
import { Billboard } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// create new billboard handler
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
    // assign data
    const { label, imageUrl } = body;
    const billboardData = {
      label,
      imageUrl,
      createdAt: serverTimestamp(),
    };

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }
    // add data to firestore and retrieve reference id
    const billboardRef = await addDoc(
      collection(db, "stores", params.storeId, "billboards"),
      billboardData,
    );
    // get reference id
    const id = billboardRef.id;

    // update newly created billboard data
    await updateDoc(doc(db, "stores", params.storeId, "billboards", id), {
      ...billboardData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedBillboard = await getDoc(
      doc(db, "stores", params.storeId, "billboards", id),
    );
    const billboard = updatedBillboard.data() as Billboard;

    // Invalidate the Redis cache
    const cacheKey = `billboards_${params.storeId}`;
    const cachedBillboards = await redis.get(cacheKey);
    const billboards = cachedBillboards ? JSON.parse(cachedBillboards) : [];

    // Append the new billboard to the cached billboards list
    billboards.push(billboard);

    // Save the updated billboards list back to Redis
    await redis.set(cacheKey, JSON.stringify(billboards), "EX", 3600);

    return NextResponse.json(billboard, { status: 200 });
  } catch (error) {
    console.log(`BILLBOARDS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get all billboards handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }

    const cacheKey = `billboards_${params.storeId}`;
    const cachedBillboards = await redis.get(cacheKey);

    if (cachedBillboards) {
      return NextResponse.json(JSON.parse(cachedBillboards), { status: 200 });
    }

    const billboards = (
      await getDocs(collection(doc(db, "stores", params.storeId), "billboards"))
    ).docs.map((doc) => doc.data()) as Billboard[];

    if (billboards) {
      await redis.set(cacheKey, JSON.stringify(billboards), "EX", 3600);
      return NextResponse.json(billboards, { status: 200 });
    } else {
      return NextResponse.json("Billboards not found", { status: 404 });
    }
  } catch (error) {
    console.log(`BILLBOARDS_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
