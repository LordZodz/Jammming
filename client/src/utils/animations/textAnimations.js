import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that determines whether a text element should scroll (marquee) based on whether its content overflows its container.
 * It also sets a CSS variable for the offset to ensure the animation scrolls the correct distance.
 * 
 * The hook uses a ResizeObserver to re-measure the text element whenever its container is resized, 
 * ensuring the marquee effect adapts to layout changes.
 * 
 * @param {*} dep - A dependency that triggers re-measurement when it changes (e.g. the text content)
 * @param {*} active - A boolean indicating whether the marquee effect should be active (e.g. only scroll when the player is active)
 * @returns An array containing a ref to be attached to the text element and a boolean indicating whether it should scroll
 */
function useMarquee(dep, active) {
    const ref = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        if (!active || !ref.current) {
            setShouldScroll(false);
            return;
        }

        const el = ref.current;

        const measure = () => {
            const overflow = el.scrollWidth - el.parentElement.clientWidth;
            if (overflow > 0) {
                const newOffset = `-${overflow}px`;
                const prevOffset = el.style.getPropertyValue('--marquee-offset');
                el.style.setProperty('--marquee-offset', newOffset);
                if (prevOffset && prevOffset !== newOffset) {
                    // Restart the animation so it immediately uses the new offset
                    // rather than waiting for the current iteration to finish
                    el.style.animation = 'none';
                    void el.offsetHeight; // force reflow to flush the change
                    el.style.animation = '';
                }
                setShouldScroll(true);
            } else {
                el.style.removeProperty('--marquee-offset');
                setShouldScroll(false);
            }
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(el.parentElement);

        return () => observer.disconnect();
    }, [dep, active]);

    return [ref, shouldScroll];
};

export {
    useMarquee,
}