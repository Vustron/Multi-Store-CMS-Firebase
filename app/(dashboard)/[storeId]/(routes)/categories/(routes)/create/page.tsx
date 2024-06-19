"use client";

import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboards";
import CreateCategoryForm from "@/components/forms/CreateCategoryForm";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";
import { Loader2 } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  // get billboard
  const billboard = useGetBillboards({ params });
  // set data
  const data = billboard.data || [];
  // loading state
  const loading = billboard.isLoading;
  // error state
  const error = billboard.error;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new category"}
            description="Create categories for your store"
          />
        </div>

        <Separator />

        {loading ? (
          <>
            <Loader2 className="h-6 animate-spin" />
          </>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <CreateCategoryForm storeId={params.storeId} billboards={data} />
        )}
      </div>
    </div>
  );
}
