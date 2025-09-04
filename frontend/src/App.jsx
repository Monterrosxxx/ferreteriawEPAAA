import { useState, useEffect } from 'react'
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import Brands from './pages/Brands';
import Providers from './pages/Providers';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para verificar autenticación al cargar la aplicación
  useEffect(() => {
    verifyAuthentication();
  }, []);

  // Función para verificar si el usuario está autenticado
  const verifyAuthentication = async () => {
    try {
      setIsLoading(true);
      
      // Hacer petición al endpoint de verificación de autenticación
      const response = await fetch('https://ferreteriawepaaa.onrender.com/api/verify-auth', {
        method: 'GET',
        credentials: 'include', // Incluir cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Usuario autenticado - obtener información del usuario
        const data = await response.json();
        setIsAuthenticated(true);
        setUserInfo(data.user);
        
        // Mantener la vista actual si ya estaba en una página autenticada
        // Si no, ir a productos por defecto
        if (currentView === 'login' || currentView === 'register') {
          setCurrentView('products');
        }
      } else {
        // Usuario no autenticado - ir a login
        setIsAuthenticated(false);
        setUserInfo(null);
        setCurrentView('login');
      }
    } catch (error) {
      // Error de conexión - asumir no autenticado
      console.error('Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
      setCurrentView('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = async () => {
    // Después del login exitoso, verificar autenticación para obtener info del usuario
    await verifyAuthentication();
    setCurrentView('products');
  };

  const handleLogOut = async () => {
    try {
      // Hacer logout en el servidor
      await fetch('https://ferreteriawepaaa.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado del servidor
      setIsAuthenticated(false);
      setUserInfo(null);
      setCurrentView('login');
    }
  };

  const handleNavigateToProducts = () => {
    setCurrentView('products');
  }

  const handleNavigateToBrands = () => {
    setCurrentView('brands');
  }

  const handleNavigateToProviders = () => {
    setCurrentView('providers');
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Renderizar la vista correspondiente según el estado actual
  switch (currentView) {
    case 'register':
      return (
        <Register
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    case 'login':
      return (
        <Login
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    case 'products':
      return (
        <Products
          onLogOut={handleLogOut}
          onNavigateToBrands={handleNavigateToBrands}
          onNavigateToProviders={handleNavigateToProviders}
          userInfo={userInfo} 
        />
      );
    case 'brands':
      return (
        <Brands
          onLogOut={handleLogOut}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToProviders={handleNavigateToProviders} 
          userInfo={userInfo}
        />
      );
    case 'providers':
      return (
        <Providers
          onLogOut={handleLogOut}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToBrands={handleNavigateToBrands}
          userInfo={userInfo} 
        />
      )
    default:
      return (
        <Login
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      );
  }
}

export default App;