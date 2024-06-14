"use client";

import { useGetStore } from "@/lib/hooks/api/stores/useGetStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function OverviewPage({ params }: Props) {
  // init router
  const router = useRouter();
  // get store
  const store = useGetStore(params);
  // Refetch data when component mounts
  useEffect(() => {
    store.refetch();
  }, [store.refetch]);
  // set data
  const data = store?.data;
  // init loading state
  const isLoading = store.isLoading;

  if (isLoading) {
    return <>...fetching store</>;
  }

  // if empty redirect
  if (!store) {
    router.push("/");
  }

  return <>Overview: {data!.name}</>;
}
