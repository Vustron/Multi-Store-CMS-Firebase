"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Kitchen } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetKitchens = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["kitchens", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const kitchens = (
        await getDocs(collection(doc(db, "stores", params.storeId), "kitchens"))
      ).docs.map((doc) => doc.data()) as Kitchen[];

      return kitchens;
    },
  });

  return query;
};
