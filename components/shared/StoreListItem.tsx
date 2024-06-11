"use client";

import { Check, Store } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface Props {
  store: { label: string; value: string };
  onSelect: (store: { label: string; value: string }) => void;
  isChecked: boolean;
}

const StoreListItem = ({ store, onSelect, isChecked }: Props) => {
  return (
    <div
      className="flex cursor-pointer items-center px-2 py-1 text-muted-foreground hover:bg-gray-50 hover:text-primary"
      onClick={() => onSelect(store)}
    >
      <Store className="mr-2 size-4" />
      <span className="w-full truncate whitespace-nowrap text-sm">
        {store.label}
      </span>
      <Check
        className={cn("mr-2 size-4", isChecked ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
};

export default StoreListItem;
