"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Separator } from "@/components/ui/Separator";
import { CategoryColumns, columns } from "./columns";
import Heading from "@/components/shared/Heading";
import ApiList from "@/components/shared/ApiList";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface Props {
  data: CategoryColumns[];
  storeId: string;
}

const CategoriesClient = ({ data, storeId }: Props) => {
  // init router
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categories (${data.length})`}
          description="Manage categories for your store"
        />

        <Button
          onClick={() => router.replace(`/${storeId}/categories/create`)}
          className="hover:scale-110 hover:transform"
        >
          <Plus className="mr-2 size-4" />
          Add New
        </Button>
      </div>

      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />

      <Heading title="API" description="API calls for categories" />
      <Separator />

      <ApiList entityName={"categories"} entityNameId={"categoryId"} />
    </>
  );
};

export default CategoriesClient;
