import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // 1. Import

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* 2. Wrap AppRoutes */}
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;