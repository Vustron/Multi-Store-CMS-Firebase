"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

import { useDeleteCategory } from "@/lib/hooks/api/categories/useDeleteCategory";
import { Copy, MoreHorizontal, Trash, Pencil } from "lucide-react";
import { useConfirm } from "@/lib/hooks/misc/useConfirm";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CategoryColumns } from "./columns";
import { toast } from "react-hot-toast";

interface Props {
  data: CategoryColumns;
}

const CategoryActions = ({ data }: Props) => {
  // init router
  const router = useRouter();
  // init params
  const params = useParams();
  // get storeId
  const storeId = Array.isArray(params.storeId)
    ? params.storeId[0]
    : params.storeId;
  // init delete store hook
  const deleteMutation = useDeleteCategory(storeId, data.id);
  // confirm modal hook
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this category",
  );

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      await toast.promise(deleteMutation.mutateAsync(), {
        loading: <span className="animate-pulse">Deleting Category...</span>,
        success: "Category deleted",
        error: "Something went wrong",
      });
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Billboard ID copied");
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuSeparator />
          {/* copy */}
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 size-4" />
            Copy ID
          </DropdownMenuItem>
          {/* edit */}
          <DropdownMenuItem
            onClick={() =>
              router.push(`/${params.storeId}/categories/${data.id}`)
            }
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          {/* delete */}
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CategoryActions;
