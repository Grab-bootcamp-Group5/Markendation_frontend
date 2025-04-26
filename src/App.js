import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IngredientBankPage from './pages/IngredientBankPage';
import BasketPage from './pages/BasketPage';
import DishesPage from './pages/DishesPage';
import HomePage from './pages/HomePage';
import SavedBasketPage from './pages/SavedBasketPage';
import SavedBasketDetailPage from './pages/SavedBasketDetailPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { ModalProvider } from './context/ModalContext';
import { BasketProvider } from './context/BasketContext';

import CheckoutCalculation from './pages/CheckoutCalculationPage';

function App() {
  return (
    <BrowserRouter>
      <BasketProvider>
        <ModalProvider>
          <div className="font-sans">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/ingredients-bank" element={<IngredientBankPage />} />
              <Route path="/dishes-bank" element={<DishesPage />} />
              <Route path="/basket" element={<BasketPage />} />
              <Route path="/saved-baskets" element={<SavedBasketPage />} />
              <Route path="/saved-baskets/:basketId" element={<SavedBasketDetailPage />} />
              <Route path='/login' element={<LoginForm />} />
              <Route path='/register' element={<RegisterForm />} />
              <Route path='/calculate' element={<CheckoutCalculation />} />
            </Routes>
            <ToastContainer />
          </div>
        </ModalProvider>
      </BasketProvider>
    </BrowserRouter>
  );
}

export default App;