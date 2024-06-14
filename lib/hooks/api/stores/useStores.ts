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
import { useEffect } from "react";

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

export const useStores = (userId: string) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["stores", userId],
    enabled: !!userId,
    queryFn: () => fetchStores(userId),
  });

  useEffect(() => {
    if (!userId) return;

    const storesQuery = query(
      collection(db, "stores"),
      where("userId", "==", userId),
    );

    const unsubscribe = onSnapshot(
      storesQuery,
      (snapshot) => {
        const updatedStores: Store[] = [];
        snapshot.forEach((doc) => {
          updatedStores.push(doc.data() as Store);
        });

        queryClient.setQueryData(["stores", userId], updatedStores);
      },
      (error) => {
        console.error("Error fetching stores in real-time: ", error);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);

  return queryResult;
};
