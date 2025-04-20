import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IngredientBankPage from './pages/IngredientBankPage';
import BasketPage from './pages/BasketPage';
import DishesPage from './pages/DishesPage';
import HomePage from './pages/HomePage';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/ingredients-bank" element={<IngredientBankPage />} />
          <Route path="/dishes-bank" element={<DishesPage />} />
          <Route path="/basket" element={<BasketPage />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;