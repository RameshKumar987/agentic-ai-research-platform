import { useCallback, useEffect, useRef, useState } from "react";
import { getHealth } from "../lib/api";

interface ResourceState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    loaderRef
      .current()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error("Something went wrong."),
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { ...state, reload };
}

export function useHealth(intervalMs = 30_000) {
  const resource = useResource(() => getHealth(), []);

  useEffect(() => {
    if (!intervalMs) return;
    const timer = window.setInterval(() => resource.reload(), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, resource.reload]);

  return resource;
}
