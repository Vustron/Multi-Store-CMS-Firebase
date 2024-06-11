"use client";

import { PlusCircle } from "lucide-react";

interface Props {
  onClick: () => void;
}

const CreateNewStoreItem = ({ onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center bg-gray-50 px-2 py-1 text-muted-foreground hover:text-primary"
    >
      <PlusCircle className="mr-2 size-5" />
      Create Store
    </div>
  );
};

export default CreateNewStoreItem;
