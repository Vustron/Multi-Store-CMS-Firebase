"use client";

import {
  Form,
  FormControl,
  FormDescription,
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

import { Category, Cuisine, Kitchen, Product, Size } from "@/lib/helpers/types";
import { useUpdateProduct } from "@/lib/hooks/api/products/useUpdateProduct";
import { noSqlInjection, urlPattern } from "@/lib/helpers/utils";
import ImagesUpload from "@/components/shared/ImagesUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import PriceInput from "@/components/ui/PriceInput";
import { Button } from "@/components/ui//Button";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
  initialData: Product | undefined;
  categories: Category[];
  sizes: Size[];
  kitchens: Kitchen[];
  cuisines: Cuisine[];
}

export const UpdateProductFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Product name must be at least three characters." })
    .max(50, { message: "Product name must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
  price: z.coerce
    .number()
    .min(1, { message: "Price must be at least one" })
    .refine((val) => !isNaN(val), { message: "Price must be a valid number" }),
  images: z
    .object({
      url: z.string().regex(urlPattern, { message: "Invalid URL format." }),
    })
    .refine((data) => data.url.length < 2048, {
      message: "Image URL must be less than 2048 characters.",
    })
    .array()
    .min(1, { message: "At least one image is required." }),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  category: z
    .string()
    .min(3, { message: "Category must be at least three characters." })
    .max(50, { message: "Category must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
  size: z
    .string()
    .max(50, { message: "Size must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." })
    .optional(),
  cuisine: z
    .string()
    .max(50, { message: "Cuisine must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." })
    .optional(),
  kitchen: z
    .string()
    .max(50, { message: "Kitchen must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." })
    .optional(),
});

const UpdateProductForm = ({
  storeId,
  initialData,
  categories,
  sizes,
  kitchens,
  cuisines,
}: Props) => {
  // init create product hook
  const mutation = useUpdateProduct(storeId, initialData!.id);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof UpdateProductFormSchema>>({
    resolver: zodResolver(UpdateProductFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: z.infer<typeof UpdateProductFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating product...</span>,
      success: "Product updated",
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
          {/* images */}
          <FormField
            name="images"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <ImagesUpload
                    value={field.value.map((image) => image.url)}
                    onChange={(urls: string[]) => {
                      field.onChange(urls.map((url: string) => ({ url })));
                    }}
                    onRemove={(url: string) => {
                      field.onChange(
                        field.value.filter((current) => current.url !== url),
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                        <SelectItem key={category.id} value={category.name}>
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
                        <SelectItem key={size.id} value={size.name}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kitchens */}
            <FormField
              name="kitchen"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kitchen</FormLabel>

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
                          placeholder="Select a kitchen"
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {kitchens.map((kitchen) => (
                        <SelectItem key={kitchen.id} value={kitchen.name}>
                          {kitchen.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cuisines */}
            <FormField
              name="cuisine"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine</FormLabel>

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
                          placeholder="Select a cuisine"
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {cuisines.map((cuisine) => (
                        <SelectItem key={cuisine.id} value={cuisine.name}>
                          {cuisine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Featured */}
            <FormField
              name="isFeatured"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Switch
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will be on home screen under featured
                      products
                    </FormDescription>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archived */}
            <FormField
              name="isArchived"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Switch
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="space-y-1 leading-none">
                    <FormLabel>Archive</FormLabel>
                    <FormDescription>
                      This product will not be displayed anywhere inside the
                      store
                    </FormDescription>
                  </div>

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
                <span className="animate-pulse">Updating product...</span>
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

export default UpdateProductForm;
