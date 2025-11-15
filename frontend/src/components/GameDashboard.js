import React, { useState } from 'react';
import axios from 'axios';
import TradFiPanel from './TradFiPanel';
import DeFiPanel from './DeFiPanel';
import PortfolioOverview from './PortfolioOverview';

const GameDashboard = ({ user, gameData, fvcPrice, onRefresh, apiBaseUrl }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType, amount) => {
    setLoading(true);
    try {
      let endpoint;
      const payload = { userId: user.userId };

      switch (actionType) {
        case 'paycheck':
          endpoint = '/api/paycheck';
          payload.amount = 2000;
          break;
        case 'bills':
          endpoint = '/api/pay-bills';
          payload.amount = 1500;
          break;
        case 'transfer-savings':
          endpoint = '/api/transfer-to-savings';
          payload.amount = amount;
          break;
        case 'bridge-solana':
          endpoint = '/api/bridge-to-solana';
          payload.amount = amount;
          break;
        default:
          throw new Error('Unknown action type');
      }

      await axios.post(`${apiBaseUrl}${endpoint}`, payload);
      
      // Refresh data after successful action
      setTimeout(onRefresh, 500); // Small delay to ensure backend processes
      
    } catch (error) {
      console.error('Action failed:', error);
      alert(`Failed to ${actionType.replace('-', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  if (!gameData) {
    return (
      <div className="dashboard loading">
        <h2>Loading your financial universe...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌉 BridgeFolio Dashboard</h1>
        <div className="user-info">
          <span>Customer ID: {user.customerId?.slice(-8) || 'Loading...'}</span>
          <button onClick={onRefresh} className="refresh-btn" disabled={loading}>
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </header>

      <PortfolioOverview gameData={gameData} fvcPrice={fvcPrice} />

      <div className="panels-container">
        <TradFiPanel 
          gameData={gameData}
          onAction={handleAction}
          loading={loading}
        />
        
        <DeFiPanel 
          gameData={gameData}
          fvcPrice={fvcPrice}
          onAction={handleAction}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default GameDashboard;