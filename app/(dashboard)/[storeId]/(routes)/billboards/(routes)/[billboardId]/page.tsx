"use client";

import { useGetBillboardById } from "@/lib/hooks/api/billboard/useGetBillboardById";
import UpdateBillboardForm from "@/components/forms/UpdateBillboardForm.tsx";

export default function BillboardIdPage({
  params,
}: {
  params: { storeId: string; billboardId: string };
}) {
  // get billboard using id
  const billboard = useGetBillboardById(params.storeId, params.billboardId);
  // set data
  const data = billboard.data;
  // loading state
  const loading = billboard.isLoading;
  // error state
  const error = billboard.error;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {loading ? (
          <span>...loading billboard</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateBillboardForm storeId={params.storeId} initialData={data} />
        )}
      </div>
    </div>
  );
}
