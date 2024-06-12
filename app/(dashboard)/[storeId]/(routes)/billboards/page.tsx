import BillboardClient from "./client";

interface Props {
  params: {
    storeId: string;
  };
}

export default function BillboardsPage({ params }: Props) {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient />
      </div>
    </div>
  );
}
