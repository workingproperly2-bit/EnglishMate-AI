import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'si' | 'ta';

export type ProgressState = {
  interfaceLanguage: Language;
  completedLessons: number[];
  completedTests: number[];
  testScores: Record<string, number>;
  speakingCount: number;
  writingCount: number;
};

const STORAGE_KEY = 'englishmate-progress-v1';

const initialProgress: ProgressState = {
  interfaceLanguage: 'en',
  completedLessons: [],
  completedTests: [],
  testScores: {},
  speakingCount: 0,
  writingCount: 0,
};

type AppContextValue = ProgressState & {
  isHydrated: boolean;
  setInterfaceLanguage: (language: Language) => void;
  markLessonComplete: (lessonId: number) => void;
  saveTestScore: (testId: number, score: number) => void;
  incrementSpeaking: () => void;
  incrementWriting: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setProgress({ ...initialProgress, ...JSON.parse(stored) });
        }
      })
      .catch(() => undefined)
      .finally(() => setIsHydrated(true));
  }, []);

  const update = (next: ProgressState) => {
    setProgress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      ...progress,
      isHydrated,
      setInterfaceLanguage: (interfaceLanguage) => update({ ...progress, interfaceLanguage }),
      markLessonComplete: (lessonId) => {
        if (progress.completedLessons.includes(lessonId)) return;
        update({ ...progress, completedLessons: [...progress.completedLessons, lessonId] });
      },
      saveTestScore: (testId, score) => {
        const completedTests = progress.completedTests.includes(testId)
          ? progress.completedTests
          : [...progress.completedTests, testId];
        update({
          ...progress,
          completedTests,
          testScores: { ...progress.testScores, [String(testId)]: score },
        });
      },
      incrementSpeaking: () => update({ ...progress, speakingCount: progress.speakingCount + 1 }),
      incrementWriting: () => update({ ...progress, writingCount: progress.writingCount + 1 }),
    }),
    [isHydrated, progress],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}