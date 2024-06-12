"use client";

import { useGetStore } from "@/lib/hooks/api/stores/useGetStore";
import { useRouter } from "next/navigation";

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
  // set data
  const data = store.data;
  // init loading state
  const isLoading = store.isLoading;

  if (isLoading) {
    return <>...fetching store</>;
  }

  // if empty redirect
  if (!data) {
    router.push("/");
  }

  return <>Overview: {data?.name}</>;
}
