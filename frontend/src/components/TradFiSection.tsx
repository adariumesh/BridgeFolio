import { useState } from 'react';
import { Building2, Wallet, PiggyBank, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TradFiSectionProps {
  checkingBalance: number;
  savingsBalance: number;
  onMoveToSavings: (amount: number) => void;
  onBridgeToSolana: (amount: number) => void;
}

export default function TradFiSection({
  checkingBalance,
  savingsBalance,
  onMoveToSavings,
  onBridgeToSolana
}: TradFiSectionProps) {
  const [savingsAmount, setSavingsAmount] = useState('');
  const [bridgeAmount, setBridgeAmount] = useState('');

  const savingsInterestRate = 0.04; // 4% APY
  const monthlyInterest = (savingsBalance * savingsInterestRate) / 12;

  const handleMoveToSavings = () => {
    const amount = parseFloat(savingsAmount);
    if (amount > 0 && amount <= checkingBalance) {
      onMoveToSavings(amount);
      setSavingsAmount('');
    }
  };

  const handleBridge = () => {
    const amount = parseFloat(bridgeAmount);
    if (amount > 0 && amount <= checkingBalance) {
      onBridgeToSolana(amount);
      setBridgeAmount('');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-blue-600 p-2 shadow-sm">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Traditional Finance (TradFi)</h2>
          <p className="text-sm text-slate-600">Capital One Accounts</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Checking Account */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-slate-700">Checking Account</span>
            </div>
            <span className="font-bold text-blue-600">
              ${checkingBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-500">Available for spending and transfers</p>
        </div>

        {/* Savings Account */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-green-600" />
              <span className="font-medium text-slate-700">Savings Account</span>
            </div>
            <span className="font-bold text-green-600">
              ${savingsBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">4% APY</span>
            <span className="text-green-600">
              +${monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month
            </span>
          </div>
        </div>

        {/* Move to Savings */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <Label className="text-sm text-slate-700 mb-2 block">Move to Savings</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={savingsAmount}
              onChange={(e) => setSavingsAmount(e.target.value)}
              className="flex-1"
              min="0"
              max={checkingBalance}
            />
            <Button
              onClick={handleMoveToSavings}
              disabled={!savingsAmount || parseFloat(savingsAmount) <= 0 || parseFloat(savingsAmount) > checkingBalance}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Earn stable 4% annual interest</p>
        </div>

        {/* Bridge to Solana */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
          <Label className="text-sm text-slate-700 mb-2 block font-semibold">Bridge to Solana (DeFi)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={bridgeAmount}
              onChange={(e) => setBridgeAmount(e.target.value)}
              className="flex-1 bg-white"
              min="0"
              max={checkingBalance}
            />
            <Button
              onClick={handleBridge}
              disabled={!bridgeAmount || parseFloat(bridgeAmount) <= 0 || parseFloat(bridgeAmount) > checkingBalance}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-purple-700 mt-1">Transfer funds to trade volatile crypto assets</p>
        </div>
      </div>
    </Card>
  );
}
