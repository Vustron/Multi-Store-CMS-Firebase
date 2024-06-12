import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Store } from "@/lib/helpers/types";

export const useGetStoreInfo = ({ storeId }: { storeId: string }) => {
  const query = useQuery({
    queryKey: ["stores", { storeId }],
    queryFn: async () => {
      // get store info
      const store = (await getDoc(doc(db, "stores", storeId))).data() as Store;
      return store;
    },
  });

  return query;
};
