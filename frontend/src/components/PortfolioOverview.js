import React from 'react';

const PortfolioOverview = ({ gameData, fvcPrice }) => {
  const totalTradFi = (gameData?.checkingBalance || 0) + (gameData?.savingsBalance || 0);
  const totalDeFi = (gameData?.fvcBalance || 0) * fvcPrice;
  const totalPortfolio = totalTradFi + totalDeFi;

  const tradFiPercentage = totalPortfolio > 0 ? (totalTradFi / totalPortfolio) * 100 : 0;
  const deFiPercentage = totalPortfolio > 0 ? (totalDeFi / totalPortfolio) * 100 : 0;

  return (
    <div className="portfolio-overview">
      <h2>Portfolio Overview</h2>
      
      <div className="portfolio-stats">
        <div className="stat-card total">
          <h3>Total Portfolio Value</h3>
          <div className="amount">${totalPortfolio.toFixed(2)}</div>
        </div>
        
        <div className="stat-card tradfi">
          <h3>TradFi (Safe)</h3>
          <div className="amount">${totalTradFi.toFixed(2)}</div>
          <div className="percentage">{tradFiPercentage.toFixed(1)}%</div>
        </div>
        
        <div className="stat-card defi">
          <h3>DeFi (Volatile)</h3>
          <div className="amount">${totalDeFi.toFixed(2)}</div>
          <div className="percentage">{deFiPercentage.toFixed(1)}%</div>
          <div className="live-price">FVC: ${fvcPrice.toFixed(4)}</div>
        </div>
      </div>

      <div className="allocation-bar">
        <div 
          className="tradfi-bar" 
          style={{ width: `${tradFiPercentage}%` }}
        ></div>
        <div 
          className="defi-bar" 
          style={{ width: `${deFiPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PortfolioOverview;