"use client";

import { useGetCategoryById } from "@/lib/hooks/api//categories/useGetCategoryById";
import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboard";
import UpdateCategoryForm from "@/components/forms/UpdateCategoryForm";
import { useEffect } from "react";

export default function CategoryIdPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  // get category using id
  const category = useGetCategoryById(params.storeId, params.categoryId);
  // get billboard
  const billboard = useGetBillboards({ params });
  // Refetch data when component mounts
  useEffect(() => {
    category.refetch();
    billboard.refetch();
  }, [category.refetch, billboard.refetch]);
  // set data
  const billboardData = billboard.data || [];
  // set data
  const categoryData = category.data;
  // init loading
  const isLoading = category.isLoading || billboard.isLoading;

  // loading state
  if (isLoading) {
    return <>...fetching category</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UpdateCategoryForm
          storeId={params.storeId}
          initialData={categoryData}
          billboards={billboardData}
          categoryId={params.categoryId}
        />
      </div>
    </div>
  );
}
