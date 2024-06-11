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

export const useGetStoreById = () => {
  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      // get user id
      const { userId } = auth();
      // redirect if no user
      if (!userId) {
        redirect("/sign-in");
      }

      // get storesnap using id
      const storeSnap = await getDocs(
        firestoreQuery(collection(db, "stores"), where("userId", "==", userId)),
      );

      let stores = [] as Store[];

      storeSnap.forEach((doc) => {
        stores.push(doc.data() as Store);
      });
    },
  });

  return storesQuery;
};
