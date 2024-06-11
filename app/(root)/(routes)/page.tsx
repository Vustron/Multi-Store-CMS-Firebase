"use client";

import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import { useEffect } from "react";

export default function SetupPage() {
  // init use modal hook
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return <div></div>;
}
