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
import { Category } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";

// create new category handler
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
    if (!body) {
      return NextResponse.json(
        "Category Name or Billboard name or Billboard ID is missing",
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
    const { name, billboardLabel, billboardId } = body;

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    const categoryData = {
      name,
      billboardLabel,
      billboardId,
      createdAt: serverTimestamp(),
    };

    const categoryRef = await addDoc(
      collection(db, "stores", params.storeId, "categories"),
      categoryData,
    );

    const id = categoryRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "categories", id), {
      ...categoryData,
      id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...categoryData }, { status: 200 });
  } catch (error) {
    console.log(`CATEGORIES_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get all categories handler
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

    const categoriesData = (
      await getDocs(collection(doc(db, "stores", params.storeId), "categories"))
    ).docs.map((doc) => doc.data()) as Category[];

    return NextResponse.json(categoriesData, { status: 200 });
  } catch (error) {
    console.log(`CATEGORIES_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
