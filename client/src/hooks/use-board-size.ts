import { useEffect } from 'react';

// useBoardSize.ts - call once on the Play page
export function useBoardSize() {
  useEffect(() => {
    const root = document.documentElement;
    const stage = document.querySelector<HTMLElement>(".stage");
    const wrap = document.querySelector<HTMLElement>(".board-wrap");
    const keypad = document.querySelector<HTMLElement>(".custom-keypad");
    const header = document.querySelector<HTMLElement>(".header"); // adjust if different

    const getViewportH = () => (window as any).visualViewport?.height ?? window.innerHeight;

    const applyVH = () => {
      root.style.setProperty("--vh", `${getViewportH()}px`);
    };

    const sizeBoard = () => {
      if (!stage || !wrap) return;

      // Measure real header and keypad heights
      const headerH = header?.offsetHeight ?? parseInt(getComputedStyle(root).getPropertyValue("--header-h")) || 84;
      const keypadH = keypad?.offsetHeight ?? 0;

      // Space available for the square (height & width)
      const viewportH = getViewportH();
      const stageH = viewportH - headerH;
      const availH = stageH - keypadH - 2 * 16; // 16px gutters
      const availW = window.innerWidth - 2 * 16; // 16px gutters

      // The board is the largest square that fits
      const boardSize = Math.min(availH, availW);

      // Set the board size CSS variable
      root.style.setProperty("--board-size", `${boardSize}px`);
    };

    // Initial setup
    applyVH();
    sizeBoard();

    // Update on resize and orientation change
    const handleResize = () => {
      applyVH();
      sizeBoard();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    // Update on visual viewport changes (mobile browsers)
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', handleResize);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);
}
