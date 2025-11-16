import { Play, GraduationCap, TrendingUp, Shield, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Logo from './Logo';

interface StartPageProps {
  onStart: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function StartPage({ onStart, loading = false, error = null }: StartPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1a2332] via-[#1e3a5f] to-[#2d1b3d]">
      <div className="max-w-5xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            <span className="text-white">Master Your </span>
            <span className="text-[#4FD1C5]">Financial Future</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A life simulator game that teaches you the fundamentals of financial literacy through hands-on portfolio management.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button 
            onClick={onStart} 
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-[#3B7EA1] to-[#4FD1C5] hover:from-[#2d5f7a] hover:to-[#3db8a8] text-white px-8 py-6 text-lg gap-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Your Financial Universe...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Your Journey
              </>
            )}
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 bg-white/10 backdrop-blur border-[#D4AF37]/30 hover:shadow-lg hover:bg-white/15 transition-all">
            <div className="rounded-xl bg-[#D4AF37]/20 w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Traditional Finance (TradFi)</h3>
            <p className="text-slate-300">Manage your Capital One checking and savings accounts with stable, low-risk returns.</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur border-[#8B5CF6]/30 hover:shadow-lg hover:bg-white/15 transition-all">
            <div className="rounded-xl bg-[#8B5CF6]/20 w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Decentralized Finance (DeFi)</h3>
            <p className="text-slate-300">Bridge funds to your Solana wallet and trade the volatile BridgeFolio Coin (FVC).</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur border-[#4FD1C5]/30 hover:shadow-lg hover:bg-white/15 transition-all">
            <div className="rounded-xl bg-[#4FD1C5]/20 w-12 h-12 flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-[#4FD1C5]" />
            </div>
            <h3 className="font-semibold mb-2 text-white">AI Financial Mentor</h3>
            <p className="text-slate-300">Learn key concepts like risk vs. return, volatility, and diversification in real-time.</p>
          </Card>
        </div>

        {/* Educational Focus */}
        <Card className="p-8 bg-white/10 backdrop-blur border-2 border-[#4FD1C5]/30">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#4FD1C5]/20 p-3 shadow-sm">
              <TrendingUp className="h-8 w-8 text-[#4FD1C5]" />
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-white">Powered by T. Rowe Price Educational Framework</h3>
              <p className="text-slate-300">
                Learn fundamental investment principles through interactive gameplay. Receive real-time guidance 
                on portfolio allocation, understand the relationship between risk and return, and master the 
                art of diversification.
              </p>
            </div>
          </div>
        </Card>

        {/* Sponsor Credits */}
        <div className="text-center text-slate-300 space-y-2">
          <p>Integrating technologies from</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg shadow-sm font-medium border border-white/20">Capital One</span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg shadow-sm font-medium border border-white/20">Solana</span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg shadow-sm font-medium border border-white/20">T. Rowe Price</span>
          </div>
        </div>
      </div>
    </div>
  );
}