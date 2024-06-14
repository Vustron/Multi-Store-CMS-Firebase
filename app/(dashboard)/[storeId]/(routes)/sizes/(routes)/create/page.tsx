"use client";

import CreateCategoryForm from "@/components/forms/CreateCategoryForm";
import CreateSizeForm from "@/components/forms/CreateSizeForm";
import { useGetSizes } from "@/lib/hooks/api/sizes/useGetSizes";
import { useEffect } from "react";

export default function SizePage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  // // get sizes
  // const size = useGetSizes({ params });
  // // Refetch data when component mounts
  // useEffect(() => {
  //   size.refetch();
  // }, [size.refetch]);
  // // set data
  // const data = size.data || [];
  // // init loading state
  // const isLoading = size.isLoading;

  // if (isLoading) {
  //   return <>...fetching data</>;
  // }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateSizeForm storeId={params.storeId} />
      </div>
    </div>
  );
}
