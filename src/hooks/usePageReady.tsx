import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface PageReadyContextType {
  isPageReady: boolean;
  setPageReady: () => void;
  resetPageReady: () => void;
}

const PageReadyContext = createContext<PageReadyContextType>({
  isPageReady: false,
  setPageReady: () => {},
  resetPageReady: () => {},
});

export const PageReadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPageReady, setIsPageReady] = useState(false);

  const setPageReady = useCallback(() => {
    setIsPageReady(true);
  }, []);

  const resetPageReady = useCallback(() => {
    setIsPageReady(false);
  }, []);

  return (
    <PageReadyContext.Provider value={{ isPageReady, setPageReady, resetPageReady }}>
      {children}
    </PageReadyContext.Provider>
  );
};

export const usePageReady = () => useContext(PageReadyContext);

// Hook to mark page as ready when component mounts (for simple pages)
export const useMarkPageReady = () => {
  const { setPageReady } = usePageReady();
  
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = requestAnimationFrame(() => {
      setPageReady();
    });
    return () => cancelAnimationFrame(timer);
  }, [setPageReady]);
};
