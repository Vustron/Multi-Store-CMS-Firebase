import { collection, getDocs, query, where } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
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

export const useStores = (userId: string) => {
  return useQuery({
    queryKey: ["stores", userId],
    enabled: !!userId,
    queryFn: () => fetchStores(userId),
  });
};
