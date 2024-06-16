import { collection, getDocs, query, where } from "firebase/firestore";
import { Store } from "@/lib/helpers/types";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // get user id
  const { userId } = auth();
  // redirect if no user
  if (!userId) {
    redirect("/sign-in");
  }

  // init store
  let store = null as any;

  // snapshot get all stores by the userId
  const storeSnap = await getDocs(
    query(collection(db, "stores"), where("userId", "==", userId)),
  );

  // store all the
  storeSnap.forEach((doc) => {
    store = doc.data() as Store;
    return;
  });

  if (store) {
    redirect(`/${store?.id}`);
  }

  return <>{children}</>;
}
