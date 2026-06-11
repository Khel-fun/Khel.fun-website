import { useEffect, RefObject } from "react";
import gsap from "gsap";

export default function useMouseParallax(
    // Type the ref as a RefObject holding an HTMLDivElement
    ref: RefObject<HTMLDivElement>
): void {
    useEffect(() => {
        if (!ref || !ref.current) return;

        const container = ref.current;

        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        let rafId: number | null = null;
        let lastX = 0;

        const updateParallax = (clientX: number) => {
            const rect = container.getBoundingClientRect();
            const relX = clientX - rect.left;
            const nx = (relX / rect.width - 0.5);

            const textX = nx * 6;
            const skyX = nx * 12;
            const bgX = nx * 20;

            gsap.to('.main .text', { x: `${textX}%`, duration: 0.9, overwrite: "auto" });
            gsap.to('.sky', { x: `${skyX}px`, duration: 0.9, overwrite: "auto" });
            gsap.to('.bg', { x: `${bgX}px`, duration: 0.9, overwrite: "auto" });
        };

        const onPointerMove = (e: PointerEvent) => {
            lastX = e.clientX;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                updateParallax(lastX);
                rafId = null;
            });
        };

        container.addEventListener('pointermove', onPointerMove, { passive: true } as AddEventListenerOptions);
        container.addEventListener('mousemove', onPointerMove as EventListener, { passive: true } as AddEventListenerOptions);

        const onLeave = () => {
            gsap.to(['.main .text', '.sky', '.bg'], { x: 0, duration: 0.8, overwrite: "auto" });
        };

        container.addEventListener('pointerleave', onLeave);
        container.addEventListener('mouseleave', onLeave);

        return () => {
            container.removeEventListener('pointermove', onPointerMove as EventListener);
            container.removeEventListener('mousemove', onPointerMove as EventListener);
            container.removeEventListener('pointerleave', onLeave);
            container.removeEventListener('mouseleave', onLeave);
            if (rafId) cancelAnimationFrame(rafId);
        };

    }, [ref]);
}