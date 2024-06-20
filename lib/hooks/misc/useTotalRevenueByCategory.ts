import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Category, Order } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";

interface GraphData {
  name: string;
  total: number;
}

export const getTotalRevenue = async (
  storeId: string,
): Promise<GraphData[]> => {
  // Fetch orders
  const ordersCollectionRef = collection(doc(db, "stores", storeId), "orders");
  const ordersSnapshot = await getDocs(ordersCollectionRef);
  const ordersData = ordersSnapshot.docs.map((doc) => doc.data() as Order);

  // Fetch categories
  const categoriesCollectionRef = collection(
    doc(db, "stores", storeId),
    "categories",
  );
  const categoriesSnapshot = await getDocs(categoriesCollectionRef);
  const categoriesData = categoriesSnapshot.docs.map(
    (doc) => doc.data() as Category,
  );

  const categoryRevenue: { [key: string]: number } = {};

  // Calculate revenue by category
  for (const order of ordersData) {
    for (const item of order.orderItems) {
      const category = item.category;

      if (category) {
        let revenueForItem = item.price * (item.qty ?? 1);
        categoryRevenue[category] =
          (categoryRevenue[category] || 0) + revenueForItem;
      }
    }
  }

  // Ensure all categories are included in the graph data
  for (const category of categoriesData) {
    categoryRevenue[category.name] = categoryRevenue[category.name] || 0;
  }

  // Convert to GraphData format
  const graphData: GraphData[] = categoriesData.map((category) => ({
    name: category.name,
    total: categoryRevenue[category.name] || 0,
  }));

  return graphData;
};

export const useTotalRevenueByCategory = (storeId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["totalRevenueCategory", storeId],
    queryFn: async () => {
      const initialDataPromise = getTotalRevenue(storeId);

      onSnapshot(collection(doc(db, "stores", storeId), "orders"), async () => {
        const updatedTotalRevenue = await getTotalRevenue(storeId);
        queryClient.setQueryData(
          ["totalRevenueCategory", storeId],
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
