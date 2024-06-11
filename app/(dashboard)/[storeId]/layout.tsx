import { collection, getDocs, query, where } from "firebase/firestore";
import Navbar from "@/components/shared/Navbar";
import { db } from "@/lib/services/firebase";
import { auth } from "@clerk/nextjs/server";
import { Store } from "@/lib/helpers/types";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  // get user id
  const { userId } = auth();
  // redirect if no user
  if (!userId) {
    redirect("/sign-in");
  }

  // init store
  let store = null as any;

  // snapshot all the specific store using
  const storeSnap = await getDocs(
    query(
      collection(db, "stores"),
      where("userId", "==", userId),
      where("id", "==", params.storeId),
    ),
  );

  storeSnap.forEach((doc) => {
    store = doc.data() as Store;
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {children}
    </div>
  );
}
