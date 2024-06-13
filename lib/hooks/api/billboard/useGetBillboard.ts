"use client";

import { doc, getDocs, collection } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Billboards } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetBillboards = ({
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
      const billboards = (
        await getDocs(
          collection(doc(db, "stores", params.storeId), "billboards"),
        )
      ).docs.map((doc) => doc.data()) as Billboards[];

      return billboards;
    },
  });

  return query;
};
