import { useState, useEffect } from 'react';
import { Zap, Coins, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface DeFiSectionProps {
  solanaBalance: number;
  fvcBalance: number;
  fvcPrice: number;
  onBuyFVC: (usdAmount: number) => void;
  onSellFVC: (fvcAmount: number) => void;
}

export default function DeFiSection({
  solanaBalance,
  fvcBalance,
  fvcPrice,
  onBuyFVC,
  onSellFVC
}: DeFiSectionProps) {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [priceHistory, setPriceHistory] = useState<number[]>([fvcPrice]);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    setPriceHistory(prev => {
      const newHistory = [...prev, fvcPrice].slice(-20);
      if (prev.length > 0) {
        const change = ((fvcPrice - prev[prev.length - 1]) / prev[prev.length - 1]) * 100;
        setPriceChange(change);
      }
      return newHistory;
    });
  }, [fvcPrice]);

  const handleBuy = () => {
    const amount = parseFloat(buyAmount);
    if (amount > 0 && amount <= solanaBalance) {
      onBuyFVC(amount);
      setBuyAmount('');
    }
  };

  const handleSell = () => {
    const amount = parseFloat(sellAmount);
    if (amount > 0 && amount <= fvcBalance) {
      onSellFVC(amount);
      setSellAmount('');
    }
  };

  const fvcValue = fvcBalance * fvcPrice;
  const isPositiveChange = priceChange >= 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-2 shadow-sm">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Decentralized Finance (DeFi)</h2>
          <p className="text-sm text-slate-600">Solana Network</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Solana Wallet */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-slate-700">Solana Wallet (USD)</span>
            </div>
            <span className="font-bold text-purple-600">
              ${solanaBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-500">Available for trading FVC</p>
        </div>

        {/* FVC Token Price */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 shadow-sm text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">BridgeFolio Coin (FVC)</span>
            <Badge 
              variant={isPositiveChange ? "default" : "destructive"}
              className={isPositiveChange ? "bg-green-500" : "bg-red-500"}
            >
              {isPositiveChange ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {priceChange.toFixed(2)}%
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${fvcPrice.toFixed(2)}</span>
            <span className="text-sm text-purple-200">per FVC</span>
          </div>
          <div className="mt-2 h-12 flex items-end gap-1">
            {priceHistory.slice(-15).map((price, i) => {
              const maxPrice = Math.max(...priceHistory);
              const minPrice = Math.min(...priceHistory);
              const range = maxPrice - minPrice || 1;
              const height = ((price - minPrice) / range) * 100;
              return (
                <div 
                  key={i} 
                  className="flex-1 bg-white/30 rounded-t"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* FVC Holdings */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-slate-700">Your FVC Holdings</span>
            </div>
            <span className="font-bold text-pink-600">
              {fvcBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} FVC
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Value: ${fvcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Buy FVC */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
          <Label className="text-sm text-slate-700 mb-2 block font-semibold flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Buy FVC
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="USD Amount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                min="0"
                max={solanaBalance}
              />
              {buyAmount && parseFloat(buyAmount) > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  ≈ {(parseFloat(buyAmount) / fvcPrice).toFixed(4)} FVC
                </p>
              )}
            </div>
            <Button
              onClick={handleBuy}
              disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > solanaBalance}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Buy
            </Button>
          </div>
        </div>

        {/* Sell FVC */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-red-200">
          <Label className="text-sm text-slate-700 mb-2 block font-semibold flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Sell FVC
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="FVC Amount"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                min="0"
                max={fvcBalance}
              />
              {sellAmount && parseFloat(sellAmount) > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  ≈ ${(parseFloat(sellAmount) * fvcPrice).toFixed(2)} USD
                </p>
              )}
            </div>
            <Button
              onClick={handleSell}
              disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > fvcBalance}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sell
            </Button>
          </div>
        </div>

        {/* Volatility Warning */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-800">
            ⚠️ <span className="font-semibold">High Volatility:</span> FVC price can change rapidly. 
            Higher risk means higher potential returns, but also higher potential losses.
          </p>
        </div>
      </div>
    </Card>
  );
}
