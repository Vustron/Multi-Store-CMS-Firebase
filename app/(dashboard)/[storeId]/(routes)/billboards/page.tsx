"use client";

import { useGetBillboards } from "@/lib/hooks/api/billboard/useGetBillboard";
import { BillboardColumns } from "./columns";
import BillboardClient from "./client";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function BillboardsPage({ params }: Props) {
  // get billboard
  const billboard = useGetBillboards({ params });

  // Refetch data when component mounts
  useEffect(() => {
    billboard.refetch();
  }, [billboard.refetch]);

  // set data
  const data = billboard.data || [];
  // init loading state
  const isLoading = billboard.isLoading;

  if (isLoading) {
    return <>...fetching billboards</>;
  }

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
        <BillboardClient data={formattedData} storeId={params.storeId} />
      </div>
    </div>
  );
}
