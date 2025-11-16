import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, DollarSign, TrendingUp, Home, Loader2, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Logo from './Logo';
import TradFiSection from './TradFiSection';
import DeFiSection from './DeFiSection';
import PortfolioOverview from './PortfolioOverview';
import AIMentorPopup, { MentorMessage } from './AIMentorPopup';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserData {
  userId: string;
  customerId: string;
  checkingId: string;
  savingsId: string;
  solanaPublicKey: string;
  solanaTokenAccount: string;
}

interface GameData {
  checkingBalance: number;
  savingsBalance: number;
  fvcBalance: number;
  fvcPrice: number;
  deFiValue: number;
}

export default function Dashboard({ user, onBackToStart }: { user: UserData; onBackToStart: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(1);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mentorMessage, setMentorMessage] = useState<MentorMessage | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastMentorCheck, setLastMentorCheck] = useState(0);

  const monthlyIncome = 5000;
  const monthlyBills = 2000;
  const disposableIncome = monthlyIncome - monthlyBills;

  // Fetch user data from backend
  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${user.userId}`);
      setGameData({
        checkingBalance: response.data.checkingBalance || 0,
        savingsBalance: response.data.savingsBalance || 0,
        fvcBalance: response.data.fvcBalance || 0,
        fvcPrice: response.data.fvcPrice || 1.0,
        deFiValue: response.data.deFiValue || 0
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch game data:', error);
      if (error.response?.status === 404) {
        // User not found, clear session
        localStorage.removeItem('bridgefolio_user');
        onBackToStart();
      }
      setLoading(false);
    }
  };

  // Refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGameData();
    setRefreshing(false);
  };

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchGameData();
    
    // Refresh every 5 seconds to get latest balances and FVC price
    const interval = setInterval(() => {
      fetchGameData();
    }, 5000);

    return () => clearInterval(interval);
  }, [user.userId]);

  // Simulate monthly paycheck (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/paycheck`, {
          userId: user.userId,
          amount: disposableIncome
        });
        
        setCurrentMonth(prev => prev + 1);
        
        // Show paycheck notification
        setMentorMessage({
          type: 'success',
          title: 'Monthly Paycheck Received!',
          message: `You've received $${monthlyIncome.toLocaleString()}. After paying $${monthlyBills.toLocaleString()} in bills, you have $${disposableIncome.toLocaleString()} in disposable income. How will you allocate it?`,
          concept: 'Income Management'
        });

        // Refresh data after paycheck
        await fetchGameData();
      } catch (error) {
        console.error('Failed to process paycheck:', error);
      }
    }, 30000); // Every 30 seconds = 1 month

    return () => clearInterval(timer);
  }, [user.userId]);

  // Fetch AI mentor advice based on portfolio changes
  useEffect(() => {
    if (!gameData) return;

    const totalPortfolio = gameData.checkingBalance + gameData.savingsBalance + gameData.deFiValue;
    
    // Only check for advice every 10 seconds and if portfolio is substantial
    const now = Date.now();
    if (totalPortfolio > 500 && now - lastMentorCheck > 10000) {
      setLastMentorCheck(now);
      
      // Fetch AI advice from backend
      axios.post(`${API_BASE_URL}/api/mentor-advice`, {
        userId: user.userId
      })
      .then(response => {
        if (response.data.advice) {
          setMentorMessage({
            type: 'diversification-tip', // Default type
            title: response.data.advice.title,
            message: response.data.advice.body,
            concept: response.data.advice.concept
          });
        }
      })
      .catch(error => {
        console.error('Failed to fetch mentor advice:', error);
      });
    }
  }, [gameData?.checkingBalance, gameData?.savingsBalance, gameData?.deFiValue]);

  const handleMoveToSavings = async (amount: number) => {
    try {
      await axios.post(`${API_BASE_URL}/api/transfer-to-savings`, {
        userId: user.userId,
        amount
      });
      await fetchGameData(); // Refresh to show updated balances
    } catch (error) {
      console.error('Failed to transfer to savings:', error);
    }
  };

  const handleBridgeToSolana = async (amount: number) => {
    try {
      await axios.post(`${API_BASE_URL}/api/bridge-to-solana`, {
        userId: user.userId,
        amount
      });
      await fetchGameData(); // Refresh to show updated balances
    } catch (error) {
      console.error('Failed to bridge to Solana:', error);
    }
  };

  const handleBuyFVC = async (usdAmount: number) => {
    // TODO: Implement FVC buy endpoint in backend
    console.log('Buying FVC:', usdAmount);
  };

  const handleSellFVC = async (fvcAmount: number) => {
    // TODO: Implement FVC sell endpoint in backend
    console.log('Selling FVC:', fvcAmount);
  };

  if (loading || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading your financial universe...</p>
        </div>
      </div>
    );
  }

  const solanaBalance = gameData.deFiValue / (gameData.fvcPrice || 1);
  const totalPortfolioValue = gameData.checkingBalance + gameData.savingsBalance + gameData.deFiValue;

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Logo size="sm" />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Month {currentMonth}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-sm">
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview
          totalValue={totalPortfolioValue}
          checkingBalance={gameData.checkingBalance}
          savingsBalance={gameData.savingsBalance}
          solanaBalance={solanaBalance}
          fvcBalance={gameData.fvcBalance}
          fvcPrice={gameData.fvcPrice}
        />

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* TradFi Section */}
          <TradFiSection
            checkingBalance={gameData.checkingBalance}
            savingsBalance={gameData.savingsBalance}
            onMoveToSavings={handleMoveToSavings}
            onBridgeToSolana={handleBridgeToSolana}
          />

          {/* DeFi Section */}
          <DeFiSection
            solanaBalance={solanaBalance}
            fvcBalance={gameData.fvcBalance}
            fvcPrice={gameData.fvcPrice}
            onBuyFVC={handleBuyFVC}
            onSellFVC={handleSellFVC}
          />
        </div>

        {/* Educational Info */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-slate-800">Financial Literacy Tips</h3>
              <p className="text-slate-600">
                Your AI mentor watches your portfolio allocation and provides real-time educational guidance powered by Gemini AI. 
                Try different strategies: conservative (savings-heavy), aggressive (DeFi-heavy), or balanced (diversified).
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="gap-2 text-slate-500 hover:text-slate-700"
            >
              <Home className="h-4 w-4" />
              Reset Game
            </Button>
          </div>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <h3 className="font-semibold">Reset Game?</h3>
            <p className="text-slate-600">
              Are you sure you want to go back to the start page? Your current progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowResetConfirm(false);
                  onBackToStart();
                }}
              >
                Reset Game
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* AI Mentor Popup */}
      {mentorMessage && (
        <AIMentorPopup
          message={mentorMessage}
          onClose={() => setMentorMessage(null)}
        />
      )}
    </div>
  );
}
