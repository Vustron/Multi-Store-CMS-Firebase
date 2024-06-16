"use client";

import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { useGetStores } from "@/lib/hooks/api/stores/useGetStores";
import { Store } from "@/lib/helpers/types";
import StoreSwitcher from "./StoreSwitcher";
import { Loader2 } from "lucide-react";
import MainNav from "./MainNav";

const Navbar = ({ userId, storeId }: { userId: string; storeId: string }) => {
  // fetch data
  const stores = useGetStores(userId, storeId);
  // set data
  const data = stores.data as unknown as Store[];
  // loading state
  const loading = stores.isLoading;
  // error state
  const error = stores.error;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* store switcher */}
        {loading ? (
          <span>...loading stores</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <StoreSwitcher items={data || []} />
        )}

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
