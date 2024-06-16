"use client";

import { useGetCuisineById } from "@/lib/hooks/api/cuisines/useGetCuisineById";
import UpdateCuisineForm from "@/components/forms/UpdateCuisineForm";

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
          <span>...loading cuisine</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateCuisineForm storeId={params.storeId} initialData={data} />
        )}
      </div>
    </div>
  );
}
