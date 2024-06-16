"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import { useParams, useRouter } from "next/navigation";
import CreateNewStoreItem from "./CreateNewStoreItem";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import StoreListItem from "./StoreListItem";
import { Store } from "@/lib/helpers/types";
import { useState } from "react";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[];
}

const StoreSwitcher = ({ items = [] }: StoreSwitcherProps) => {
  // init states
  const [open, setOpen] = useState(false);
  const [search, setIsSearching] = useState("");
  const [filterItem, setIsFilterItem] = useState<
    { label: string; value: string }[]
  >([]);
  // init store modal
  const storeModal = useStoreModal();
  // init params
  const params = useParams();
  // init router
  const router = useRouter();

  // Ensure items is an array
  const formattedStores = (Array.isArray(items) ? items : []).map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // init current store
  const currentStore = formattedStores.find(
    (item) => item.value === params?.storeId,
  );

  // init select store handler
  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false);
    router.replace(`/${store.value}`);
  };

  // handle search store
  const handleSearch = (e: any) => {
    const searchValue = e.target.value;
    setIsSearching(searchValue);
    setIsFilterItem(
      formattedStores.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <StoreIcon className="mr-2 size-4 min-w-4" />
          {currentStore ? currentStore.label : "Select store..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <div className="flex w-full items-center rounded-md border border-gray-100 px-2 py-1">
            <StoreIcon className="mr-2 size-4 min-w-4" />
            <Input
              type="text"
              placeholder="Search store..."
              onChange={handleSearch}
              className="w-full flex-1 outline-none"
            />
          </div>
          <CommandList>
            <CommandGroup heading="Stores">
              {search === "" ? (
                formattedStores.map((item, index) => (
                  <StoreListItem
                    store={item}
                    key={index}
                    onSelect={onStoreSelect}
                    isChecked={currentStore?.value === item.value}
                  />
                ))
              ) : filterItem.length > 0 ? (
                filterItem.map((item, index) => (
                  <StoreListItem
                    store={item}
                    key={index}
                    onSelect={onStoreSelect}
                    isChecked={currentStore?.value === item.value}
                  />
                ))
              ) : (
                <CommandEmpty>No store found</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>

          <CommandList>
            <CommandGroup>
              <CreateNewStoreItem
                onClick={() => {
                  setOpen(false);
                  storeModal.onOpen();
                }}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StoreSwitcher;
