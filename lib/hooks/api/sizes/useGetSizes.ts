"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Size } from "@/lib/helpers/types";

export const useGetSizes = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["stores", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const sizes = (
        await getDocs(collection(doc(db, "stores", params.storeId), "sizes"))
      ).docs.map((doc) => doc.data()) as Size[];

      return sizes;
    },
  });

  return query;
};
