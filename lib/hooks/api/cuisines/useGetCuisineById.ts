import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Size } from "@/lib/helpers/types";

const fetchCuisine = async (storeId: string, cuisineId: string) => {
  const docRef = doc(db, "stores", storeId, "cuisines", cuisineId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Size;
  } else {
    throw new Error("Cuisine not found");
  }
};

export const useGetCuisineById = (storeId: string, cuisineId: string) => {
  return useQuery({
    queryKey: ["cuisines", storeId, cuisineId],
    queryFn: async () => fetchCuisine(storeId, cuisineId),
  });
};
