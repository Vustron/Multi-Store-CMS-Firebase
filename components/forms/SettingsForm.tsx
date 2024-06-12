"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useDeleteStore } from "@/lib/hooks/api/stores/useDeleteStore";
import { useUpdateStore } from "@/lib/hooks/api/stores/useUpdateStore";
import { useConfirm } from "@/lib/hooks/misc/useConfirm";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui//Button";
import { Input } from "@/components/ui/Input";
import { Store } from "@/lib/helpers/types";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  initialData: Store | undefined;
}

export const UpdateStoreFormSchema = z.object({
  name: z.string().min(3, {
    message: "Store name is minimum of three characters.",
  }),
});

const SettingsForm = ({ initialData }: Props) => {
  // init create store hook
  const mutation = useUpdateStore(initialData!.id);
  // init delete store hook
  const deleteMutation = useDeleteStore(initialData!.id);
  // confirm modal hook
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this store",
  );
  // init loading state
  const isLoading = mutation.isPending || deleteMutation.isPending;
  // init form
  const form = useForm<z.infer<typeof UpdateStoreFormSchema>>({
    resolver: zodResolver(UpdateStoreFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: z.infer<typeof UpdateStoreFormSchema>) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating Store...</span>,
      success: "Store updated",
      error: "Something went wrong",
    });

    form.reset();
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      await toast.promise(deleteMutation.mutateAsync(), {
        loading: <span className="animate-pulse">Deleting Store...</span>,
        success: "Store deleted",
        error: "Something went wrong",
      });
    }
  };

  return (
    <>
      <ConfirmDialog />

      <div className="flex items-center justify-center">
        <Heading title="Settings" description="Manage store references" />

        <Button
          className="hover:scale-110 hover:transform"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
        >
          <Trash className="size-4" />
        </Button>
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
          </div>

          {/* Submit */}
          <Button disabled={isLoading} type="submit" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span className="animate-pulse">Updating Store name...</span>
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

export default SettingsForm;
