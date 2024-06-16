"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Cuisine } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetCuisines = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["cuisines", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const cuisines = (
        await getDocs(collection(doc(db, "stores", params.storeId), "cuisines"))
      ).docs.map((doc) => doc.data()) as Cuisine[];

      return cuisines;
    },
  });

  return query;
};
