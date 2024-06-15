"use client";

import CreateCuisineForm from "@/components/forms/CreateCuisineForm";

export default function CuisinePage({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateCuisineForm storeId={params.storeId} />
      </div>
    </div>
  );
}
