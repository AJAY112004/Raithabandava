import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'harvested' | 'stored' | 'in-transit' | 'delivered';
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    harvested: {
      label: 'Harvested',
      labelKn: 'ಕೊಯ್ಲು',
      className: 'bg-warning/20 text-warning border-warning/30'
    },
    stored: {
      label: 'Stored',
      labelKn: 'ಸಂಗ್ರಹಿಸಲಾಗಿದೆ',
      className: 'bg-sky/20 text-sky border-sky/30'
    },
    'in-transit': {
      label: 'In Transit',
      labelKn: 'ಸಾಗಣೆಯಲ್ಲಿ',
      className: 'bg-primary/20 text-primary border-primary/30'
    },
    delivered: {
      label: 'Delivered',
      labelKn: 'ತಲುಪಿಸಲಾಗಿದೆ',
      className: 'bg-success/20 text-success border-success/30'
    }
  };

  const config = statusConfig[status];

  return (
    <span 
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border transition-smooth',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;