"use client";

import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboard";
import CreateCategoryForm from "@/components/forms/CreateCategoryForm";
import { useEffect } from "react";

export default function CategoryPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  // get billboard
  const billboard = useGetBillboards({ params });
  // Refetch data when component mounts
  useEffect(() => {
    billboard.refetch();
  }, [billboard.refetch]);
  // set data
  const data = billboard.data || [];
  // init loading state
  const isLoading = billboard.isLoading;

  if (isLoading) {
    return <>...fetching data</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateCategoryForm storeId={params.storeId} billboards={data} />
      </div>
    </div>
  );
}
