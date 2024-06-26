"use client";

import { useGetKitchenById } from "@/lib/hooks/api/kitchens/useGetKitchenById";
import UpdateKitchenForm from "@/components/forms/UpdateKitchenForm";
import { Loader2 } from "lucide-react";

export default function KitchenIdPage({
  params,
}: {
  params: { storeId: string; kitchenId: string };
}) {
  // get kitchen using id
  const kitchen = useGetKitchenById(params.storeId, params.kitchenId);
  // set data
  const data = kitchen.data;
  // loading state
  const loading = kitchen.isLoading;
  // error state
  const error = kitchen.error;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {loading ? (
          <>
            <Loader2 className="h-6 animate-spin" />
          </>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateKitchenForm storeId={params.storeId} initialData={data} />
        )}
      </div>
    </div>
  );
}
