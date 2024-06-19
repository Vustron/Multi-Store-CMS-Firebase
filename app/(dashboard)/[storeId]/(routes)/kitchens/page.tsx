"use client";

import { useGetKitchens } from "@/lib/hooks/api/kitchens/useGetKitchens";
import { KitchenColumns } from "./columns";
import { Loader2 } from "lucide-react";
import KitchensClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function KitchensPage({ params }: Props) {
  // get kitchens
  const kitchens = useGetKitchens({ params });
  // set data
  const data = kitchens.data || [];
  const loading = kitchens.isLoading;
  // error state
  const error = kitchens.error;

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
        {loading ? (
          <>
            <Loader2 className="h-6 animate-spin" />
          </>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <KitchensClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
