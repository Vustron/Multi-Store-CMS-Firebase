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

import { useCreateCategory } from "@/lib/hooks/api/categories/useCreateCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard } from "@/lib/helpers/types";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
  billboards: Billboard[];
}

export const CategoryFormSchema = z.object({
  name: z.string().min(3, {
    message: "Category name must be at least three characters.",
  }),
  billboardId: z.string().min(1, { message: "Billboard ID is required." }),
  billboardLabel: z.string().optional(),
});

const CreateCategoryForm = ({ storeId, billboards }: Props) => {
  // init create store hook
  const mutation = useCreateCategory(storeId);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      billboardId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    const { billboardId: formBillboardId } = form.getValues();
    const matchingBillboard = billboards.find(
      (item) => item.id === formBillboardId,
    );

    if (matchingBillboard) {
      values.billboardLabel = matchingBillboard.label;
    }
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Creating category...</span>,
      success: "Category created",
      error: "Something went wrong",
    });

    form.reset();
  };

  return (
    <>
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
                <span className="animate-pulse">Creating category...</span>
              </>
            ) : (
              <>
                <span>Create Category</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreateCategoryForm;
