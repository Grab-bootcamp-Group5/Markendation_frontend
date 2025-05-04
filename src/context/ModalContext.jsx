import React, { createContext, useState, useContext } from 'react';
import ShoppingModal from '../components/ShoppingModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,     // Trạng thái mở/đóng
        type: '',          // Loại modal (dish, ingredients, search)
        itemData: null,    // Dữ liệu item hiển thị trong modal
        searchQuery: ''    // Query tìm kiếm (khi type là search)
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

    // Đóng modal và reset các thông số
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
            {/* 
              Render ShoppingModal ở cấp root của ứng dụng
              Điều này giúp chúng ta có thể mở modal từ bất kỳ component nào
              mà không cần truyền props qua nhiều cấp
            */}
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