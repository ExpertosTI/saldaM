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

            // Handle resizing
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                if (parent) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                    // Reset context props after resize
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                }
            };

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            return () => window.removeEventListener('resize', resizeCanvas);
        }, []);

        const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
            setIsDrawing(true);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Responsive line width
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'black';

            const { x, y } = getCoordinates(e, canvas);
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
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

        const stopDrawing = () => {
            if (isDrawing) {
                setIsDrawing(false);
                if (onEnd) onEnd();
            }
        };

        const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
            let clientX, clientY;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
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
