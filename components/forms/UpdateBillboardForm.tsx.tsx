"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useDeleteBillboard } from "@/lib/hooks/api/billboard/useDeleteBillboard";
import { useUpdateBillboard } from "@/lib/hooks/api/billboard/useUpdateBillboard";
import ImageUpload from "@/components/shared/ImageUpload";
import { useConfirm } from "@/lib/hooks/misc/useConfirm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/Separator";
import { deleteObject, ref } from "firebase/storage";
import Heading from "@/components/shared/Heading";
import { storage } from "@/lib/services/firebase";
import { Button } from "@/components/ui//Button";
import { Billboard } from "@/lib/helpers/types";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface Props {
  initialData: Billboard | undefined;
  storeId?: string;
}

export const UpdateBillboardFormSchema = z.object({
  label: z.string().min(3, {
    message: "Billboard name must be at least three characters.",
  }),
  imageUrl: z.string().min(1, { message: "Image URL is required." }),
});

const UpdateBillboardForm = ({ initialData, storeId }: Props) => {
  // init create store hook
  const mutation = useUpdateBillboard(storeId, initialData?.id || "");
  // init delete store hook
  const deleteMutation = useDeleteBillboard(storeId, initialData?.id || "");
  // confirm modal hook
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this billboard",
  );
  // init loading state
  const isLoading = mutation.isPending || deleteMutation.isPending;
  // init form
  const form = useForm<z.infer<typeof UpdateBillboardFormSchema>>({
    resolver: zodResolver(UpdateBillboardFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (
    values: z.infer<typeof UpdateBillboardFormSchema>,
  ) => {
    await toast.promise(mutation.mutateAsync(values), {
      loading: <span className="animate-pulse">Updating Billboard...</span>,
      success: "Billboard updated",
      error: "Something went wrong",
    });

    form.reset();
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      const { imageUrl } = form.getValues();

      await deleteObject(ref(storage, imageUrl)).then(async () => {
        await toast.promise(deleteMutation.mutateAsync(), {
          loading: <span className="animate-pulse">Deleting Billboard...</span>,
          success: "Billboard deleted",
          error: "Something went wrong",
        });
      });
    }
  };

  return (
    <>
      <ConfirmDialog />

      <div className="flex items-center justify-center">
        <Heading title={"Edit Billboard"} description={"Edit a billboard"} />
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
          {/* Name */}
          <FormField
            name="imageUrl"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billboard Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onChange={(url) => {
                      field.onChange(url);
                    }}
                    onRemove={() => field.onChange("")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-8">
            {/* Name */}
            <FormField
              name="label"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Your billboard name"
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
                <span className="animate-pulse">Updating billboard...</span>
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

export default UpdateBillboardForm;
