import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Store } from "@/lib/helpers/types";

export const useGetStore = ({ storeId }: { storeId: string }) => {
  const query = useQuery({
    queryKey: ["stores", { storeId }],
    queryFn: async () => {
      // get store
      const store = (await getDoc(doc(db, "stores", storeId))).data() as Store;
      return store;
      // const { data } = await axios.get(`/api/stores/${storeId}`);
      // return data;
    },
  });

  return query;
};
