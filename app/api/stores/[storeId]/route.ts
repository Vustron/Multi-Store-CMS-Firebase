import {
  getDocs,
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";

// update store handler
export async function PATCH(
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
      return NextResponse.json("Store name is missing", { status: 400 });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store id is missing", { status: 400 });
    }

    const { name } = body;

    const docRef = doc(db, "stores", params.storeId);
    await updateDoc(docRef, { name });
    const store = (await getDoc(docRef)).data() as Store;

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.log(`Stores_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete store handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } },
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
      return NextResponse.json("Store id is missing", { status: 400 });
    }

    const docRef = doc(db, "stores", params.storeId);

    // TODO: delete all sub collections

    await deleteDoc(docRef);

    return NextResponse.json("Store and sub-collections deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`STORES_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get stores by id handler
export async function GET(request: Request) {
  try {
    // get user
    const { userId } = auth();

    // init search params
    const { searchParams } = new URL(request.url);

    // get store id from search params
    const storeId = searchParams.get("storeId");

    // throw error if no user
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    // if there's no userId throw an error
    if (!storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }

    // Initialize store
    let store = null as any;

    // Get stores based on store id and user id
    const storeSnap = await getDocs(
      query(
        collection(db, "stores"),
        where("userId", "==", userId),
        where("id", "==", storeId),
      ),
    );

    // Store the first snapshot found
    storeSnap.forEach((doc) => {
      store = doc.data() as Store;
    });

    if (store) {
      return NextResponse.json(store, { status: 200 });
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
