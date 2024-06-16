import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Store } from "@/lib/helpers/types";

const fetchStores = async (userId: string): Promise<Store[]> => {
  const storeSnap = await getDocs(
    query(collection(db, "stores"), where("userId", "==", userId)),
  );

  const stores: Store[] = [];
  storeSnap.forEach((doc) => {
    stores.push(doc.data() as Store);
  });

  return stores;
};

export const useGetStores = (userId: string, storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["stores", storeId],
    enabled: !!userId,
    queryFn: () => {
      const storesQuery = query(
        collection(db, "stores"),
        where("userId", "==", userId),
      );

      const unsubscribe = onSnapshot(
        storesQuery,
        async (snapshot) => {
          const updatedStores: Store[] = [];
          snapshot.forEach((doc) => {
            updatedStores.push(doc.data() as Store);
          });

          queryClient.setQueryData(["stores", storeId], updatedStores);
        },
        (error) => {
          console.error("Error fetching stores in real-time: ", error);
        },
      );

      return () => unsubscribe();
    },
  });
};
