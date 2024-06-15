"use client";

import { useGetCuisines } from "@/lib/hooks/api/cuisines/useGetCuisines";
import { CuisineColumns } from "./columns";
import CuisinesClient from "./client";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function CuisinesPage({ params }: Props) {
  // get cuisines
  const cuisines = useGetCuisines({ params });

  // Refetch data when component mounts
  useEffect(() => {
    cuisines.refetch();
  }, [cuisines.refetch]);

  // set data
  const data = cuisines.data || [];
  // init loading state
  const isLoading = cuisines.isLoading;

  if (isLoading) {
    return <>...fetching cuisines</>;
  }

  const formattedData: CuisineColumns[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: item.createdAt
      ? format(item.createdAt.toDate(), "MMMM dd yyyy")
      : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CuisinesClient data={formattedData} storeId={params.storeId} />
      </div>
    </div>
  );
}
