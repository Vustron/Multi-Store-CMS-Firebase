import { getDoc, doc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Store } from "@/lib/helpers/types";

export const useGetStoreById = (storeId: string) => {
  return useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (!storeDoc.exists()) {
        throw new Error("Store not found");
      }
      return storeDoc.data() as Store;
    },
    enabled: !!storeId, // Ensure the query runs only if storeId is provided
  });
};
