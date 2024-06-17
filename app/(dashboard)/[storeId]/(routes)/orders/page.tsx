"use client";

import { useGetOrders } from "@/lib/hooks/api/orders/useGetOrders";
import { formatter } from "@/lib/helpers/utils";
import { OrderColumns } from "./columns";
import OrdersClient from "./client";
import { format } from "date-fns";

interface Props {
  params: {
    storeId: string;
  };
}

export default function OrdersPage({ params }: Props) {
  // get orders
  const orders = useGetOrders({ params });
  // set data
  const data = orders.data || [];
  // loading state
  const loading = orders.isLoading;
  // error state
  const error = orders.error;

  const formattedData: OrderColumns[] = data.map((item) => ({
    id: item.id,
    isPaid: item.isPaid,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((item) => item.name).join(", "),
    order_status: item.order_status,
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        if (item && item.qty !== undefined) {
          return total + Number(item.price * item.qty);
        }
        return total;
      }, 0),
    ),
    images: item.orderItems.map((item) => item.images[0].url),
    createdAt: item.createdAt
      ? format(item.createdAt.toDate(), "MMMM dd yyyy")
      : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {loading ? (
          <span>...loading orders</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <OrdersClient data={formattedData} storeId={params.storeId} />
        )}
      </div>
    </div>
  );
}
