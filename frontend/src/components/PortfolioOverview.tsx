import { Card } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PortfolioOverviewProps {
  totalValue: number;
  checkingBalance: number;
  savingsBalance: number;
  solanaBalance: number;
  fvcBalance: number;
  fvcPrice: number;
}

export default function PortfolioOverview({
  totalValue,
  checkingBalance,
  savingsBalance,
  solanaBalance,
  fvcBalance,
  fvcPrice
}: PortfolioOverviewProps) {
  const fvcValue = fvcBalance * fvcPrice;
  
  const data = [
    { name: 'Checking', value: checkingBalance, color: '#3b82f6' },
    { name: 'Savings', value: savingsBalance, color: '#10b981' },
    { name: 'SOL', value: solanaBalance, color: '#8b5cf6' },
    { name: 'FVC', value: fvcValue, color: '#ec4899' }
  ].filter(item => item.value > 0);

  const tradfiTotal = checkingBalance + savingsBalance;
  const defiTotal = solanaBalance + fvcValue;
  const tradfiPercent = totalValue > 0 ? (tradfiTotal / totalValue) * 100 : 0;
  const defiPercent = totalValue > 0 ? (defiTotal / totalValue) * 100 : 0;

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="font-semibold mb-4 text-slate-800">Portfolio Overview</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No assets yet
            </div>
          )}
        </div>

        {/* Allocation Stats */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">TradFi Allocation</span>
              <span className="font-semibold text-blue-600">{tradfiPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${tradfiPercent}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-slate-500">
              ${tradfiTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">DeFi Allocation</span>
              <span className="font-semibold text-purple-600">{defiPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${defiPercent}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-slate-500">
              ${defiTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Total Portfolio</span>
              <span className="font-bold text-slate-800">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <p className="text-xs text-slate-600">
              {tradfiPercent > 80 && "Conservative allocation - Low risk, steady growth"}
              {defiPercent > 70 && "Aggressive allocation - High risk, high potential"}
              {tradfiPercent >= 40 && tradfiPercent <= 60 && "Balanced allocation - Diversified risk"}
              {tradfiPercent === 0 && defiPercent === 0 && "Start allocating your funds!"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
