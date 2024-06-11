import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/services/firebase";

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

    return NextResponse.json({ id, ...storeData });
  } catch (error) {
    console.log(`Stores_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
