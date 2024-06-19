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

import { useUpdateOrder } from "@/lib/hooks/api/orders/useUpdateSize";
import { zodResolver } from "@hookform/resolvers/zod";
import { noSqlInjection } from "@/lib/helpers/utils";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { Order } from "@/lib/helpers/types";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
  initialData: Order | undefined;
}

export const UpdateOrderFormSchema = z.object({
  order_status: z
    .string()
    .min(3, { message: "Order status must be at least three characters." })
    .max(50, { message: "Order status must be less than 50 characters." })
    .refine(noSqlInjection, { message: "Invalid characters detected." }),
});

const UpdateOrderForm = ({ storeId, initialData }: Props) => {
  // init create product hook
  const mutation = useUpdateOrder(storeId, initialData!.id);

  // init loading state
  const isLoading = mutation.isPending;
  // init form
  const form = useForm<z.infer<typeof UpdateOrderFormSchema>>({
    resolver: zodResolver(UpdateOrderFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: z.infer<typeof UpdateOrderFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating order...</span>,
      success: "Order updated",
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
              name="order_status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Edit the order status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Delivering">Delivering</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
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
                <span className="animate-pulse">Updating order...</span>
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

export default UpdateOrderForm;
