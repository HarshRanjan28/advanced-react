import { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  children: React.ReactNode;
  threshold?: number;
  onLoadMore?: () => void;
};

export function InfiniteScrolling({
  children,
  threshold = 500,
  onLoadMore,
}: InfiniteScrollProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('entries',entries);
        const target = entries[0];
        if (target.isIntersecting) {
          onLoadMore?.();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    );
    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }
    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [onLoadMore, threshold]);

  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      {children}
      <div ref={containerRef} className="h-1" />
    </div>
  );
}
