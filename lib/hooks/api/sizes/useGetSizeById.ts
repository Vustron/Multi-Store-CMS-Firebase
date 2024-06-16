import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Size } from "@/lib/helpers/types";

const fetchSize = async (storeId: string, sizeId: string) => {
  const docRef = doc(db, "stores", storeId, "sizes", sizeId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Size;
  } else {
    throw new Error("Size not found");
  }
};

export const useGetSizeById = (storeId: string, sizeId: string) => {
  return useQuery({
    queryKey: ["sizes", storeId, sizeId],
    queryFn: async () => fetchSize(storeId, sizeId),
  });
};
