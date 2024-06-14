"use client";

import { DataTable } from "@/components/shared/DataTable";
import { BillboardColumns, columns } from "./columns";
import { Separator } from "@/components/ui/Separator";
import ApiList from "@/components/shared/ApiList";
import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface Props {
  data: BillboardColumns[];
  storeId: string;
}

const BillboardClient = ({ data, storeId }: Props) => {
  // init router
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length})`}
          description="Manage billboards for your store"
        />

        <Button
          onClick={() => router.replace(`/${storeId}/billboards/create`)}
          className="hover:scale-110 hover:transform"
        >
          <Plus className="mr-2 size-4" />
          Add New
        </Button>
      </div>

      <Separator />
      <DataTable columns={columns} data={data} searchKey="label" />

      <Heading title="API" description="API calls for billboards" />
      <Separator />

      <ApiList entityName={"billboards"} entityNameId={"billboardId"} />
    </>
  );
};

export default BillboardClient;
