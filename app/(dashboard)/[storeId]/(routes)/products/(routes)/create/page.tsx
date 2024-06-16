"use client";

import { useGetCategories } from "@/lib/hooks/api/categories/useGetCategories";
import { useGetCuisines } from "@/lib/hooks/api/cuisines/useGetCuisines";
import { useGetKitchens } from "@/lib/hooks/api/kitchens/useGetKitchens";
import CreateProductForm from "@/components/forms/CreateProductForm";
import { useGetSizes } from "@/lib/hooks/api/sizes/useGetSizes";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";

export default function ProductPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  // get categories
  const categories = useGetCategories({ params });
  // get sizes
  const sizes = useGetSizes({ params });
  // get kitchens
  const kitchens = useGetKitchens({ params });
  // get cuisine
  const cuisines = useGetCuisines({ params });

  // set data
  const categoriesData = categories.data || [];
  const sizesData = sizes.data || [];
  const kitchensData = kitchens.data || [];
  const cuisinesData = cuisines.data || [];

  // loading state
  const loading =
    sizes.isLoading ||
    categories.isLoading ||
    kitchens.isLoading ||
    cuisines.isLoading;

  // error state
  const error =
    categories.error || sizes.error || kitchens.error || cuisines.error;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new product"}
            description="Create products for your store"
          />
        </div>

        <Separator />

        {loading ? (
          <span>...loading products</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <CreateProductForm
            storeId={params.storeId}
            categories={categoriesData}
            sizes={sizesData}
            kitchens={kitchensData}
            cuisines={cuisinesData}
          />
        )}
      </div>
    </div>
  );
}
