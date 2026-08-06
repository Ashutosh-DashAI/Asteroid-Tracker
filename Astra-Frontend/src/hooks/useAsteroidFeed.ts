import { useState, useEffect, useRef, useCallback } from 'react';
import asteroidsAPI from '@/api/asteroids.api';
import { Asteroid, AsteroidFeedFilter } from '@/types';

interface UseAsteroidFeedResult {
  data: Asteroid[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
  total: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

const PAGE_SIZE = 20;

function normalizeAsteroid(a: any): Asteroid {
  return {
    ...a,
    nasaId: a.nasaId || a.neo_reference_id,
    closeApproaches: a.closeApproaches || a.close_approach_data || [],
    estimatedDiameterMin: a.estimatedDiameterMin || a.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
    estimatedDiameterMax: a.estimatedDiameterMax || a.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
    isPotentiallyHazardous: a.isPotentiallyHazardous || a.is_potentially_hazardous_asteroid || false,
  };
}

export function useAsteroidFeed(filters?: AsteroidFeedFilter): UseAsteroidFeedResult {
  const [data, setData] = useState<Asteroid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    asteroidsAPI.getFeed({ page: 1, limit: PAGE_SIZE, ...filters })
      .then((response) => {
        if (cancelled) return;
        const asteroids: Asteroid[] = (response.data || []).map(normalizeAsteroid);
        const pagination = (response as any).pagination || {};
        setData(asteroids);
        setTotal(response.total || pagination.total || 0);
        setHasMore(pagination.hasNextPage !== false && asteroids.length >= PAGE_SIZE);
        setPage(1);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch asteroids');
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters?.hazardousOnly, filters?.startDate, filters?.endDate]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    asteroidsAPI.getFeed({ page: nextPage, limit: PAGE_SIZE, ...filters })
      .then((response) => {
        const newAsteroids: Asteroid[] = (response.asteroids || []).map(normalizeAsteroid);
        const pagination = (response as any).pagination || {};
        setData((prev) => [...prev, ...newAsteroids]);
        setHasMore(pagination.hasNextPage !== false && newAsteroids.length >= PAGE_SIZE);
        setPage(nextPage);
        setIsLoadingMore(false);
      })
      .catch(() => {
        setIsLoadingMore(false);
      });
  }, [page, isLoadingMore, hasMore, filters]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  return { data, isLoading, isLoadingMore, hasMore, loadMore, error, total, sentinelRef: sentinelRef };
}