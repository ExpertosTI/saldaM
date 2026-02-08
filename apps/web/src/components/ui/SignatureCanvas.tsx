'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    backgroundColor?: string;
    onEnd?: () => void;
}

export interface SignatureCanvasRef {
    clear: () => void;
    isEmpty: () => boolean;
    getTrimmedCanvas: () => HTMLCanvasElement;
    toDataURL: (type?: string, encoderOptions?: number) => string;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
        const [debugInfo, setDebugInfo] = useState('');

useImperativeHandle(ref, () => ({
    clear: () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
            setDebugInfo('Cleared');
        }
    },
    isEmpty: () => !hasDrawn,
    getTrimmedCanvas: () => {
        return canvasRef.current!;
    },
    toDataURL: (type?: string, encoderOptions?: number) => {
        return canvasRef.current?.toDataURL(type, encoderOptions) || '';
    }
}));

useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                // Save current content
                const savedData = hasDrawn ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;

                canvas.width = rect.width;
                canvas.height = rect.height;

                // Restore content if exists
                if (savedData) {
                    ctx.putImageData(savedData, 0, 0);
                }

                // Reset context props
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
            }
        }
    };

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });

    if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }

    resizeCanvas();

    return () => {
        resizeObserver.disconnect();
    };
}, [hasDrawn]); // Add hasDrawn dependency to capture correct state for saving

const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.cancelable) {
        e.preventDefault();
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);

    setDebugInfo(`Start: ${Math.round(x)},${Math.round(y)}`);
};

const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.cancelable) {
        e.preventDefault();
    }

    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasDrawn) setHasDrawn(true);
    setDebugInfo(`Move: ${Math.round(x)},${Math.round(y)}`);
};

const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isDrawing) {
        setIsDrawing(false);
        if (onEnd) onEnd();
        setDebugInfo('End');
    }
};

const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0]!.clientX;
        clientY = e.touches[0]!.clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
};

return (
    <div className="relative w-full h-full">
        <canvas
            ref={canvasRef}
            {...canvasProps}
            style={{ ...canvasProps?.style, backgroundColor, touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
        {/* Debug element - temporary */}
        <div className="absolute top-0 left-0 text-[10px] text-gray-300 pointer-events-none p-1">
            {debugInfo}
        </div>
    </div>
);
    }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;
