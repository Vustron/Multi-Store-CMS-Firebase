import Navbar from "@/components/shared/Navbar";
import { auth } from "@clerk/nextjs/server";
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

  return (
    <div>
      {/* Navbar */}
      <Navbar userId={userId} storeId={params.storeId} />

      {children}
    </div>
  );
}
