"use client";

import { useGetProducts } from "@/lib/hooks/api/products/useGetProducts";
import { formatter } from "@/lib/helpers/utils";
import { ProductColumns } from "./columns";
import ProductsClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function Products({ params }: Props) {
  // get products
  const products = useGetProducts({ params });
  // set data
  const productsData = products.data || [];

  // loading state
  const loading = products.isLoading;

  // error state
  const error = products.error;

  const formattedData: ProductColumns[] = productsData.map((item) => ({
    id: item.id,
    name: item.name,
    price: formatter.format(item.price),
    images: item.images,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    category: item.category,
    size: item.size,
    kitchen: item.kitchen,
    cuisine: item.cuisine,
    createdAt: item.createdAt
      ? format(item.createdAt.toDate(), "MMMM dd yyyy")
      : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {loading ? (
          <span>...loading products</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <ProductsClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
