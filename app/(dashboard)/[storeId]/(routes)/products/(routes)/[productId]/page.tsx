"use client";

import { useGetProductById } from "@/lib/hooks/api/products/useGetProductById";
import { useGetCategories } from "@/lib/hooks/api/categories/useGetCategories";
import { useGetCuisines } from "@/lib/hooks/api/cuisines/useGetCuisines";
import { useGetKitchens } from "@/lib/hooks/api/kitchens/useGetKitchens";
import { useGetSizes } from "@/lib/hooks/api/sizes/useGetSizes";
import UpdateSizeForm from "@/components/forms/UpdateSizeForm";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";
import UpdateProductForm from "@/components/forms/UpdateProductForm";

export default function ProductIdPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  // get product using id
  const product = useGetProductById(params.storeId, params.productId);
  // get categories
  const categories = useGetCategories({ params });
  // get sizes
  const sizes = useGetSizes({ params });
  // get kitchens
  const kitchens = useGetKitchens({ params });
  // get cuisine
  const cuisines = useGetCuisines({ params });

  // set data
  const productData = product.data;
  const categoriesData = categories.data || [];
  const sizesData = sizes.data || [];
  const kitchensData = kitchens.data || [];
  const cuisinesData = cuisines.data || [];

  // loading state
  const loading =
    product.isLoading ||
    sizes.isLoading ||
    categories.isLoading ||
    kitchens.isLoading ||
    cuisines.isLoading;

  // error state
  const error =
    product.error ||
    categories.error ||
    sizes.error ||
    kitchens.error ||
    cuisines.error;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Edit a product"}
            description="Edit products for your store"
          />
        </div>

        <Separator />

        {loading ? (
          <span>...loading product</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateProductForm
            storeId={params.storeId}
            initialData={productData}
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
