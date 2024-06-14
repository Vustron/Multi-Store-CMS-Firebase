"use client";

import UpdateSizeForm from "@/components/forms/UpdateSizeForm";
import { useGetSizeById } from "@/lib/hooks/api/sizes/useGetSizeById";
import { useEffect } from "react";

export default function SizeIdPage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  // get size using id
  const size = useGetSizeById(params.storeId, params.sizeId);

  // Refetch data when component mounts
  useEffect(() => {
    size.refetch();
  }, [size.refetch]);

  // set data
  const data = size.data;
  // init loading
  const isLoading = size.isLoading;

  // loading state
  if (isLoading) {
    return <>...fetching data</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UpdateSizeForm storeId={params.storeId} initialData={data} />
      </div>
    </div>
  );
}
