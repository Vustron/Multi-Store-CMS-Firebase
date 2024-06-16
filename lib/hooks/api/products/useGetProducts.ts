"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetProducts = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["products", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const products = (
        await getDocs(collection(doc(db, "stores", params.storeId), "products"))
      ).docs.map((doc) => doc.data()) as Product[];

      return products;
    },
  });

  return query;
};
