"use client";

import { useGetCuisines } from "@/lib/hooks/api/cuisines/useGetCuisines";
import { CuisineColumns } from "./columns";
import { Loader2 } from "lucide-react";
import CuisinesClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function CuisinesPage({ params }: Props) {
  // get cuisines
  const cuisines = useGetCuisines({ params });
  // set data
  const data = cuisines.data || [];
  // loading state
  const loading = cuisines.isLoading;
  // error state
  const error = cuisines.error;

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
        {loading ? (
          <>
            <Loader2 className="h-6 animate-spin" />
          </>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <CuisinesClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
