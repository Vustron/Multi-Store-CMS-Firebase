"use client";

import { useGetKitchens } from "@/lib/hooks/api/kitchens/useGetKitchens";
import { KitchenColumns } from "./columns";
import KitchensClient from "./client";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function KitchensPage({ params }: Props) {
  // get category
  const kitchens = useGetKitchens({ params });

  // Refetch data when component mounts
  useEffect(() => {
    kitchens.refetch();
  }, [kitchens.refetch]);

  // set data
  const data = kitchens.data || [];
  // init loading state
  const isLoading = kitchens.isLoading;

  if (isLoading) {
    return <>...fetching kitchens</>;
  }

  const formattedData: KitchenColumns[] = data.map((item) => ({
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
        <KitchensClient data={formattedData} storeId={params.storeId} />
      </div>
    </div>
  );
}
