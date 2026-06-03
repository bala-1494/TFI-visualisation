import { useState, useCallback } from "react";
import { parseFile } from "../lib/parsers";
import type { ParsedFile } from "../types/data";

interface State {
  data: ParsedFile | null;
  loading: boolean;
  error: string | null;
}

export function useFileData() {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const load = useCallback(async (file: File) => {
    setState({ data: null, loading: true, error: null });
    try {
      const parsed = await parseFile(file);
      setState({ data: parsed, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, load, reset };
}
