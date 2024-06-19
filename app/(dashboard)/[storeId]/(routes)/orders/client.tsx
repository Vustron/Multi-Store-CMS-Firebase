"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Separator } from "@/components/ui/Separator";
import { OrderColumns, columns } from "./columns";
import Heading from "@/components/shared/Heading";
import ApiList from "@/components/shared/ApiList";
import { useRouter } from "next/navigation";

interface Props {
  data: OrderColumns[];
  storeId: string;
}

const OrdersClient = ({ data, storeId }: Props) => {
  // init router
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${data.length})`}
          description="Manage orders for your store"
        />
      </div>

      <Separator />
      <DataTable columns={columns} data={data} searchKey="products" />

      <Heading title="API" description="API calls for orders" />
      <Separator />

      <ApiList entityName={"orders"} entityNameId={"ordersId"} />
    </>
  );
};

export default OrdersClient;
