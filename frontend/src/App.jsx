import { useState, useEffect } from 'react'
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import Brands from './pages/Brands';
import Providers from './pages/Providers';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIdAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setCurrentView('products');
  };

  const handleLogOut = () => {
    setCurrentView('login');
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
          userInfo={userInfo} />
      );
    case 'brands':
      return (
        <Brands
          onLogOut={handleLogOut}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToProviders={handleNavigateToProviders} 
          userInfo={userInfo}/>
      );
    case 'providers':
      return (
        <Providers
          onLogOut={handleLogOut}
          onNavigateToProducts={handleNavigateToProducts}
          onNavigateToBrands={handleNavigateToBrands}
          userInfo={userInfo} />
      )
    default:
      return (
        <Register
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
  }
}

export default App;