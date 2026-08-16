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
  completedAlphabet: string[];
  wordsCompleted: number;
  sentencesCompleted: number;
  grammarCompleted: number;
  paragraphsCompleted: number;
};

const STORAGE_KEY = 'englishmate-progress-v1';

const initialProgress: ProgressState = {
  interfaceLanguage: 'en',
  completedLessons: [],
  completedTests: [],
  testScores: {},
  speakingCount: 0,
  writingCount: 0,
  completedAlphabet: [],
  wordsCompleted: 0,
  sentencesCompleted: 0,
  grammarCompleted: 0,
  paragraphsCompleted: 0,
};

type AppContextValue = ProgressState & {
  isHydrated: boolean;
  setInterfaceLanguage: (language: Language) => void;
  markLessonComplete: (lessonId: number) => void;
  saveTestScore: (testId: number, score: number) => void;
  incrementSpeaking: () => void;
  incrementWriting: () => void;
  markAlphabetComplete: (letter: string) => void;
  incrementWords: () => void;
  incrementSentences: () => void;
  incrementGrammar: () => void;
  incrementParagraphs: () => void;
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

  const update = (transform: (current: ProgressState) => ProgressState) => {
    setProgress((current) => {
      const next = transform(current);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const value = useMemo<AppContextValue>(
    () => ({
      ...progress,
      isHydrated,
      setInterfaceLanguage: (interfaceLanguage) => update((current) => ({ ...current, interfaceLanguage })),
      markLessonComplete: (lessonId) => {
        update((current) => current.completedLessons.includes(lessonId)
          ? current
          : { ...current, completedLessons: [...current.completedLessons, lessonId] });
      },
      saveTestScore: (testId, score) => {
        update((current) => ({
          ...current,
          completedTests: current.completedTests.includes(testId)
            ? current.completedTests
            : [...current.completedTests, testId],
          testScores: { ...current.testScores, [String(testId)]: score },
        }));
      },
      incrementSpeaking: () => update((current) => ({ ...current, speakingCount: current.speakingCount + 1 })),
      incrementWriting: () => update((current) => ({ ...current, writingCount: current.writingCount + 1 })),
      markAlphabetComplete: (letter) => update((current) => current.completedAlphabet.includes(letter)
        ? current
        : { ...current, completedAlphabet: [...current.completedAlphabet, letter] }),
      incrementWords: () => update((current) => ({ ...current, wordsCompleted: current.wordsCompleted + 1 })),
      incrementSentences: () => update((current) => ({ ...current, sentencesCompleted: current.sentencesCompleted + 1 })),
      incrementGrammar: () => update((current) => ({ ...current, grammarCompleted: current.grammarCompleted + 1 })),
      incrementParagraphs: () => update((current) => ({ ...current, paragraphsCompleted: current.paragraphsCompleted + 1 })),
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