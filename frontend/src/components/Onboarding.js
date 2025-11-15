import React from 'react';

const Onboarding = ({ onCreateGame, loading }) => {
  return (
    <div className="onboarding">
      <header className="onboarding-header">
        <h1>🌉 BridgeFolio</h1>
        <p>The Financial Literacy Game That Bridges TradFi and DeFi</p>
      </header>

      <div className="onboarding-content">
        <div className="sponsor-logos">
          <div className="sponsor">Capital One</div>
          <div className="bridge-symbol">⟷</div>
          <div className="sponsor">Solana</div>
          <div className="education">T. Rowe Price Education</div>
        </div>

        <div className="game-description">
          <h2>Learn Financial Concepts Through Real Blockchain Transactions</h2>
          <ul>
            <li>🏦 Manage real Capital One checking & savings accounts</li>
            <li>🪙 Trade custom FVC tokens on Solana Devnet</li>
            <li>📚 Learn Risk vs. Return, Volatility, and Diversification</li>
            <li>⚡ Experience live blockchain transactions</li>
          </ul>
        </div>

        <button 
          className="start-game-btn" 
          onClick={onCreateGame}
          disabled={loading}
        >
          {loading ? 'Creating Your Financial Universe...' : 'Start New Game'}
        </button>

        <div className="disclaimer">
          <small>
            Demo uses Capital One Nessie API and Solana Devnet. 
            No real money involved.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;