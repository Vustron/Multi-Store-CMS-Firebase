import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";

export const getTotalSales = async (storeId: string) => {
  const ordersCollectionRef = collection(doc(db, "stores", storeId), "orders");
  const ordersSnapshot = await getDocs(ordersCollectionRef);
  const count = ordersSnapshot.size;
  return count;
};

export const useTotalSales = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalSales", storeId],
    queryFn: async () => {
      const ordersCollectionRef = collection(
        doc(db, "stores", storeId),
        "orders",
      );

      const initialDataPromise = getDocs(ordersCollectionRef).then(
        (ordersSnapshot) => ordersSnapshot.size,
      );

      onSnapshot(ordersCollectionRef, (snapshot) => {
        queryClient.setQueryData(["totalSales", storeId], snapshot.size);
      });

      const initialData = await initialDataPromise;

      return initialData;
    },
    enabled: !!storeId,
    staleTime: Infinity,
  });
};
