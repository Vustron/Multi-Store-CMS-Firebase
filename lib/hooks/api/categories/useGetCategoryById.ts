import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { Category } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

const fetchCategory = async (storeId: string, categoryId: string) => {
  const docRef = doc(db, "stores", storeId, "categories", categoryId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Category;
  } else {
    throw new Error("Billboard not found");
  }
};

export const useGetCategoryById = (storeId: string, categoryId: string) => {
  return useQuery({
    queryKey: ["categories", storeId, categoryId],
    queryFn: async () => fetchCategory(storeId, categoryId),
  });
};
