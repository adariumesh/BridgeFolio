import React, { useState, useEffect } from 'react';

const DeFiPanel = ({ gameData, fvcPrice, onAction, loading }) => {
  const [bridgeAmount, setBridgeAmount] = useState(200);
  const [priceHistory, setPriceHistory] = useState([]);

  // Track price changes for visualization
  useEffect(() => {
    if (fvcPrice) {
      setPriceHistory(prev => {
        const newHistory = [...prev, { price: fvcPrice, time: Date.now() }];
        // Keep only last 10 prices
        return newHistory.slice(-10);
      });
    }
  }, [fvcPrice]);

  const fvcBalance = gameData?.fvcBalance || 0;
  const deFiValue = fvcBalance * fvcPrice;
  const priceChange = priceHistory.length >= 2 
    ? ((fvcPrice - priceHistory[priceHistory.length - 2]?.price) / priceHistory[priceHistory.length - 2]?.price) * 100
    : 0;

  return (
    <div className="panel defi-panel">
      <h2>⚡ Decentralized Finance (DeFi)</h2>
      <p>High risk, high reward, real-time volatility</p>

      <div className="defi-wallet">
        <h3>Solana Wallet</h3>
        <div className="wallet-address">
          {gameData?.solanaPublicKey?.slice(0, 8)}...{gameData?.solanaPublicKey?.slice(-4)}
        </div>
        
        <div className="token-balance">
          <div className="balance">
            {fvcBalance.toFixed(2)} FVC
          </div>
          <div className="usd-value">
            ≈ ${deFiValue.toFixed(2)} USD
          </div>
        </div>
      </div>

      <div className="price-section">
        <h3>FVC Token Price</h3>
        <div className={`current-price ${priceChange >= 0 ? 'positive' : 'negative'}`}>
          ${fvcPrice.toFixed(4)}
          {priceChange !== 0 && (
            <span className="price-change">
              {priceChange >= 0 ? '↗️' : '↘️'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          )}
        </div>
        
        <div className="price-chart">
          {priceHistory.map((point, index) => (
            <div 
              key={index} 
              className="price-point"
              style={{ 
                height: `${((point.price - 0.5) / 1) * 50}px`,
                opacity: 0.3 + (index / priceHistory.length) * 0.7
              }}
            />
          ))}
        </div>
        <p>🔴 LIVE - Updates every 5 seconds</p>
      </div>

      <div className="bridge-section">
        <h3>Bridge from TradFi</h3>
        <p>Convert USD to FVC tokens</p>
        
        <div className="bridge-controls">
          <input 
            type="number" 
            value={bridgeAmount}
            onChange={(e) => setBridgeAmount(Number(e.target.value))}
            min="1"
            max={gameData?.checkingBalance || 0}
            className="amount-input"
          />
          
          <button 
            onClick={() => onAction('bridge-solana', bridgeAmount)}
            disabled={loading || bridgeAmount <= 0 || bridgeAmount > (gameData?.checkingBalance || 0)}
            className="action-btn bridge"
          >
            🌉 Bridge to DeFi
          </button>
        </div>
        
        <div className="conversion-preview">
          Will receive: {bridgeAmount} FVC ≈ ${(bridgeAmount * fvcPrice).toFixed(2)}
        </div>
      </div>

      <div className="defi-risks">
        <h4>DeFi Risks:</h4>
        <ul>
          <li>High volatility</li>
          <li>No insurance</li>
          <li>Smart contract risk</li>
          <li>Price can change rapidly</li>
        </ul>
      </div>

      <div className="live-indicator">
        <div className="pulse"></div>
        Real Solana Devnet Integration
      </div>
    </div>
  );
};

export default DeFiPanel;