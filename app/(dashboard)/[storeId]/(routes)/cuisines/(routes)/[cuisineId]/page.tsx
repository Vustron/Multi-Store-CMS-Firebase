"use client";

import { useGetCuisineById } from "@/lib/hooks/api/cuisines/useGetCuisineById";
import UpdateCuisineForm from "@/components/forms/UpdateCuisineForm";
import { Loader2 } from "lucide-react";

export default function CuisineIdPage({
  params,
}: {
  params: { storeId: string; cuisineId: string };
}) {
  // get cuisine using id
  const cuisine = useGetCuisineById(params.storeId, params.cuisineId);
  const data = cuisine.data;
  // loading state
  const loading = cuisine.isLoading;
  // error state
  const error = cuisine.error;

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
          <UpdateCuisineForm storeId={params.storeId} initialData={data} />
        )}
      </div>
    </div>
  );
}
