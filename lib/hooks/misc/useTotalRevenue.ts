import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Order } from "@/lib/helpers/types";


export const getTotalRevenue = async (storeId: string): Promise<number> => {
  const ordersCollectionRef = collection(doc(db, "stores", storeId), "orders");
  const ordersSnapshot = await getDocs(ordersCollectionRef);
  const ordersData = ordersSnapshot.docs.map((doc) => doc.data() as Order);

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.price * (item.qty ?? 1);
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};

export const useTotalRevenue = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalRevenue", storeId],
    queryFn: async () => {
      const ordersCollectionRef = collection(
        doc(db, "stores", storeId),
        "orders",
      );

      const initialDataPromise = getTotalRevenue(storeId);

      onSnapshot(ordersCollectionRef, async () => {
        const updatedTotalRevenue = await getTotalRevenue(storeId);
        queryClient.setQueryData(
          ["totalRevenue", storeId],
          updatedTotalRevenue,
        );
      });

      const initialData = await initialDataPromise;
      return initialData;
    },
    enabled: !!storeId,
    staleTime: Infinity,
  });
};
