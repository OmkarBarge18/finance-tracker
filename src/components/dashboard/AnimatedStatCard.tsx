'use client';

import React, { useEffect, useRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { animateValue, initCardTilt } from '@/lib/animations';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  prefix?: string;
  decimals?: number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: LucideIcon;
  colorScheme: 'emerald' | 'indigo' | 'rose' | 'amber';
}

export default function AnimatedStatCard({
  title,
  value,
  prefix = '$',
  decimals = 2,
  trend,
  icon: Icon,
  colorScheme,
}: AnimatedStatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      const cleanup = initCardTilt(cardRef.current);
      return cleanup;
    }
  }, []);

  useEffect(() => {
    if (valueRef.current) {
      animateValue({
        targetRef: valueRef.current,
        endValue: value,
        prefix,
        decimals,
        duration: 800,
      });
    }
  }, [value, prefix, decimals]);

  const schemeStyles = {
    emerald: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40',
    indigo: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/40',
    rose: 'text-rose-400 bg-rose-950/30 border-rose-900/40',
    amber: 'text-amber-400 bg-amber-950/30 border-amber-900/40',
  }[colorScheme];

  return (
    <div
      ref={cardRef}
      className="surface-card rounded-xl p-5 relative overflow-hidden transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${schemeStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Numerical Value */}
      <div className="mt-3 flex items-baseline space-x-1">
        <span
          ref={valueRef}
          className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-tabular"
        >
          {prefix}0.00
        </span>
      </div>

      {/* Real contextual trend if provided */}
      {trend && (
        <div className="mt-3 flex items-center space-x-1.5 text-xs">
          {trend.isPositive ? (
            <span className="flex items-center font-medium text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          ) : (
            <span className="flex items-center font-medium text-rose-400">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {trend.value}%
            </span>
          )}
          <span className="text-slate-400 text-[11px]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
