"use client";

import { useGetStoreInfo } from "@/lib/hooks/api/stores/useGetStoreInfo";
import SettingsForm from "@/components/forms/SettingsForm";
import { useRouter } from "next/navigation";

interface Props {
  params: {
    storeId: string;
  };
}

export default function SettingsPage({ params }: Props) {
  // init router
  const router = useRouter();
  // get store
  const store = useGetStoreInfo(params);
  // set data
  const data = store.data;
  // init loading state
  const isLoading = store.isLoading;

  if (isLoading) {
    return <>...fetching data</>;
  }

  // if empty redirect
  if (!data) {
    router.push("/");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-5 p-8 pt-6">
        <SettingsForm initialData={data} />
      </div>
    </div>
  );
}
