import {
  collection,
  getDocs,
  query as firestoreQuery,
  where,
} from "firebase/firestore";

import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import { redirect } from "next/navigation";
import StoreSwitcher from "./StoreSwitcher";
import { UserButton } from "@clerk/nextjs";
import MainNav from "./MainNav";

const Navbar = async () => {
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

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNav />
        <div className="ml-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
