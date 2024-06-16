"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useCreateSize } from "@/lib/hooks/api/sizes/useCreateSize";
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

export const SizeFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Size name must be at least three characters." })
    .max(50, { message: "Size name must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
  value: z
    .string()
    .min(1, { message: "Size value must be at least one character." })
    .max(50, { message: "Size value must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
});

const CreateSizeForm = ({ storeId }: Props) => {
  // init create store hook
  const mutation = useCreateSize(storeId);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof SizeFormSchema>>({
    resolver: zodResolver(SizeFormSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SizeFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Creating size...</span>,
      success: "Size created",
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
                  <FormLabel>Size Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Size name for your store"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Size value for your store"
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
                <span className="animate-pulse">Creating size...</span>
              </>
            ) : (
              <>
                <span>Create Size</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreateSizeForm;
