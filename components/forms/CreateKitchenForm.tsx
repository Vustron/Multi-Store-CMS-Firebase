"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useCreateKitchen } from "@/lib/hooks/api/kitchens/useCreateKitchen";
import { noSqlInjection, urlPattern } from "@/lib/helpers/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
}

export const KitchenFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Kitchen name must be at least three characters." })
    .max(50, { message: "Kitchen name must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
  value: z
    .string()
    .min(1, { message: "Kitchen value must be at least one character." })
    .max(50, { message: "Kitchen value must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
});

const CreateKitchenForm = ({ storeId }: Props) => {
  // init create store hook
  const mutation = useCreateKitchen(storeId);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof KitchenFormSchema>>({
    resolver: zodResolver(KitchenFormSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof KitchenFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Creating kitchen...</span>,
      success: "Kitchen created",
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
                  <FormLabel>Kitchen Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Kitchen name for your store"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value */}
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kitchen Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Kitchen value for your store"
                      {...field}
                    />
                  </FormControl>
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
                <span className="animate-pulse">Creating kitchen...</span>
              </>
            ) : (
              <>
                <span>Create Kitchen</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreateKitchenForm;
