import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { NextRequest, NextResponse } from "next/server";
import { Order, Product } from "@/lib/helpers/types";
import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/services/firebase";
import redis from "@/lib/services/redis";
import Stripe from "stripe";

// checkout handler
export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } },
) {
  try {
    // get data
    const { products, userId } = await request.json();

    // set data
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((item: Product) => {
      line_items.push({
        quantity: item.qty,
        price_data: {
          currency: "PHP",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
      });
    });

    // add document to firestore
    const orderData = {
      isPaid: false,
      orderItems: products,
      userId,
      order_status: "Processing",
      createdAt: serverTimestamp(),
    };

    // set orderRef
    const orderRef = await addDoc(
      collection(db, "stores", params.storeId, "orders"),
      orderData,
    );

    const id = orderRef.id;

    // update doc
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

    // init stripe session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "IN"],
      },
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.NEXT_PUBLIC_CLIENT_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: id,
        storeId: params.storeId,
      },
    });

    // Invalidate the Redis cache
    const cacheKey = `orders_${params.storeId}`;
    const cachedOrders = await redis.get(cacheKey);
    const orders = cachedOrders ? JSON.parse(cachedOrders) : [];

    // Append the new order to the cached orders list
    orders.push(order);

    // Save the updated products list back to Redis
    await redis.set(cacheKey, JSON.stringify(orders), "EX", 3600);

    return new NextResponse(JSON.stringify(session), {
      status: 200,
    });
  } catch (error) {
    console.log(`CHECKOUT_POST: ${error}`);
    new NextResponse(JSON.stringify("Internal Server Error"), {
      status: 500,
    });
  }
}
