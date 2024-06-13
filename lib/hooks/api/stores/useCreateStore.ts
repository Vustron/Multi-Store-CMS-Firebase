"use client";

import { CreateStoreFormSchema } from "@/components/forms/CreateStoreForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateStore = () => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();
  // init modal hook
  const { onClose } = useStoreModal();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof CreateStoreFormSchema>) => {
      const { data } = await axios.post("/api/stores", values);
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      router.replace(`/${data?.id}`);
      // window.location.assign(`/${data?.id}`);
      onClose();
    },
  });

  return mutation;
};
