"use client";

import { useGetSizeById } from "@/lib/hooks/api/sizes/useGetSizeById";
import UpdateSizeForm from "@/components/forms/UpdateSizeForm";

export default function SizeIdPage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  // get size using id
  const {
    data: size,
    isLoading: loading,
    error: error,
  } = useGetSizeById(params.storeId, params.sizeId);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {loading ? (
          <span>...loading store</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateSizeForm storeId={params.storeId} initialData={size} />
        )}
      </div>
    </div>
  );
}
