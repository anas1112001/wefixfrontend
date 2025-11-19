import React, { FC } from 'react';

interface ImageProps {
    alt: string;
    className?: string;
    onClick?: () => void; 
    src: string;
}

const Image: FC<ImageProps> = ({ alt, className, onClick , src,  }) => (
    <img
        src={src}
        alt={alt}
        className={className}
        onClick={onClick} 
    />
);

export default Image;
