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

        useImperativeHandle(ref, () => ({
            clear: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    setHasDrawn(false);
                }
            },
            isEmpty: () => !hasDrawn,
            getTrimmedCanvas: () => {
                // For now return the full canvas. Implementing trim needs pixel analysis.
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
                    // Only resize if dimensions actually changed to avoid clearing loop
                    if (canvas.width !== rect.width || canvas.height !== rect.height) {
                        // Store current image data to restore after resize if desired
                        // For now we clear on resize as scaling bitmaps is tricky without blur
                        canvas.width = rect.width;
                        canvas.height = rect.height;

                        // Reset context props
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 2;
                    }
                }
            };

            const resizeObserver = new ResizeObserver(() => {
                resizeCanvas();
            });

            if (canvas.parentElement) {
                resizeObserver.observe(canvas.parentElement);
            }

            // Initial sizing
            resizeCanvas();

            return () => {
                resizeObserver.disconnect();
            };
        }, []);

        const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
            // Prevent scrolling on touch devices
            if ('touches' in e && e.cancelable) {
                e.preventDefault();
            }

            setIsDrawing(true);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Ensure context props are set correctly every time we start
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'black';

            const { x, y } = getCoordinates(e, canvas);
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
            // Prevent scrolling on touch devices
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
        };

        const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
            // Prevent default if needed, though usually not for end
            if (isDrawing) {
                setIsDrawing(false);
                if (onEnd) onEnd();
            }
        };

        // ... getCoordinates ...

        return (
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
        );
    }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;
