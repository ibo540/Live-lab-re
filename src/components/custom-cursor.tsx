'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mouseX = -100;
        let mouseY = -100;
        let cursorX = -100;
        let cursorY = -100;
        let isMoving = false;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;

            // Force initial position update immediately on first move
            if (cursorX === -100) {
                cursorX = mouseX;
                cursorY = mouseY;
            }
        };

        const onMouseDown = () => setIsHovering(true);
        const onMouseUp = () => setIsHovering(false);

        // Hover detection for interactive elements
        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Broad check for interactive elements since standard cursor is hidden
            const isInteractive =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'LABEL' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                target.classList.contains('cursor-pointer') ||
                getComputedStyle(target).cursor === 'pointer';

            if (isInteractive) {
                setIsHovering(true);
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            setIsHovering(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        // Animation Loop
        let animationFrameId: number;
        const animate = () => {
            if (isMoving) {
                // No delay/lerp effectively
                cursorX = mouseX;
                cursorY = mouseY;

                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-100 ease-out will-change-transform flex items-center justify-center
        ${isHovering ? 'w-[50px] h-[50px] border-[3px] opacity-100' : 'w-[45px] h-[45px] border-[2px] opacity-100'}
        border-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]`}
        >
            <div className={`bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] ${isHovering ? 'w-[8px] h-[8px]' : 'w-[6px] h-[6px]'}`} />
        </div>
    );
}
