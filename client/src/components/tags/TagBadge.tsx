import React from 'react';
import { Badge } from '../ui/badge';
import { Hash } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TagBadgeProps {
  name: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function TagBadge({
  name,
  count,
  isSelected,
  onClick,
  onRemove,
  size = 'default',
  className,
}: TagBadgeProps) {
  return (
    <Badge
      variant={isSelected ? 'default' : 'secondary'}
      size={size}
      onRemove={onRemove}
      onClick={onClick}
      className={cn(
        'group transition-all duration-150',
        onClick && 'cursor-pointer hover:border-primary/40 hover:bg-muted/80',
        isSelected && 'bg-primary text-primary-foreground shadow-sm',
        className
      )}
    >
      <Hash className="mr-1 h-3 w-3 opacity-60 group-hover:opacity-100" />
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
            isSelected
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted-foreground/15 text-muted-foreground'
          )}
        >
          {count}
        </span>
      )}
    </Badge>
  );
}
