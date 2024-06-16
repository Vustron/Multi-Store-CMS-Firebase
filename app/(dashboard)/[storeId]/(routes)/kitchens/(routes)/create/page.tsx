"use client";

import CreateKitchenForm from "@/components/forms/CreateKitchenForm";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";

export default function KitchenPage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new kitchen"}
            description="Create kitchens for your store"
          />
        </div>

        <Separator />

        <CreateKitchenForm storeId={params.storeId} />
      </div>
    </div>
  );
}
