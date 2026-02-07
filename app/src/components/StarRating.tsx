import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
    showValue = false,
    className
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div className="flex">
                {Array.from({ length: maxRating }, (_, i) => {
                    const value = i + 1;
                    const isFilled = value <= displayRating;
                    const isHalfFilled = !isFilled && value - 0.5 <= displayRating;

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            onMouseLeave={handleMouseLeave}
                            className={cn(
                                'focus:outline-none transition-colors',
                                interactive && 'cursor-pointer hover:scale-110'
                            )}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    isFilled
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : isHalfFilled
                                            ? 'fill-yellow-400/50 text-yellow-400'
                                            : 'fill-gray-200 text-gray-200'
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm text-gray-600 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

export default StarRating;
