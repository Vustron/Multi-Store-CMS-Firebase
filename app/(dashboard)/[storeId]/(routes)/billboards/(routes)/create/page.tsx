"use client";

import CreateBillboardForm from "@/components/forms/CreateBillboardForm.tsx";

export default function BillboardPage({
  params,
}: {
  params: { storeId: string; billboardId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateBillboardForm storeId={params.storeId} />
      </div>
    </div>
  );
}
