"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpDown } from "lucide-react";
import ProductActions from "./action";

export type ProductColumns = {
  id: string;
  name: string;
  price: string;
  images: { url: string }[];
  isFeatured: boolean;
  isArchived: boolean;
  category: string;
  size: string;
  kitchen: string;
  cuisine: string;
  createdAt?: string;
};

export const columns: ColumnDef<ProductColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.isFeatured ? "destructive" : "success"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {row.original.isFeatured}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.isArchived ? "destructive" : "success"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {row.original.isArchived}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "kitchen",
    header: "Kitchen",
  },
  {
    accessorKey: "cuisine",
    header: "Cuisine",
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
      return <ProductActions data={row.original} />;
    },
  },
];
