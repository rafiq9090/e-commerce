import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// 1. Remove the HelmetProvider import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Remove the HelmetProvider wrapper */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);