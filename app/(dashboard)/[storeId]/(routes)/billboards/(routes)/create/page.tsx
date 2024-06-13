"use client";

import CreateBillboardForm from "@/components/forms/CreateBillboardForm.tsx";
import { useRouter } from "next/navigation";

export default function BillboardPage({
  params,
}: {
  params: { storeId: string; billboardId: string };
}) {
  // init router
  const router = useRouter();
  // // get billboard
  // const billboard = useGetBillboards({ params });
  // // set data
  // const data = billboard.data;
  // // init loading state
  // const isLoading = billboard.isLoading;

  // if (isLoading) {
  //   return <>...fetching data</>;
  // }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateBillboardForm storeId={params.storeId} />
      </div>
    </div>
  );
}
