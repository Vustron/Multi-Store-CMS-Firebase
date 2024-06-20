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

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const monthlyRevenue: { [key: string]: number } = {};

  for (const order of paidOrders) {
    const month = order.createdAt
      ?.toDate()
      .toLocaleDateString("en-US", { month: "short" });

    if (month) {
      let revenueForOrder = 0;

      for (const item of order.orderItems) {
        revenueForOrder += item.price * (item.qty ?? 1);
      }

      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    }
  }

  const monthMap: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const graphData: GraphData[] = Object.keys(monthMap).map((monthName) => ({
    name: monthName,
    total: monthlyRevenue[monthName] || 0,
  }));

  return graphData;
};

export const useTotalGraphRevenue = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalRevenuePerMonth", storeId],
    queryFn: async () => {
      const initialDataPromise = getTotalRevenue(storeId);

      onSnapshot(collection(doc(db, "stores", storeId), "orders"), async () => {
        const updatedTotalRevenue = await getTotalRevenue(storeId);
        queryClient.setQueryData(
          ["totalRevenuePerMonth", storeId],
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
