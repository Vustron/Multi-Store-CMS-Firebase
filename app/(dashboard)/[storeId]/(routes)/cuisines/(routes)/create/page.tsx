"use client";

import CreateCuisineForm from "@/components/forms/CreateCuisineForm";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";

export default function CuisinePage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new cuisine"}
            description="Create cuisines for your store"
          />
        </div>

        <Separator />

        <CreateCuisineForm storeId={params.storeId} />
      </div>
    </div>
  );
}
