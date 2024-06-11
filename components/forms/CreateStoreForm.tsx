"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Store name is minimum of three characters.",
  }),
});

export const CreateStoreForm = () => {
  // init state
  const [isLoading, setIsLoading] = useState(false);
  // init form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log({ values });
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
                      disabled={isLoading}
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
                disabled={isLoading}
                type="button"
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button disabled={isLoading} type="submit" size="sm">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
