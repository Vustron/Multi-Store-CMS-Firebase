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
import { Order } from "@/lib/helpers/types";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// create new order handler
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
    const requiredFields = [
      "phone",
      "address",
      "products",
      "totalPrice",
      "images",
      "isPaid",
      "order_status",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(`Order ${field} is missing`, {
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
      phone,
      address,
      products,
      totalPrice,
      images,
      isPaid,
      order_status,
    } = body;
    const orderData = {
      phone,
      address,
      products,
      totalPrice,
      images,
      isPaid,
      order_status,
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
    const orderRef = await addDoc(
      collection(db, "stores", params.storeId, "orders"),
      orderData,
    );
    // get reference id
    const id = orderRef.id;
    // update newly created order data
    await updateDoc(doc(db, "stores", params.storeId, "orders", id), {
      ...orderData,
      id,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated document to get the actual timestamp
    const updatedOrder = await getDoc(
      doc(db, "stores", params.storeId, "orders", id),
    );
    const order = updatedOrder.data() as Order;

    // Invalidate the Redis cache
    const cacheKey = `orders_${params.storeId}`;
    const cachedOrders = await redis.get(cacheKey);
    const orders = cachedOrders ? JSON.parse(cachedOrders) : [];

    // Append the new order to the cached orders list
    orders.push(order);

    // Save the updated products list back to Redis
    await redis.set(cacheKey, JSON.stringify(orders), "EX", 3600);

    return NextResponse.json({ id, ...orderData }, { status: 200 });
  } catch (error) {
    console.log(`ORDERS_POST: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get order handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // if there's no userId throw an error
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", { status: 400 });
    }

    // get redis cache
    const cacheKey = `orders_${params.storeId}`;
    const cachedOrder = await redis.get(cacheKey);

    if (cachedOrder) {
      return NextResponse.json(JSON.parse(cachedOrder), { status: 200 });
    }

    // get orders if no redis cache
    const orders = (
      await getDocs(collection(doc(db, "stores", params.storeId), "orders"))
    ).docs.map((doc) => doc.data()) as Order[];

    if (orders) {
      await redis.set(cacheKey, JSON.stringify(orders), "EX", 3600);
      return NextResponse.json(orders, { status: 200 });
    } else {
      return NextResponse.json("Orders not found", { status: 404 });
    }
  } catch (error) {
    console.log(`ORDERS_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
