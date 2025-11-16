import { useState, useEffect } from 'react';
import axios from 'axios';
import StartPage from './components/StartPage';
import Dashboard from './components/Dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserData {
  userId: string;
  customerId: string;
  checkingId: string;
  savingsId: string;
  solanaPublicKey: string;
  solanaTokenAccount: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bridgefolio_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (err) {
        console.error('Failed to parse saved user data:', err);
        localStorage.removeItem('bridgefolio_user');
      }
    }
  }, []);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/create-user`, {
        solanaPublicKey: `user_${Date.now()}`
      });

      const userData: UserData = {
        userId: response.data.userId,
        customerId: response.data.customerId,
        checkingId: response.data.checkingId,
        savingsId: response.data.savingsId,
        solanaPublicKey: response.data.solanaPublicKey,
        solanaTokenAccount: response.data.solanaTokenAccount
      };

      setUser(userData);
      localStorage.setItem('bridgefolio_user', JSON.stringify(userData));

      console.log('Game started successfully:', userData);
    } catch (err: any) {
      console.error('Failed to start game:', err);
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetGame = () => {
    localStorage.removeItem('bridgefolio_user');
    sessionStorage.clear();
    setUser(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!user ? (
        <StartPage 
          onStart={handleStartGame} 
          loading={loading}
          error={error}
        />
      ) : (
        <Dashboard 
          user={user}
          onBackToStart={handleResetGame} 
        />
      )}
    </div>
  );
}