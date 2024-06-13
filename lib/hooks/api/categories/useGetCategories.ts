"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetCategories = ({
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
      const categories = (
        await getDocs(
          collection(doc(db, "stores", params.storeId), "categories"),
        )
      ).docs.map((doc) => doc.data()) as Category[];

      return categories;
    },
  });

  return query;
};
