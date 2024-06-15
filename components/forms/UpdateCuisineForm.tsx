"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useUpdateCuisine } from "@/lib/hooks/api/cuisines/useUpdateCuisine";
import { useDeleteCuisine } from "@/lib/hooks/api/cuisines/useDeleteCuisine";
import { useConfirm } from "@/lib/hooks/misc/useConfirm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { Size } from "@/lib/helpers/types";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  storeId?: string;
  initialData: Size | undefined;
}

export const UpdateCuisineFormSchema = z.object({
  name: z.string().min(3, {
    message: "Cuisine name must be at least three characters.",
  }),
  value: z.string().min(1, {
    message: "Cuisine value must be at least three characters.",
  }),
});

const UpdateCuisineForm = ({ storeId, initialData }: Props) => {
  // init create size hook
  const mutation = useUpdateCuisine(storeId, initialData!.id);
  // init delete category hook
  const deleteMutation = useDeleteCuisine(storeId, initialData!.id);
  // init loading state
  const isLoading = mutation.isPending || deleteMutation.isPending;
  // confirm modal hook
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this cuisine",
  );
  // init form
  const form = useForm<z.infer<typeof UpdateCuisineFormSchema>>({
    resolver: zodResolver(UpdateCuisineFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: z.infer<typeof UpdateCuisineFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating cuisine...</span>,
      success: "Cuisine updated",
      error: "Something went wrong",
    });

    form.reset();
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      await toast.promise(deleteMutation.mutateAsync(), {
        loading: <span className="animate-pulse">Deleting cuisine...</span>,
        success: "Cuisine deleted",
        error: "Something went wrong",
      });
    }
  };

  return (
    <>
      <ConfirmDialog />

      <div className="flex items-center justify-center">
        <Heading title={"Edit Cuisine"} description={"Edit a cuisine"} />
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
                  <FormLabel>Cuisine Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Cuisine name for your store"
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
                  <FormLabel>Cuisine Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Cuisine value for your store"
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
                <span className="animate-pulse">Updating cuisine...</span>
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

export default UpdateCuisineForm;
