import { useState } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editData, setEditData] = useState(null);
  const [showBuktiModal, setShowBuktiModal] = useState(false);
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [buktiTransactionInfo, setBuktiTransactionInfo] = useState(null);

  const openTransactionModal = (type, data = null) => {
    setModalType(type);
    setEditData(data);
    setShowModal(true);
  };

  const closeTransactionModal = () => {
    setShowModal(false);
    setModalType('');
    setEditData(null);
  };

  const openBuktiModal = (buktiTransfer, transactionInfo = null) => {
    console.log('Opening bukti modal:', { buktiTransfer, transactionInfo });
    setSelectedBukti(buktiTransfer);
    setBuktiTransactionInfo(transactionInfo);
    setShowBuktiModal(true);
  };

  const closeBuktiModal = () => {
    setShowBuktiModal(false);
    setSelectedBukti(null);
    setBuktiTransactionInfo(null);
  };

  return {
    showModal,
    modalType,
    editData,
    showBuktiModal,
    selectedBukti,
    buktiTransactionInfo,
    openTransactionModal,
    closeTransactionModal,
    openBuktiModal,
    closeBuktiModal
  };
};

export default useModal;