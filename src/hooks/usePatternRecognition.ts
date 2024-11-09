// src/hooks/usePatternRecognition.ts
import { useState, useEffect } from 'react';
import patternRecognition, { PatternData, PatternAnalysis } from '../services/pattern-recognition';

interface UsePatternRecognitionProps {
  data: PatternData[];
  enabled?: boolean;
  interval?: number;
}

export const usePatternRecognition = ({
  data,
  enabled = true,
  interval = 30000
}: UsePatternRecognitionProps) => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const analyzePatterns = async () => {
      if (!enabled || !data.length) return;

      setIsLoading(true);
      try {
        const result = await patternRecognition.analyzePatterns(data);
        setAnalysis(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Pattern analysis failed'));
        console.error('Pattern analysis error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const runAnalysis = () => {
      analyzePatterns();
      timeoutId = setTimeout(runAnalysis, interval);
    };

    runAnalysis();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [data, enabled, interval]);

  return {
    analysis,
    isLoading,
    error,
    reload: async () => {
      setIsLoading(true);
      try {
        const result = await patternRecognition.analyzePatterns(data);
        setAnalysis(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Pattern analysis failed'));
      } finally {
        setIsLoading(false);
      }
    }
  };
};

export default usePatternRecognition;