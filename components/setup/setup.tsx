"use client";

import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import { useEffect } from "react";

interface Props {
  userId: string | null;
}

const Setup = ({ userId }: Props) => {
  // init use modal hook
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return <></>;
};

export default Setup;
