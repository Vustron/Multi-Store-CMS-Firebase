"use client";

import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { useStores } from "@/lib/hooks/api/stores/useStores";
import StoreSwitcher from "./StoreSwitcher";
import { Loader2 } from "lucide-react";
import MainNav from "./MainNav";

const Navbar = ({ userId }: { userId: string }) => {
  // fetch data
  const { data: stores, isLoading, error } = useStores(userId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading stores</div>;
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* store switcher */}
        <StoreSwitcher items={stores} />

        {/* main nav */}
        <MainNav />

        {/* user button */}
        <div className="ml-auto">
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>

          <ClerkLoading>
            <Loader2 className="animate-spin text-slate-400" />
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
