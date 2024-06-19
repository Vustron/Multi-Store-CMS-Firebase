"use client";

import { doc, collection, onSnapshot } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Order } from "@/lib/helpers/types";

export const useGetOrders = ({ params }: { params: { storeId: string } }) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      return new Promise<Order[]>((resolve, reject) => {
        const ordersRef = collection(
          doc(db, "stores", params.storeId),
          "orders",
        );

        // Setting up the snapshot listener
        const unsubscribe = onSnapshot(
          ordersRef,
          (snapshot) => {
            const orders = snapshot.docs.map((doc) => doc.data() as Order);

            // Update the query data in React Query's cache
            queryClient.setQueryData(["orders", params.storeId], orders);
            resolve(orders);
          },
          (error) => {
            console.error("Error fetching orders: ", error);
            reject(error);
          },
        );

        return () => unsubscribe();
      });
    },
  });

  return query;
};
