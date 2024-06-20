import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { Order } from "@/lib/helpers/types";

interface GraphData {
  name: string;
  total: number;
}

export const getTotalRevenue = async (
  storeId: string,
): Promise<GraphData[]> => {
  const ordersCollectionRef = collection(doc(db, "stores", storeId), "orders");
  const ordersSnapshot = await getDocs(ordersCollectionRef);
  const ordersData = ordersSnapshot.docs.map((doc) => doc.data() as Order);

  const statusRevenue: { [key: string]: number } = {};

  for (const order of ordersData) {
    const status = order.order_status;

    if (status) {
      let revenueForOrder = 0;

      for (const item of order.orderItems) {
        if (item.qty !== undefined) {
          revenueForOrder += item.price * item.qty;
        } else {
          revenueForOrder += item.price;
        }
      }

      statusRevenue[status] = (statusRevenue[status] || 0) + revenueForOrder;
    }
  }

  const statusMap: { [key: string]: number } = {
    Processing: 0,
    Delivering: 1,
    Delivered: 2,
    Canceled: 3,
  };

  const graphData: GraphData[] = Object.keys(statusMap).map((statusName) => ({
    name: statusName,
    total: statusRevenue[statusName] || 0,
  }));

  return graphData;
};

export const useTotalOrderStatus = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalRevenueOrderStatus", storeId],
    queryFn: async () => {
      const initialDataPromise = getTotalRevenue(storeId);

      onSnapshot(collection(doc(db, "stores", storeId), "orders"), async () => {
        const updatedTotalRevenue = await getTotalRevenue(storeId);
        queryClient.setQueryData(
          ["totalRevenueOrderStatus", storeId],
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
