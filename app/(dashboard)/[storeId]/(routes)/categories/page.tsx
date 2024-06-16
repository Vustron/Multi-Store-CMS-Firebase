"use client";

import { useGetCategories } from "@/lib/hooks/api/categories/useGetCategories";
import { CategoryColumns } from "./columns";
import CategoriesClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function CategoriesPage({ params }: Props) {
  // get category
  const category = useGetCategories({ params });
  // set data
  const data = category.data || [];
  // loading state
  const loading = category.isLoading;
  // error state
  const error = category.error;

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
        {loading ? (
          <span>...loading categories</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <CategoriesClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
