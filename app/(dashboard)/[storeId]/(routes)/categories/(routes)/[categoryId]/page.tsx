"use client";

import { useGetCategoryById } from "@/lib/hooks/api//categories/useGetCategoryById";
import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboards";
import UpdateCategoryForm from "@/components/forms/UpdateCategoryForm";
import { Loader2 } from "lucide-react";


export default function CategoryIdPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  // get category using id
  const category = useGetCategoryById(params.storeId, params.categoryId);
  // get billboard
  const billboard = useGetBillboards({ params });
  // set data
  const billboardData = billboard.data || [];
  const categoryData = category.data;
  // loading state
  const loading = billboard.isLoading || category.isLoading;
  // error state
  const error = billboard.error || category.error;

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
          <UpdateCategoryForm
            storeId={params.storeId}
            initialData={categoryData}
            billboards={billboardData}
            categoryId={params.categoryId}
          />
        )}
      </div>
    </div>
  );
}
