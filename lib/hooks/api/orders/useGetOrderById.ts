import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Order } from "@/lib/helpers/types";

const fetchOrder = async (storeId: string, orderId: string) => {
  const docRef = doc(db, "stores", storeId, "orders", orderId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Order;
  } else {
    throw new Error("Order not found");
  }
};

export const useGetOrderById = (storeId: string, orderId: string) => {
  return useQuery({
    queryKey: ["orders", storeId, orderId],
    queryFn: async () => fetchOrder(storeId, orderId),
  });
};
