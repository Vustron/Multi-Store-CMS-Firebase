"use client";

import OrdersImage from "@/components/shared/OrdersImage";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpDown } from "lucide-react";
import SizeActions from "./action";

export type OrderColumns = {
  id: string;
  phone: string;
  address: string;
  products: string;
  totalPrice: string;
  images: string[];
  isPaid: boolean;
  order_status: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => {
      <div className="grid grid-cols-2 gap-2">
        <OrdersImage data={row.original.images} />
      </div>;
    },
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "string",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Amount",
  },
  {
    accessorKey: "isPaid",
    header: "Payment Status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.isPaid ? "destructive" : "success"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {row.original.isPaid}
        </Badge>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: "Order Status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.order_status ? "destructive" : "success"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {row.original.order_status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <SizeActions data={row.original} />;
    },
  },
];
