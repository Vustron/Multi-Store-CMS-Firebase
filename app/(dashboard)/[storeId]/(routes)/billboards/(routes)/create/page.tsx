"use client";

import CreateBillboardForm from "@/components/forms/CreateBillboardForm.tsx";
import { Separator } from "@/components/ui/Separator";
import Heading from "@/components/shared/Heading";

export default function BillboardPage({
  params,
}: {
  params: { storeId: string; billboardId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={"Create a new billboard"}
            description="Create billboards for your store"
          />
        </div>

        <Separator />

        <CreateBillboardForm storeId={params.storeId} />
      </div>
    </div>
  );
}
