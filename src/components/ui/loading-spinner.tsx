import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

// FP4: Shared loading component for Suspense boundaries
export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center h-64', className)}>
      <div className="text-center space-y-4">
        <div className={cn('animate-spin rounded-full border-b-2 border-blue-600 mx-auto', sizeClasses[size])}></div>
        {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    </div>
  );
}
