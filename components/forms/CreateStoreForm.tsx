"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useCreateStore } from "@/lib/hooks/api/stores/useCreateStore";
import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import { noSqlInjection, urlPattern } from "@/lib/helpers/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

export const CreateStoreFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Store name must be at least three characters." })
    .max(50, { message: "Store name must be less than 50 characters." })
    .regex(urlPattern, { message: "Invalid URL format." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
});

export const CreateStoreForm = () => {
  // init store modal
  const { onClose } = useStoreModal();
  // init create store hook
  const mutation = useCreateStore();

  // init form
  const form = useForm<z.infer<typeof CreateStoreFormSchema>>({
    resolver: zodResolver(CreateStoreFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateStoreFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Creating Store...</span>,
      success: "Store created",
      error: "Something went wrong",
    });

    form.reset();
  };

  return (
    <div>
      <div className="space-y-4 py-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Name */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={mutation.isPending}
                      placeholder="Your store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex w-full items-center justify-end space-x-2 pt-6">
              <Button
                disabled={mutation.isPending}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button disabled={mutation.isPending} type="submit" size="sm">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span className="animate-pulse">Creating Store...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
