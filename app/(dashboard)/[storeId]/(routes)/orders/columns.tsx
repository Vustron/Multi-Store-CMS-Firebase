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

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "Processing":
      return "warning";
    case "Delivering":
      return "primary";
    case "Delivered":
      return "success";
    case "Canceled":
      return "destructive";
    default:
      return "default";
  }
};

export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => {
      return (
        <div className="grid grid-cols-2 gap-2">
          <OrdersImage data={row.original.images} />
        </div>
      );
    },
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "phone",
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
    header: "Payment",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.isPaid ? "success" : "destructive"}
          className="text-md whitespace-nowrap font-medium"
        >
          {row.original.isPaid ? "Paid" : "Not Paid"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.order_status;
      return (
        <Badge
          variant={getBadgeVariant(status)}
          className="text-md whitespace-nowrap font-medium"
        >
          {status}
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
