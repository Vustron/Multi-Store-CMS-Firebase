import {
  collection,
  getDocs,
  query as firestoreQuery,
  where,
} from "firebase/firestore";

import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import { redirect } from "next/navigation";

export const useGetStores = () => {
  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      // get user id
      const { userId } = auth();

      // init store
      let store = null as any;

      const storeSnap = await getDocs(
        firestoreQuery(collection(db, "stores"), where("userId", "==", userId)),
      );

      storeSnap.forEach((doc) => {
        store = doc.data() as Store;
        return;
      });

      if (store) {
        redirect(`/${store?.id}`);
      }

      if (!store) {
        redirect("/");
      }
    },
  });

  return storesQuery;
};
