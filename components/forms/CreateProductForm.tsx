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

import { useCreateProduct } from "@/lib/hooks/api/products/useCreateProduct";
import { Category, Cuisine, Kitchen, Size } from "@/lib/helpers/types";
import { zodResolver } from "@hookform/resolvers/zod";
import PriceInput from "@/components/ui/PriceInput";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
  categories: Category[];
  sizes: Size[];
  kitchens: Kitchen[];
  cuisines: Cuisine[];
}

export const ProductFormSchema = z.object({
  name: z.string().min(3, {
    message: "Size name must be at least three characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least one",
  }),
  images: z.object({ url: z.string() }).array(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  category: z.string().min(3, {
    message: "Category must be at least three characters.",
  }),
  size: z.string().min(3, {
    message: "Size must be at least three characters.",
  }),
  cuisine: z.string().min(3, {
    message: "Cuisine must be at least three characters.",
  }),
  kitchen: z.string().min(3, {
    message: "Kitchen must be at least three characters.",
  }),
});

const CreateProductForm = ({
  storeId,
  categories,
  sizes,
  kitchens,
  cuisines,
}: Props) => {
  // init create product hook
  const mutation = useCreateProduct(storeId);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      price: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Creating product...</span>,
      success: "Product created",
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
            {/* name */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Product name for your store"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* price */}
            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product price</FormLabel>
                  <FormControl>
                    <PriceInput
                      disabled={isLoading}
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>

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
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              name="size"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>

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
                          placeholder="Select a size"
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
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
                <span className="animate-pulse">Creating product...</span>
              </>
            ) : (
              <>
                <span>Create Product</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreateProductForm;
