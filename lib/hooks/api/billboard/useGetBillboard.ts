import { getDoc, doc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Billboards } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

export const useGetBillboards = ({
  params,
}: {
  params: {
    storeId: string;
    billboardId: string;
  };
}) => {
  const query = useQuery({
    queryKey: ["stores", params.storeId, "billboards", params.billboardId],
    enabled: !!params.storeId && !!params.billboardId,
    queryFn: async () => {
      // Get the document from Firestore
      const storeDoc = await getDoc(
        doc(db, "stores", params.storeId, "billboards", params.billboardId),
      );
      const store = storeDoc.data() as Billboards;
      return store;
    },
  });

  return query;
};
