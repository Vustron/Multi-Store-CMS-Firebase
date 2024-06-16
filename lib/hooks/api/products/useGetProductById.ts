import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Product } from "@/lib/helpers/types";

const fetchProduct = async (storeId: string, productId: string) => {
  const docRef = doc(db, "stores", storeId, "products", productId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Product;
  } else {
    throw new Error("Product not found");
  }
};

export const useGetProductById = (storeId: string, productId: string) => {
  return useQuery({
    queryKey: ["products", storeId, productId],
    queryFn: async () => fetchProduct(storeId, productId),
  });
};
