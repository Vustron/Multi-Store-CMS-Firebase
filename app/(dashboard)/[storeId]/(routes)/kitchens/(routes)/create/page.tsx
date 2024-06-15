"use client";

import CreateKitchenForm from "@/components/forms/CreateKitchenForm";

export default function KitchenPage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateKitchenForm storeId={params.storeId} />
      </div>
    </div>
  );
}
