"use client";

import { CreateStoreForm } from "@/components/forms/CreateStoreForm";
import { useStoreModal } from "@/lib/hooks/modals/useStoreModal";
import Modal from "@/components/modals/Modal";

export const StoreModal = () => {
  // init store modal hook
  const storeModal = useStoreModal();

  return (
    <Modal
      title="Create a new store"
      description="Add a new store to manage the products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <CreateStoreForm />
    </Modal>
  );
};
