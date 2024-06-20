import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";

export const getTotalProducts = async (storeId: string) => {
  // order ref
  const productsData = await getDocs(
    collection(doc(db, "stores", storeId), "products"),
  );

  // get products
  const count = productsData.size;

  return count;
};

export const useTotalProducts = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalProducts", storeId],
    queryFn: async () => {
      const productsCollectionRef = collection(
        doc(db, "stores", storeId),
        "products",
      );

      const initialDataPromise = getDocs(productsCollectionRef).then(
        (productsSnapshot) => productsSnapshot.size,
      );

      onSnapshot(productsCollectionRef, (snapshot) => {
        queryClient.setQueryData(["totalProducts", storeId], snapshot.size);
      });

      const initialData = await initialDataPromise;

      return initialData;
    },
    enabled: !!storeId,
    staleTime: Infinity,
  });
};
