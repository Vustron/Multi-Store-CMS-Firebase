"use client";

import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboards";
import { BillboardColumns } from "./columns";
import { Loader2 } from "lucide-react";
import BillboardClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function BillboardsPage({ params }: Props) {
  // get billboard
  const billboard = useGetBillboards({ params });
  // set data
  const data = billboard.data || [];
  // loading state
  const loading = billboard.isLoading;
  // error state
  const error = billboard.error;

  const formattedData: BillboardColumns[] = data.map((item) => ({
    id: item.id,
    label: item.label,
    imageUrl: item.imageUrl,
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
          <BillboardClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
