import {
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db, storage } from "@/lib/services/firebase";
import { deleteObject, ref } from "firebase/storage";
import { Order, Product } from "@/lib/helpers/types";
import { auth } from "@clerk/nextjs/server";
import redis from "@/lib/services/redis";

// patch order handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; orderId: string } },
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

    // throw error if no product id
    if (!params.orderId) {
      return NextResponse.json("Order ID is missing", {
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

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }
    // add data to firestore and retrieve reference id
    const orderRef = await getDoc(
      doc(db, "stores", params.storeId, "orders", params.orderId),
    );
    // update the order data if exists
    if (orderRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "orders", params.orderId),
        {
          ...orderRef.data(),
          phone,
          address,
          products,
          totalPrice,
          images,
          isPaid,
          order_status,
          updatedAt: serverTimestamp(),
        },
      );
    } else {
      return NextResponse.json("Order not found", { status: 404 });
    }

    // Fetch the updated document to get the actual timestamp
    const updatedOrderDoc = await getDoc(
      doc(db, "stores", params.storeId, "orders", params.orderId),
    );
    const updatedOrder = updatedOrderDoc.data() as Order;

    // Update the Redis cache
    const cacheKey = `orders_${params.storeId}`;
    const cachedOrders = await redis.get(cacheKey);
    const orders = cachedOrders ? JSON.parse(cachedOrders) : [];

    // Find and update the specific order in the cached list
    const index = orders.findIndex((c: Order) => c.id === params.orderId);
    if (index !== -1) {
      orders[index] = updatedOrder;
    } else {
      orders.push(updatedOrder); // If order is not in cache, add it
    }

    // Save the updated orders list back to Redis
    await redis.set(cacheKey, JSON.stringify(orders), "EX", 3600);

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.log(`ORDER_PATCH: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// delete order handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string; orderId: string } },
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
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }
    // throw error if no category id
    if (!params.orderId) {
      return NextResponse.json("Order ID is missing", {
        status: 400,
      });
    }

    // get store
    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();

      if (storeData?.userId !== userId) {
        return NextResponse.json("Unauthorized access", { status: 500 });
      }
    }

    // get order ref from store
    const orderRef = doc(
      db,
      "stores",
      params.storeId,
      "orders",
      params.orderId,
    );

    // images check
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      return NextResponse.json("Order not found", { status: 404 });
    }

    // delete images if exists
    const images = orderDoc.data()?.images;
    if (images && Array.isArray(images)) {
      await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, image.url);
          await deleteObject(imageRef);
        }),
      );
    }

    // delete if found
    await deleteDoc(orderRef);

    // Invalidate the Redis cache
    const cacheKey = `orders_${params.storeId}`;
    await redis.del(cacheKey);

    return NextResponse.json("Order and associated images deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`ORDER_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get order id handler
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string; orderId: string } },
) {
  try {
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store ID is missing", {
        status: 400,
      });
    }

    // throw error if no order id
    if (!params.orderId) {
      return NextResponse.json("Order ID is missing", {
        status: 400,
      });
    }

    // get redis cache
    const cacheKey = `orders_${params.storeId}`;
    const cachedOrder = await redis.get(cacheKey);

    if (cachedOrder) {
      return NextResponse.json(JSON.parse(cachedOrder), { status: 200 });
    }

    // get order
    const order = (
      await getDoc(doc(db, "stores", params.storeId, "orders", params.orderId))
    ).data() as Order;

    if (order) {
      await redis.set(cacheKey, JSON.stringify(order), "EX", 3600);
      return NextResponse.json(order, { status: 200 });
    } else {
      return NextResponse.json("Order not found", { status: 404 });
    }
  } catch (error) {
    console.log(`ORDER_ID_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
