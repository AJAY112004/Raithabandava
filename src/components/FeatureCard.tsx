import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: 'default' | 'highlighted';
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className,
  variant = 'default' 
}: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "p-6 hover-lift group transition-spring border-primary/20",
        variant === 'highlighted' && "border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center transition-smooth group-hover:scale-110",
          variant === 'highlighted' 
            ? "hero-gradient shadow-medium" 
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
        )}>
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground font-poppins">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;