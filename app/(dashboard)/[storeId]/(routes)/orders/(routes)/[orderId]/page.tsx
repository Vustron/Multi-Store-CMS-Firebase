"use client";

import { useGetOrderById } from "@/lib/hooks/api/orders/useGetOrderById";
import UpdateOrderForm from "@/components/forms/UpdateOrderForm";
import Heading from "@/components/shared/Heading";

export default function SizeIdPage({
  params,
}: {
  params: { storeId: string; orderId: string };
}) {
  // get order using id
  const {
    data: order,
    isLoading: loading,
    error: error,
  } = useGetOrderById(params.storeId, params.orderId);
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Edit a product"}
            description="Edit products for your store"
          />
        </div>
        {loading ? (
          <span>...loading order</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <UpdateOrderForm storeId={params.storeId} initialData={order} />
        )}
      </div>
    </div>
  );
}
