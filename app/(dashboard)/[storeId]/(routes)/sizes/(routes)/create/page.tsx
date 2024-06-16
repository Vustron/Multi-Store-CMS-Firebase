"use client";

import CreateSizeForm from "@/components/forms/CreateSizeForm";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";

export default function SizePage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new size"}
            description="Create sizes for your store"
          />
        </div>

        <Separator />

        <CreateSizeForm storeId={params.storeId} />
      </div>
    </div>
  );
}
