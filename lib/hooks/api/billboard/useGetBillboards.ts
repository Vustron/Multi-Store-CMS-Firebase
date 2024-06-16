"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Billboard } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetBillboards = ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["billboards", params.storeId],
    enabled: !!params.storeId,
    queryFn: async () => {
      const billboards = (
        await getDocs(
          collection(doc(db, "stores", params.storeId), "billboards"),
        )
      ).docs.map((doc) => doc.data()) as Billboard[];

      billboards.sort((a, b) => a.label.localeCompare(b.label));

      return billboards;
    },
  });

  return query;
};
