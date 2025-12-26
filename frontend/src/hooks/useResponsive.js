import { useState, useEffect } from 'react';

function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 767;
  const isTablet = windowSize.width <= 1199 && windowSize.width > 767;
  const isDesktop = windowSize.width > 1199;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
  };
}

export default useResponsive;

