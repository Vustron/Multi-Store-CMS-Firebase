import { getDoc, doc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Store } from "@/lib/helpers/types";

export const useGetStore = ({ storeId }: { storeId: string }) => {
  const storesQuery = useQuery({
    queryKey: ["stores", storeId],
    queryFn: async () => {
      const store = (await getDoc(doc(db, "stores", storeId))).data() as Store;
      return store;
    },
  });

  return storesQuery;
};
