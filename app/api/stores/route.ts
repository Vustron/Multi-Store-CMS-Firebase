import {
  doc,
  getDocs,
  addDoc,
  collection,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";

// create new store handler
export async function POST(request: NextRequest) {
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
    // assign data
    const { name } = body;
    const storeData = {
      name,
      userId,
      createdAt: serverTimestamp(),
    };
    // add data to firestore and retrieve reference id
    const storeRef = await addDoc(collection(db, "stores"), storeData);
    // get reference id
    const id = storeRef.id;

    await updateDoc(doc(db, "stores", id), {
      ...storeData,
      id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...storeData }, { status: 200 });
  } catch (error) {
    console.log(`Stores_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get all stores handler
export async function GET() {
  try {
    // get user
    const { userId } = auth();

    // throw error if no user
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    // Initialize store
    let store = null as any;

    // Get all stores for the userId
    const storeSnap = await getDocs(
      query(collection(db, "stores"), where("userId", "==", userId)),
    );

    // Store the first snapshot found
    storeSnap.forEach((doc) => {
      store = doc.data() as Store;
      return; // Exit the loop after the first store is found
    });

    if (store) {
      return NextResponse.json({ storeId: store.id }, { status: 200 });
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
