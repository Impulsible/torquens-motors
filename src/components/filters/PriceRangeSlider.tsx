/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/helpers';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (value: { min?: number; max?: number }) => void;
  step?: number;
  currency?: string;
  className?: string;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 500000,
  currency = 'NGN',
  className,
}: PriceRangeSliderProps) {
  const [minValue, setMinValue] = useState<number>(value.min ?? min);
  const [maxValue, setMaxValue] = useState<number>(value.max ?? max);

  useEffect(() => {
    setMinValue(value.min ?? min);
    setMaxValue(value.max ?? max);
  }, [value, min, max]);

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(val);
    onChange({ min: val === min ? undefined : val, max: maxValue === max ? undefined : maxValue });
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(val);
    onChange({ min: minValue === min ? undefined : minValue, max: val === max ? undefined : val });
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val <= maxValue - step) {
      setMinValue(val);
      onChange({ min: val <= min ? undefined : val, max: maxValue === max ? undefined : maxValue });
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= minValue + step) {
      setMaxValue(val);
      onChange({ min: minValue === min ? undefined : minValue, max: val >= max ? undefined : val });
    }
  };

  const minPercent = Math.max(0, Math.min(100, ((minValue - min) / (max - min)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxValue - min) / (max - min)) * 100));

  return (
    <div className={cn('space-y-4 pt-2', className)}>
      {/* Dual Handle Slider Stage */}
      <div className="relative h-6 flex items-center select-none">
        <div className="relative w-full h-1.5 bg-inset rounded-full border border-border/60">
          {/* Active Track Highlight */}
          <div
            className="absolute h-full bg-gold rounded-full shadow-goldGlowSm"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Min Input Slider */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={handleMinSlider}
            className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto z-20"
          />

          {/* Max Input Slider */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxSlider}
            className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto z-30"
          />

          {/* Custom Visual Thumbs */}
          <div
            className="absolute w-4 h-4 bg-gold rounded-full border-2 border-obsidian shadow-card top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{ left: `${minPercent}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-gold rounded-full border-2 border-obsidian shadow-card top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
      </div>

      {/* Manual Numeric Inputs */}
      <div className="grid grid-cols-2 gap-2.5 items-center">
        <Input
          type="number"
          value={minValue}
          onChange={handleMinInput}
          step={step}
          className="text-xs font-mono py-2"
        />
        <Input
          type="number"
          value={maxValue}
          onChange={handleMaxInput}
          step={step}
          className="text-xs font-mono py-2"
        />
      </div>

      {/* Formatted Bounds Helper */}
      <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-wider text-muted pt-1 border-t border-border/40">
        <span>Min: {formatCurrency ? formatCurrency(min, currency) : `₦${min.toLocaleString()}`}</span>
        <span>Max: {formatCurrency ? formatCurrency(max, currency) : `₦${max.toLocaleString()}`}</span>
      </div>
    </div>
  );
}