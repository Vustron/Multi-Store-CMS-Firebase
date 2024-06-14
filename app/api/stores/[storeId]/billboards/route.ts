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
import { Billboards } from "@/lib/helpers/types";
import redisClient from "@/lib/services/redis";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";

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

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const billboardData = {
      label,
      imageUrl,
      createdAt: serverTimestamp(),
    };

    const billboardRef = await addDoc(
      collection(db, "stores", params.storeId, "billboards"),
      billboardData,
    );

    const id = billboardRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "billboards", id), {
      ...billboardData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Invalidate the Redis cache
    const cacheKey = `billboards_${params.storeId}`;
    await redisClient.del(cacheKey);

    return NextResponse.json({ id, ...billboardData }, { status: 200 });
  } catch (error) {
    console.log(`BILLBOARDS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get all stores handler
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
    const cachedBillboards = await redisClient.get(cacheKey);

    if (cachedBillboards) {
      return NextResponse.json(JSON.parse(cachedBillboards), { status: 200 });
    }

    const billboardsData = (
      await getDocs(collection(doc(db, "stores", params.storeId), "billboards"))
    ).docs.map((doc) => doc.data()) as Billboards[];

    await redisClient.set(cacheKey, JSON.stringify(billboardsData), {
      EX: 60 * 60, // Cache expires in 1 hour
    });

    return NextResponse.json(billboardsData, { status: 200 });
  } catch (error) {
    console.log(`BILLBOARDS_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
