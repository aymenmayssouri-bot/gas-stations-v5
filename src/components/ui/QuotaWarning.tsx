// src/components/ui/QuotaWarning.tsx
'use client';

import { AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { QuotaStatus } from '@/lib/rateLimit/types';

interface QuotaWarningProps {
  quota: QuotaStatus;
  apiType: 'distanceMatrix' | 'mapsJavaScript';
  warningLevel: 'none' | 'warning' | 'critical' | 'limit';
}

export function QuotaWarning({ quota, apiType, warningLevel }: QuotaWarningProps) {
  if (warningLevel === 'none') return null;

  const info = apiType === 'distanceMatrix' ? quota.distanceMatrix : quota.mapsJavaScript;
  const apiName = apiType === 'distanceMatrix' ? 'Distance Matrix API' : 'Maps JavaScript API';

  const getStyles = () => {
    switch (warningLevel) {
      case 'limit':
        return {
          bg: 'bg-red-100 border-red-400',
          text: 'text-red-700',
          icon: XCircle,
          iconColor: 'text-red-600',
        };
      case 'critical':
        return {
          bg: 'bg-orange-100 border-orange-400',
          text: 'text-orange-700',
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 border-yellow-400',
          text: 'text-yellow-700',
          icon: AlertCircle,
          iconColor: 'text-yellow-600',
        };
      default:
        return {
          bg: 'bg-gray-100 border-gray-400',
          text: 'text-gray-700',
          icon: AlertCircle,
          iconColor: 'text-gray-600',
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  const getMessage = () => {
    if (warningLevel === 'limit') {
      return 'Come back tomorrow!';
    }
    return `Vous avez utilisé ${info.used} sur ${info.limit} ${apiType === 'distanceMatrix' ? 'éléments' : 'chargements'} (${info.percentage.toFixed(1)}%).`;
  };

  const resetsIn = () => {
    const now = new Date();
    const reset = new Date(quota.resetsAt);
    const diff = reset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`mb-4 p-3 border rounded ${styles.bg} ${styles.text} flex items-start gap-3`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
      <div className="flex-1">
        <div className="font-semibold">{warningLevel === 'limit' ? 'Limite atteinte' : 'Attention'}</div>
        <div className="text-sm mt-1">
          {getMessage()}
          {info.remaining > 0 && (
            <span className="block mt-1">
              Restant: {info.remaining} {apiType === 'distanceMatrix' ? 'éléments' : 'chargements'}
            </span>
          )}
          <span className="block mt-1 text-xs opacity-75">
            Réinitialisation dans: {resetsIn()}
          </span>
        </div>
      </div>
    </div>
  );
}