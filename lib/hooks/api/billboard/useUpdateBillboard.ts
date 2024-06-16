"use client";

import { UpdateBillboardFormSchema } from "@/components/forms/UpdateBillboardForm.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useUpdateBillboard = (storeId?: string, billboardId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateBillboardFormSchema>) => {
      const { data } = await axios.patch(
        `/api/stores/${storeId}/billboards/${billboardId}`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billboards", storeId, billboardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["billboards", storeId],
      });

      router.replace(`/${storeId}/billboards`);
      // window.location.assign(`/${data?.id}`);
    },
  });

  return mutation;
};
