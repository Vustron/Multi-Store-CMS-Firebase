"use client";

import { useGetBillboardById } from "@/lib/hooks/api/billboard/useGetBillboardById";
import UpdateBillboardForm from "@/components/forms/UpdateBillboardForm.tsx";

export default function CategoryIdPage({
  params,
}: {
  params: { storeId: string; billboardId: string };
}) {
  // get billboard using id
  const billboard = useGetBillboardById(params.storeId, params.billboardId);
  // set data
  const data = billboard.data;
  // init loading
  const isLoading = billboard.isLoading;

  // loading state
  if (isLoading) {
    return <>...fetching billboard</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UpdateBillboardForm storeId={params.storeId} initialData={data} />
      </div>
    </div>
  );
}
