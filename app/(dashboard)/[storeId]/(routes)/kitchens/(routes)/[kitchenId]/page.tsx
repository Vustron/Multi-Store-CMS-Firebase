"use client";

import { useGetKitchenById } from "@/lib/hooks/api/kitchens/useGetKitchenById";
import UpdateKitchenForm from "@/components/forms/UpdateKitchenForm";
import { useEffect } from "react";

export default function KitchenIdPage({
  params,
}: {
  params: { storeId: string; kitchenId: string };
}) {
  // get kitchen using id
  const kitchen = useGetKitchenById(params.storeId, params.kitchenId);

  // Refetch data when component mounts
  useEffect(() => {
    kitchen.refetch();
  }, [kitchen.refetch]);

  // set data
  const data = kitchen.data;
  // init loading
  const isLoading = kitchen.isLoading;

  // loading state
  if (isLoading) {
    return <>...fetching data</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UpdateKitchenForm storeId={params.storeId} initialData={data} />
      </div>
    </div>
  );
}
