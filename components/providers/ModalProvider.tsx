"use client";

import { StoreModal } from "@/components/modals/StoreModal";
import useMounted from "@/lib/hooks/misc/useMounted";

export const ModalProvider = () => {
  // init state
  const isMounted = useMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <StoreModal />
    </>
  );
};
