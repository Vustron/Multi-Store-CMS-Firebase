"use client";

import { useGetCategories } from "@/lib/hooks/api/categories/useGetCategories";
import { CategoryColumns } from "./columns";
import CategoriesClient from "./client";
import { format } from "date-fns";
import { useEffect } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function CategoriesPage({ params }: Props) {
  // get category
  const category = useGetCategories({ params });

  // Refetch data when component mounts
  useEffect(() => {
    category.refetch();
  }, [category.refetch]);

  // set data
  const data = category.data || [];
  // init loading state
  const isLoading = category.isLoading;

  if (isLoading) {
    return <>...fetching categories</>;
  }

  const formattedData: CategoryColumns[] = data.map((item) => ({
    id: item.id,
    billboardLabel: item.billboardLabel,
    name: item.name,
    createdAt: item.createdAt
      ? format(item.createdAt.toDate(), "MMMM dd yyyy")
      : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedData} storeId={params.storeId} />
      </div>
    </div>
  );
}
