"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

import { useDeleteCategory } from "@/lib/hooks/api/categories/useDeleteCategory";
import { useUpdateCategory } from "@/lib/hooks/api/categories/useUpdateCategory";
import { Billboard, Category } from "@/lib/helpers/types";
import { useConfirm } from "@/lib/hooks/misc/useConfirm";
import { Separator } from "@/components/ui/Separator";
import { zodResolver } from "@hookform/resolvers/zod";
import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  initialData: Category | undefined;
  storeId?: string;
  billboards: Billboard[];
  categoryId?: string;
}

export const UpdateCategoryFormSchema = z.object({
  name: z.string().min(3, {
    message: "Category name must be at least three characters.",
  }),
  billboardId: z.string().min(1, { message: "Billboard ID is required." }),
  billboardLabel: z.string().optional(),
});

const UpdateCategoryForm = ({
  initialData,
  storeId,
  billboards,
  categoryId,
}: Props) => {
  // init update category hook
  const mutation = useUpdateCategory(storeId, categoryId);
  // init delete category hook
  const deleteMutation = useDeleteCategory(storeId, categoryId);
  // confirm modal hook
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this billboard",
  );
  // init loading state
  const isLoading = mutation.isPending || deleteMutation.isPending;
  // init form
  const form = useForm<z.infer<typeof UpdateCategoryFormSchema>>({
    resolver: zodResolver(UpdateCategoryFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: z.infer<typeof UpdateCategoryFormSchema>) => {
    const { billboardId: formBillboardId } = form.getValues();
    const matchingBillboard = billboards.find(
      (item) => item.id === formBillboardId,
    );

    if (matchingBillboard) {
      values.billboardLabel = matchingBillboard.label;
    }
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating category...</span>,
      success: "Category updated",
      error: "Something went wrong",
    });
    form.reset();
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      await toast.promise(deleteMutation.mutateAsync(), {
        loading: <span className="animate-pulse">Deleting category...</span>,
        success: "Category deleted",
        error: "Something went wrong",
      });
    }
  };

  return (
    <>
      <ConfirmDialog />

      <div className="flex items-center justify-center">
        <Heading title={"Edit Category"} description={"Edit a category"} />
        {initialData && (
          <Button
            className="hover:scale-110 hover:transform"
            variant="destructive"
            size="icon"
            onClick={handleDelete}
          >
            <Trash className="size-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="grid grid-cols-3 gap-8">
            {/* Name */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Category name for your store"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              name="billboardId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>

                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a billboard"
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit */}
          <Button disabled={isLoading} type="submit" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span className="animate-pulse">Updating category...</span>
              </>
            ) : (
              <>
                <span>Save changes</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UpdateCategoryForm;
