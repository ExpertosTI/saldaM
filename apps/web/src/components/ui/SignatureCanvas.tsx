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
    ({ canvasProps, backgroundColor = 'transparent', onEnd }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [isDrawing, setIsDrawing] = useState(false);
        const [hasDrawn, setHasDrawn] = useState(false);

        // Resize handler that preserves content
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const parent = canvas.parentElement;
            if (!parent) return;

            const rect = parent.getBoundingClientRect();

            // Only resize if dimensions changed significantly
            if (Math.abs(canvas.width - rect.width) > 1 || Math.abs(canvas.height - rect.height) > 1) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                // Save content
                let savedData: ImageData | null = null;
                try {
                    savedData = hasDrawn ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
                } catch (e) {
                    console.warn('Could not save canvas data', e);
                }

                // Resize
                canvas.width = rect.width;
                canvas.height = rect.height;

                // Restore content
                if (savedData) {
                    ctx.putImageData(savedData, 0, 0);
                }

                // Reset context styles
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = '#000000';
            }
        };

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Initial setup
            handleResize();

            // Resize observer
            const resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(handleResize);
            });

            if (canvas.parentElement) {
                resizeObserver.observe(canvas.parentElement);
            }

            // Also listen to window resize as fallback
            window.addEventListener('resize', handleResize);

            return () => {
                resizeObserver.disconnect();
                window.removeEventListener('resize', handleResize);
            };
        }, [hasDrawn]);

        // Helpers
        const getPoint = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };

            const rect = canvas.getBoundingClientRect();
            let clientX = 0;
            let clientY = 0;

            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = (e as React.MouseEvent).clientX;
                clientY = (e as React.MouseEvent).clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
            // CRITICAL: Prevent default to stop scrolling
            // We only prevent default if it's a touch event to avoid blocking mouse clicks elsewhere if needed
            if ('touches' in e && e.cancelable) {
                e.preventDefault();
            }

            setIsDrawing(true);
            const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';

            const { x, y } = getPoint(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
            if ('touches' in e && e.cancelable) {
                e.preventDefault();
            }

            if (!isDrawing) return;
            const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            const { x, y } = getPoint(e);
            ctx.lineTo(x, y);
            ctx.stroke();

            if (!hasDrawn) setHasDrawn(true);
        };

        const stopDrawing = () => {
            if (isDrawing) {
                setIsDrawing(false);
                if (onEnd) onEnd();
            }
        };

        useImperativeHandle(ref, () => ({
            clear: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    setHasDrawn(false);
                }
            },
            isEmpty: () => !hasDrawn,
            getTrimmedCanvas: () => {
                if (!canvasRef.current) throw new Error("Canvas is not initialized");
                return canvasRef.current;
            },
            toDataURL: (type, options) => canvasRef.current?.toDataURL(type, options) || ''
        }));

        return (
            <canvas
                ref={canvasRef}
                {...canvasProps}
                className={canvasProps?.className}
                style={{
                    ...canvasProps?.style,
                    backgroundColor,
                    touchAction: 'none', // CSS property to disable browser handling of gestures
                    display: 'block',    // Removes bottom spacing
                    width: '100%',
                    height: '100%'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        );
    }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;
