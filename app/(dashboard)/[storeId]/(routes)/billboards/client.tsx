"use client";

import { useRouter, useParams } from "next/navigation";
import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

const BillboardClient = () => {
  // get params
  const params = useParams();
  // init router
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (0)`}
          description="Manage billboards for your store"
        />

        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/create`)}
          className="hover:scale-110 hover:transform"
        >
          <Plus className="mr-2 size-4" />
          Add New
        </Button>
      </div>
    </>
  );
};

export default BillboardClient;
