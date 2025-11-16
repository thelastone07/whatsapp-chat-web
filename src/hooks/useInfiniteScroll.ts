import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  itemsPerPage: number;
  totalItems: number;
  enabled: boolean;
  reverse?: boolean;
}

export function useInfiniteScroll({
  itemsPerPage,
  totalItems,
  enabled,
  reverse = false
}: UseInfiniteScrollOptions) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || displayCount >= totalItems) return;

    console.log(`${reverse ? 'First' : 'Last'} element visible - loading more items!`);
    loadingRef.current = true;

    setDisplayCount(prev => {
      const newCount = Math.min(prev + itemsPerPage, totalItems);
      setTimeout(() => {
        loadingRef.current = false;
      }, 100);
      return newCount;
    });
  }, [displayCount, totalItems, itemsPerPage, reverse]);

  useEffect(() => {
    if (!enabled) return;

    const trigger = loadMoreTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          console.log('Trigger element is visible in viewport!');
          loadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '200px', // trigger 200px before it comes into view
        threshold: 0.1,
      }
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [enabled, loadMore]);

  // Reset display count when total items change (new file loaded) or reverse mode changes
  useEffect(() => {
    if (enabled && totalItems > 0) {
      setDisplayCount(Math.min(itemsPerPage, totalItems));
      loadingRef.current = false;
    }
  }, [totalItems, itemsPerPage, enabled, reverse]);

  return {
    displayCount,
    loadMoreTriggerRef,
    hasMore: displayCount < totalItems,
  };
}
