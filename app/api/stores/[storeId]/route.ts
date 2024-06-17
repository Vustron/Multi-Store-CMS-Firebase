import {
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { NextResponse, NextRequest } from "next/server";
import { db, storage } from "@/lib/services/firebase";
import { deleteObject, ref } from "firebase/storage";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import redis from "@/lib/services/redis";

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
    if (!body || !body.name) {
      return NextResponse.json("Store name is missing", { status: 400 });
    }
    // throw error if no store id
    if (!params.storeId) {
      return NextResponse.json("Store id is missing", { status: 400 });
    }

    const { name } = body;

    const docRef = doc(db, "stores", params.storeId);
    await updateDoc(docRef, { name });

    // Fetch the updated document to get the actual timestamp
    const updatedStoreDoc = await getDoc(doc(db, "stores", params.storeId));
    const updatedStore = updatedStoreDoc.data() as Store;

    // Update the Redis cache
    const cacheKey = `stores_${params.storeId}`;
    const cachedStores = await redis.get(cacheKey);
    const stores = cachedStores ? JSON.parse(cachedStores) : [];

    // Find and update the specific store in the cached list
    const index = stores.findIndex((c: Store) => c.id === params.storeId);
    if (index !== -1) {
      stores[index] = updatedStore;
    } else {
      stores.push(updatedStore); // If store is not in cache, add it
    }

    // Save the updated stores list back to Redis
    await redis.set(cacheKey, JSON.stringify(stores));

    return NextResponse.json(updatedStore, { status: 200 });
  } catch (error) {
    console.log(`STORES_PATCH: ${error}`);
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
    // get id
    const docRef = doc(db, "stores", params.storeId);

    // delete billboards
    const billboardsQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/billboards`),
    );

    billboardsQuerySnapshot.forEach(async (billboardDoc) => {
      await deleteDoc(billboardDoc.ref);

      // remove images from storage
      const imageUrl = billboardDoc.data().imageUrl;
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    });

    // delete categories
    const categoriesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/categories`),
    );

    categoriesQuerySnapshot.forEach(async (categoriesDoc) => {
      await deleteDoc(categoriesDoc.ref);
    });

    // delete sizes
    const sizesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/sizes`),
    );

    sizesQuerySnapshot.forEach(async (sizesDoc) => {
      await deleteDoc(sizesDoc.ref);
    });

    // delete kitchens
    const kitchensQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/kitchens`),
    );

    kitchensQuerySnapshot.forEach(async (kitchensDoc) => {
      await deleteDoc(kitchensDoc.ref);
    });

    // delete cuisines
    const cuisinesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/cuisines`),
    );

    cuisinesQuerySnapshot.forEach(async (cuisinesDoc) => {
      await deleteDoc(cuisinesDoc.ref);
    });

    // products and its images
    const productsQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/products`),
    );

    productsQuerySnapshot.forEach(async (productsDoc) => {
      await deleteDoc(productsDoc.ref);

      // remove images from storage
      const imagesArray = productsDoc.data().images;
      if (imagesArray && Array.isArray(imagesArray)) {
        await Promise.all(
          imagesArray.map(async (image) => {
            const imageRef = ref(storage, image.url);
            await deleteObject(imageRef);
          }),
        );
      }
    });

    // orders and its images
    const ordersQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/orders`),
    );

    // Helper function to delete images
    const deleteImages = async (images: any[]) => {
      if (!Array.isArray(images)) return;
      await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, image.url);
          await deleteObject(imageRef);
        }),
      );
    };

    // Helper function to process order items
    const processOrderItems = async (orderItems: any[]) => {
      if (!Array.isArray(orderItems)) return;
      await Promise.all(
        orderItems.map(async (orderItem) => {
          await deleteImages(orderItem.images);
        }),
      );
    };

    // Process each order
    await Promise.all(
      ordersQuerySnapshot.docs.map(async (ordersDoc) => {
        await deleteDoc(ordersDoc.ref);
        const ordersItemArray = ordersDoc.data().orderItems;
        await processOrderItems(ordersItemArray);
      }),
    );

    // delete store
    await deleteDoc(docRef);

    // Invalidate the Redis cache
    const cacheKeys = [
      `stores_${params.storeId}`,
      `billboards_${params.storeId}`,
      `categories_${params.storeId}`,
      `sizes_${params.storeId}`,
      `kitchens_${params.storeId}`,
      `cuisines_${params.storeId}`,
      `products_${params.storeId}`,
      `orders_${params.storeId}`,
    ];

    await Promise.all(cacheKeys.map((key) => redis.del(key)));

    return NextResponse.json("Store and sub-collections deleted", {
      status: 200,
    });
  } catch (error) {
    console.log(`STORES_DELETE: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}

// get stores by id handler
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
    const cacheKey = `stores_${params.storeId}`;
    const cachedStore = await redis.get(cacheKey);

    if (cachedStore) {
      return NextResponse.json(JSON.parse(cachedStore), { status: 200 });
    }

    // get store if no redis cache
    const stores = (
      await getDoc(doc(db, "stores", params.storeId))
    ).data() as Store;

    if (stores) {
      // set the new stores data into redis cache
      await redis.set(cacheKey, JSON.stringify(stores));
      return NextResponse.json(stores, { status: 200 });
    } else {
      return NextResponse.json("Store not found", { status: 404 });
    }
  } catch (error) {
    console.log(`STORE_ID_GET: ${error}`);
    return NextResponse.json("Internal Server Error", {
      status: 500,
    });
  }
}
