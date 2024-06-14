"use client";

import { useGetSizes } from "@/lib/hooks/api/sizes/useGetSizes";
import { SizeColumns } from "./columns";
import SizesClient from "./client";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function SizesPage({ params }: Props) {
  // get category
  const sizes = useGetSizes({ params });

  // Refetch data when component mounts
  useEffect(() => {
    sizes.refetch();
  }, [sizes.refetch]);

  // set data
  const data = sizes.data || [];
  // init loading state
  const isLoading = sizes.isLoading;

  if (isLoading) {
    return <>...fetching sizes</>;
  }

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
        <SizesClient data={formattedData} storeId={params.storeId} />
      </div>
    </div>
  );
}
