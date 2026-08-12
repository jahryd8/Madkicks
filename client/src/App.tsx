import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductCatalog } from './pages/ProductCatalog';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartPage } from './pages/CartPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
            {/* Persistent Navbar across all routes */}
            <Navbar />

            {/* Main view container takes remaining vertical space */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductCatalog />} />
                <Route path="/catalog" element={<ProductCatalog />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* User Protected Routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/success"
                  element={
                    <ProtectedRoute>
                      <CheckoutSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/cancel"
                  element={
                    <ProtectedRoute>
                      <CheckoutCancel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Persistent Footer across all routes */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}