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
            <div className="flex" onMouseLeave={interactive ? handleMouseLeave : undefined}>
                {Array.from({ length: maxRating }, (_, i) => {
                    const value = i + 1;
                    const isFilled = value <= displayRating;
                    // Check for half star: value is greater than rating, but previous value (value-1) + 0.5 is <= rating
                    // e.g. Rating 3.5. i=3 (value 4). 3 is filled. 4 is not. 
                    // 3.5 >= 3.5 -> True. So star 4 should be half? 
                    // Wait. Star 1 (0-1), Star 2 (1-2), Star 3 (2-3), Star 4 (3-4).
                    // If rating is 3.5, Stars 1,2,3 are full. Star 4 is half.
                    // Star 4 condition: !isFilled AND rating >= (value - 0.5)
                    const isHalfFilled = !isFilled && displayRating >= (value - 0.5);

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            className={cn(
                                'focus:outline-none transition-transform',
                                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                            )}
                        >
                            {isFilled ? (
                                <Star
                                    className={cn(
                                        sizeClasses[size],
                                        'fill-yellow-400 text-yellow-400'
                                    )}
                                />
                            ) : isHalfFilled ? (
                                <div className="relative">
                                    {/* Background empty star */}
                                    <Star className={cn(sizeClasses[size], 'text-gray-200 fill-gray-200')} />
                                    {/* Foreground half star */}
                                    <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                                        <Star className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')} />
                                    </div>
                                </div>
                            ) : (
                                <Star
                                    className={cn(
                                        sizeClasses[size],
                                        'fill-gray-200 text-gray-200'
                                    )}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm font-medium text-gray-700 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

export default StarRating;
