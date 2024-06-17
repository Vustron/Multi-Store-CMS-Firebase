"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Order } from "@/lib/helpers/types";

export const useGetOrders = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["orders", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const orders = (
        await getDocs(collection(doc(db, "stores", params.storeId), "orders"))
      ).docs.map((doc) => doc.data()) as Order[];

      return orders;
    },
  });

  return query;
};
