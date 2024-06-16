"use client";

import { useGetSizes } from "@/lib/hooks/api/sizes/useGetSizes";
import { SizeColumns } from "./columns";
import SizesClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function SizesPage({ params }: Props) {
  // get category
  const sizes = useGetSizes({ params });
  // set data
  const data = sizes.data || [];
  // loading state
  const loading = sizes.isLoading;
  // error state
  const error = sizes.error;

  const formattedData: SizeColumns[] = data.map((item) => ({
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
          <span>...loading sizes</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <SizesClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
