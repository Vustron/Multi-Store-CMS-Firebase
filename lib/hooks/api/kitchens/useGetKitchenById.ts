import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Kitchen } from "@/lib/helpers/types";

const fetchKitchen = async (storeId: string, kitchenId: string) => {
  const docRef = doc(db, "stores", storeId, "kitchens", kitchenId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Kitchen;
  } else {
    throw new Error("Kitchen not found");
  }
};

export const useGetKitchenById = (storeId: string, kitchenId: string) => {
  return useQuery({
    queryKey: ["kitchens", storeId, kitchenId],
    queryFn: async () => fetchKitchen(storeId, kitchenId),
  });
};
