import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetStoreInfo = ({ storeId }: { storeId: string }) => {
  const query = useQuery({
    queryKey: ["stores", { storeId }],
    queryFn: async () => {
      // get store info
      const { data } = await axios.get(`/api/stores/${storeId}`);
      return data;
    },
  });

  return query;
};
