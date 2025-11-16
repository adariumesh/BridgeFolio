import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import GameDashboard from './components/GameDashboard';
import Onboarding from './components/Onboarding';
import MentorPopup from './components/MentorPopup';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [user, setUser] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mentorMessage, setMentorMessage] = useState(null);
  const [fvcPrice, setFvcPrice] = useState(1.0);

  // Poll price updates
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/price`);
        setFvcPrice(response.data.price);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    fetchPrice();
    const priceInterval = setInterval(fetchPrice, 5000);
    return () => clearInterval(priceInterval);
  }, []);

  // Mentor logic - watches portfolio allocation and gets AI advice
  useEffect(() => {
    if (!gameData || !user) return;

    const totalValue = gameData.checkingBalance + gameData.savingsBalance + gameData.deFiValue;
    if (totalValue < 500) return; // Don't trigger too early

    const riskRatio = gameData.deFiValue / totalValue;

    // Only trigger for significant allocation changes
    const shouldTrigger = 
      (riskRatio < 0.1 && gameData.savingsBalance > 100) ||
      (riskRatio > 0.7) ||
      (riskRatio > 0.3 && riskRatio < 0.7);

    if (shouldTrigger) {
      // Debounce to avoid too many calls
      const timer = setTimeout(async () => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/mentor-advice`, {
            userId: user.userId
          });
          
          if (response.data.advice) {
            setMentorMessage(response.data.advice);
          }
        } catch (error) {
          console.error('Failed to get mentor advice:', error);
          // Fallback to simple message
          let fallbackMessage;
          if (riskRatio < 0.1) {
            fallbackMessage = {
              title: "Playing it Safe!",
              body: "Your money is secure, but you're missing out on growth potential. This demonstrates the Risk vs. Return tradeoff.",
              concept: "Risk vs. Return"
            };
          } else if (riskRatio > 0.7) {
            fallbackMessage = {
              title: "High Roller Alert!",
              body: "You're heavily invested in DeFi. Your portfolio is experiencing high Volatility. Consider Diversification to reduce risk.",
              concept: "Volatility & Diversification"
            };
          } else {
            fallbackMessage = {
              title: "Great Job!",
              body: "You've built a balanced portfolio! This demonstrates good Asset Allocation.",
              concept: "Asset Allocation"
            };
          }
          setMentorMessage(fallbackMessage);
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timer);
    }
  }, [gameData, user]);

  const createNewGame = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/create-user`, {
        solanaPublicKey: `demo_${Date.now()}`
      });
      
      setUser(response.data);
      localStorage.setItem('bridgefolio_user', JSON.stringify(response.data));
      await refreshGameData(response.data.userId);
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create new game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshGameData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
      setGameData(response.data);
    } catch (error) {
      console.error('Failed to refresh game data:', error);
      // If user doesn't exist on backend, clear local storage and restart
      if (error.response?.status === 404) {
        console.log('User not found on backend - clearing localStorage');
        localStorage.clear();
        setUser(null);
        setGameData(null);
        alert('Session expired. Please start a new game.');
      }
    }
  };

  // Load existing user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('bridgefolio_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      refreshGameData(userData.userId);
    }
  }, []);

  const resetGame = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setGameData(null);
    setMentorMessage(null);
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="App">
        <Onboarding onCreateGame={createNewGame} loading={loading} />
      </div>
    );
  }

  return (
    <div className="App">
      <GameDashboard 
        user={user}
        gameData={gameData}
        fvcPrice={fvcPrice}
        onRefresh={() => refreshGameData(user.userId)}
        apiBaseUrl={API_BASE_URL}
      />
      
      {mentorMessage && (
        <MentorPopup 
          message={mentorMessage}
          onClose={() => setMentorMessage(null)}
        />
      )}
      
      <button 
        onClick={resetGame}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#f56565',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 9999
        }}
      >
        🔄 Reset Game
      </button>
    </div>
  );
}

export default App;