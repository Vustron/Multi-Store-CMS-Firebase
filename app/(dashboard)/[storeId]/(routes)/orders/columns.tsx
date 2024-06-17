"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { ArrowUpDown } from "lucide-react";
import SizeActions from "./action";
import OrdersImage from "@/components/shared/OrdersImage";

export type OrderColumns = {
  id: string;
  phone: string;
  address: string;
  products: string;
  totalPrice: string;
  images: string[];
  isPaid: boolean;
  createdAt: string;
  order_status: string;
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
  },
  {
    accessorKey: "products",
    header: "Products",
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
