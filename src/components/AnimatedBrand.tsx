import { Link } from 'react-router-dom';

interface AnimatedBrandProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  /** Preset size shortcuts */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional destination, defaults to home */
  to?: string;
  /** Render as Link (default) or plain span */
  as?: 'link' | 'span';
  onClick?: () => void;
}

const sizeMap: Record<string, string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export function AnimatedBrand({ className = '', size = 'md', to = '/', as = 'link', onClick, ...props }: AnimatedBrandProps) {
  const sizeClass = sizeMap[size] ?? '';
  
  const content = (
    <>
      {/* "Sol" in plain foreground so contrast stays good */}
      <span className="text-foreground">Sol</span>
      {/* "Controle" with sweeping shimmer */}
      <span className="brand-animated">Controle</span>
    </>
  );

  if (as === 'span') {
    return (
      <span
        {...props}
        onClick={onClick}
        className={`font-display font-black tracking-tighter inline-flex select-none ${sizeClass} ${className}`}
        aria-label="SolControle"
      >
        {content}
      </span>
    );
  }
  
  return (
    <Link 
      {...(props as any)}
      to={to}
      onClick={onClick}
      className={`font-display font-black tracking-tighter inline-flex select-none hover:opacity-90 transition-opacity active:scale-[0.98] ${sizeClass} ${className}`}
      aria-label="SolControle"
    >
      {content}
    </Link>
  );
}
