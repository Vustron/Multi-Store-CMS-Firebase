"use client";

import { useGetStoreById } from "@/lib/hooks/api/stores/useGetStoreById";
import SettingsForm from "@/components/forms/SettingsForm";
import { ApiAlert } from "@/components/shared/ApiALert";
import { useOrigin } from "@/lib/hooks/misc/useOrigin";
import { Separator } from "@/components/ui/Separator";
import { useRouter } from "next/navigation";

interface Props {
  params: {
    storeId: string;
  };
}

export default function SettingsPage({ params }: Props) {
  // get origin
  const origin = useOrigin();
  // init router
  const router = useRouter();
  // get store
  const store = useGetStoreById(params.storeId);
  // set data
  const data = store.data;
  // loading state
  const loading = store.isLoading;
  // error state
  const error = store.error;

  // if empty redirect
  if (!data) {
    router.push("/");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-5 p-8 pt-6">
        {loading ? (
          <span>...loading store</span>
        ) : error ? (
          <span>Something went wrong {error.message}</span>
        ) : (
          <SettingsForm initialData={data} />
        )}

        <Separator />

        <ApiAlert
          title={`NEXT_PUBLIC_API_URL`}
          description={`${origin}/api/${params.storeId}`}
          variant="public"
        />
      </div>
    </div>
  );
}
