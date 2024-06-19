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
import { headers } from "next/headers";
import Stripe from "stripe";

// checkout handler
export async function POST(request: NextRequest) {
  try {
    // get data
    const body = await request.text();

    // get signature
    const signature = headers().get("Stripe-Signature") as string;

    // stripe even
    let event: Stripe.Event;

    // construct webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // init session
    const session = event.data.object as Stripe.Checkout.Session;

    // get address
    const address = session?.customer_details?.address;

    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ];

    const addressString = addressComponents
      .filter((a) => a !== null)
      .join(", ");

    if (event.type === "checkout.session.completed") {
      console.log(`Order Id: `, session?.metadata?.orderId);

      if (session?.metadata?.orderId) {
        await updateDoc(
          doc(
            db,
            "stores",
            session?.metadata?.storeId,
            "orders",
            session?.metadata?.orderId,
          ),
          {
            isPaid: true,
            address: addressString,
            phone: session?.customer_details?.phone,
            updatedAt: serverTimestamp(),
          },
        );

        // Fetch the updated document to get the actual timestamp
        const updatedOrder = await getDoc(
          doc(
            db,
            "stores",
            session?.metadata?.storeId,
            "orders",
            session?.metadata?.orderId,
          ),
        );
        const order = updatedOrder.data() as Order;

        // Invalidate the Redis cache
        const cacheKey = `orders_${session?.metadata?.storeId}`;
        const cachedOrders = await redis.get(cacheKey);
        const orders = cachedOrders ? JSON.parse(cachedOrders) : [];

        // Append the new order to the cached orders list
        orders.push(order);

        // Save the updated products list back to Redis
        await redis.set(cacheKey, JSON.stringify(orders), "EX", 3600);
      }
    }

    return new NextResponse(JSON.stringify("Paid Successfully"), {
      status: 200,
    });
  } catch (error) {
    console.log(`WEBHOOK_POST: ${error}`);
    new NextResponse(JSON.stringify("Internal Server Error"), {
      status: 500,
    });
  }
}
