import { X, Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import AIMentorCharacter from './AIMentorCharacter';

export type MentorMessageType = 'risk-warning' | 'volatility-alert' | 'diversification-tip' | 'success';

export interface MentorMessage {
  type: MentorMessageType;
  title: string;
  message: string;
  concept: string;
}

interface AIMentorPopupProps {
  message: MentorMessage;
  onClose: () => void;
}

export default function AIMentorPopup({ message, onClose }: AIMentorPopupProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'risk-warning':
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'volatility-alert':
        return <TrendingUp className="h-6 w-6 text-red-600" />;
      case 'diversification-tip':
        return <Lightbulb className="h-6 w-6 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Lightbulb className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColor = () => {
    switch (message.type) {
      case 'risk-warning':
        return 'from-orange-50 to-orange-100 border-orange-300';
      case 'volatility-alert':
        return 'from-red-50 to-red-100 border-red-300';
      case 'diversification-tip':
        return 'from-yellow-50 to-yellow-100 border-yellow-300';
      case 'success':
        return 'from-green-50 to-green-100 border-green-300';
      default:
        return 'from-blue-50 to-blue-100 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg w-full"
      >
        <Card className={`p-6 bg-gradient-to-br ${getColor()} border-2 shadow-2xl`}>
          <div className="flex items-start gap-4 mb-4">
            {/* AI Character */}
            <div className="flex-shrink-0">
              <AIMentorCharacter />
            </div>
            
            {/* Header and Close Button */}
            <div className="flex-1 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">AI Financial Mentor</h3>
                  <p className="text-xs text-slate-600">{message.concept}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">{message.title}</h4>
            <p className="text-slate-700 leading-relaxed">{message.message}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Got it!
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}