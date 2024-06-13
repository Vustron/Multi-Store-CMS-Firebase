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
    if (!body) {
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

    return NextResponse.json({ id, ...billboardData }, { status: 200 });
  } catch (error) {
    console.log(`Stores_POST: ${error}`);
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

    const billboardsData = (
      await getDocs(collection(doc(db, "stores", params.storeId), "billboards"))
    ).docs.map((doc) => doc.data()) as Billboards[];

    return NextResponse.json(billboardsData, { status: 200 });
  } catch (error) {
    console.log(`Stores_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
