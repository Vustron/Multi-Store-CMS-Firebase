"use client";

import { useGetCuisineById } from "@/lib/hooks/api/cuisines/useGetCuisineById";
import UpdateCuisineForm from "@/components/forms/UpdateCuisineForm";
import { useEffect } from "react";

export default function CuisineIdPage({
  params,
}: {
  params: { storeId: string; cuisineId: string };
}) {
  // get cuisine using id
  const cuisine = useGetCuisineById(params.storeId, params.cuisineId);

  // Refetch data when component mounts
  useEffect(() => {
    cuisine.refetch();
  }, [cuisine.refetch]);

  // set data
  const data = cuisine.data;
  // init loading
  const isLoading = cuisine.isLoading;

  // loading state
  if (isLoading) {
    return <>...fetching data</>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UpdateCuisineForm storeId={params.storeId} initialData={data} />
      </div>
    </div>
  );
}
