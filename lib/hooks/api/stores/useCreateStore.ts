import { CreateStoreFormSchema } from "@/components/forms/CreateStoreForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof CreateStoreFormSchema>) => {
      const { data } = await axios.post("/api/stores", values);
      return data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return mutation;
};
