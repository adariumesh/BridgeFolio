import React, { useState, useEffect } from 'react';

const TradFiPanel = ({ gameData, onAction, loading }) => {
  const [transferAmount, setTransferAmount] = useState(100);
  const [simulatedSavingsBalance, setSimulatedSavingsBalance] = useState(0);

  // Initialize simulated savings balance
  useEffect(() => {
    setSimulatedSavingsBalance(gameData?.savingsBalance || 0);
  }, [gameData?.savingsBalance]);

  // Simulate interest accumulation for demo purposes
  useEffect(() => {
    const interestInterval = setInterval(() => {
      setSimulatedSavingsBalance(prev => {
        if (prev > 0) {
          return prev + (prev * 0.00001); // Very small interest for demo
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interestInterval);
  }, []);

  return (
    <div className="panel tradfi-panel">
      <h2>🏦 Traditional Finance (TradFi)</h2>
      <p>Stable, regulated, predictable returns</p>

      <div className="account-section">
        <h3>Monthly Actions</h3>
        <div className="action-buttons">
          <button 
            onClick={() => onAction('paycheck')}
            disabled={loading}
            className="action-btn paycheck"
          >
            💰 Get Paycheck ($2,000)
          </button>
          
          <button 
            onClick={() => onAction('bills')}
            disabled={loading}
            className="action-btn bills"
          >
            💸 Pay Bills ($1,500)
          </button>
        </div>
      </div>

      <div className="account-section">
        <h3>Checking Account</h3>
        <div className="balance">${gameData?.checkingBalance?.toFixed(2) || '0.00'}</div>
        <p>Available for spending and transfers</p>
      </div>

      <div className="account-section">
        <h3>Savings Account</h3>
        <div className="balance">
          ${simulatedSavingsBalance?.toFixed(2) || '0.00'}
          {simulatedSavingsBalance > gameData?.savingsBalance && (
            <span className="interest-indicator">📈 +Interest</span>
          )}
        </div>
        <p>2% APY - Low risk, steady growth</p>
        
        <div className="transfer-section">
          <input 
            type="number" 
            value={transferAmount}
            onChange={(e) => setTransferAmount(Number(e.target.value))}
            min="1"
            max={gameData?.checkingBalance || 0}
            className="amount-input"
          />
          <button 
            onClick={() => onAction('transfer-savings', transferAmount)}
            disabled={loading || transferAmount <= 0 || transferAmount > (gameData?.checkingBalance || 0)}
            className="action-btn transfer"
          >
            ➡️ Transfer to Savings
          </button>
        </div>
      </div>

      <div className="tradfi-benefits">
        <h4>TradFi Benefits:</h4>
        <ul>
          <li>FDIC Insured</li>
          <li>Predictable returns</li>
          <li>High liquidity</li>
          <li>Regulatory protection</li>
        </ul>
      </div>
    </div>
  );
};

export default TradFiPanel;