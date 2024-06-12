"use client";

import { UpdateStoreFormSchema } from "@/components/forms/SettingsForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useUpdateStore = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateStoreFormSchema>) => {
      const { data } = await axios.patch(`/api/stores/${storeId}`, values, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["stores", { storeId }] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      router.replace(`/${data?.id}`);
      // window.location.assign(`/${data?.id}`);
    },
  });

  return mutation;
};
