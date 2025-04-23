import React, { createContext, useState, useContext } from 'react';
import ShoppingModal from '../components/ShoppingModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '',
        itemData: null,
        searchQuery: ''
    });

    // Mở modal với các thông số
    const openModal = (type, itemData, searchQuery = '') => {
        setModalState({
            isOpen: true,
            type,
            itemData,
            searchQuery
        });
    };

    // Đóng modal
    const closeModal = () => {
        setModalState({
            isOpen: false,
            type: '',
            itemData: null,
            searchQuery: ''
        });
    };

    return (
        <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
            {children}
            {/* Render modal toàn cục ở đây */}
            <ShoppingModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                itemData={modalState.itemData}
                searchQuery={modalState.searchQuery}
            />
        </ModalContext.Provider>
    );
};

export default ModalContext;