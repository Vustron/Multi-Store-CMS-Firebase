import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Size } from "@/lib/helpers/types";

const fetchKitchen = async (storeId: string, kitchenId: string) => {
  const docRef = doc(db, "stores", storeId, "kitchens", kitchenId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Size;
  } else {
    throw new Error("Kitchen not found");
  }
};

export const useGetKitchenById = (storeId: string, kitchenId: string) => {
  return useQuery({
    queryKey: ["stores", storeId, "kitchens", kitchenId],
    queryFn: async () => fetchKitchen(storeId, kitchenId),
  });
};
