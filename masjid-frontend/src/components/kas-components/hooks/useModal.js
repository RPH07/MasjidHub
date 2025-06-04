import { useState } from 'react';

export const useModal = () => {
  const [modalState, setModalState] = useState({
    showModal: false,
    modalType: '',
    editData: null,
    showBuktiModal: false,
    selectedBukti: null
  });

  const openTransactionModal = (type, data = null) => {
    setModalState(prev => ({
      ...prev,
      showModal: true,
      modalType: type,
      editData: data
    }));
  };

  const closeTransactionModal = () => {
    setModalState(prev => ({
      ...prev,
      showModal: false,
      modalType: '',
      editData: null
    }));
  };

  const openBuktiModal = (buktiTransfer) => {
    setModalState(prev => ({
      ...prev,
      showBuktiModal: true,
      selectedBukti: buktiTransfer
    }));
  };

  const closeBuktiModal = () => {
    setModalState(prev => ({
      ...prev,
      showBuktiModal: false,
      selectedBukti: null
    }));
  };

  return {
    ...modalState,
    openTransactionModal,
    closeTransactionModal,
    openBuktiModal,
    closeBuktiModal
  };
};