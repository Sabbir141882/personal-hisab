import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../services/financialEngine';

interface MetricCardProps {
  title: string;
  amount: number;
  currencySymbol?: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'slate' | 'emerald' | 'rose' | 'amber' | 'purple' | 'sky';
  badgeText?: string;
  onClick?: () => void;
}

const variantStyles: Record<
  NonNullable<MetricCardProps['variant']>,
  { bg: string; border: string; text: string; iconBg: string; iconColor: string }
> = {
  slate: {
    bg: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-900',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  emerald: {
    bg: 'bg-emerald-50/40',
    border: 'border-emerald-200/80',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  rose: {
    bg: 'bg-rose-50/40',
    border: 'border-rose-200/80',
    text: 'text-rose-900',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
  amber: {
    bg: 'bg-amber-50/40',
    border: 'border-amber-200/80',
    text: 'text-amber-900',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  purple: {
    bg: 'bg-purple-50/40',
    border: 'border-purple-200/80',
    text: 'text-purple-900',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
  },
  sky: {
    bg: 'bg-sky-50/40',
    border: 'border-sky-200/80',
    text: 'text-sky-900',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  currencySymbol = 'BDT',
  subtitle,
  icon: Icon,
  variant = 'slate',
  badgeText,
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border ${styles.bg} ${styles.border} shadow-2xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-semibold text-slate-500 tracking-tight truncate">{title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badgeText && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 shadow-2xs">
              {badgeText}
            </span>
          )}
          {Icon && (
            <div className={`p-2 rounded-xl ${styles.iconBg} ${styles.iconColor} shadow-2xs`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${styles.text}`}>
        {formatCurrency(amount, currencySymbol)}
      </div>

      {subtitle && <p className="text-[11px] font-medium text-slate-500 mt-1.5 truncate">{subtitle}</p>}
    </div>
  );
};
