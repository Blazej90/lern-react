// The question bank. It is the source of truth for the `questions` table:
// `pnpm db:seed` upserts these entries by text.
export const QUESTION_TOPICS = {
  basics: "Podstawy",
  components: "Komponenty",
  hooks: "Hooki",
  state: "Zarządzanie stanem",
  performance: "Wydajność",
  forms: "Formularze",
  ecosystem: "Ekosystem i narzędzia",
} as const;

export type QuestionTopic = keyof typeof QUESTION_TOPICS;

export const QUESTION_DIFFICULTIES = ["basic", "intermediate", "advanced"] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export interface Question {
  text: string;
  topic: QuestionTopic;
  difficulty: QuestionDifficulty;
}

export const QUESTION_BANK: readonly Question[] = [
  { text: "Jak działa useState i kiedy go używamy?", topic: "hooks", difficulty: "basic" },
  { text: "Co to jest virtual DOM i dlaczego jest używany w React?", topic: "basics", difficulty: "basic" },
  { text: "Jak przekazywać dane między komponentami za pomocą props?", topic: "components", difficulty: "basic" },
  { text: "Jak działa mechanizm kluczy (keys) w React i dlaczego są ważne?", topic: "basics", difficulty: "intermediate" },
  { text: "Co to jest i jak działa useEffect w React?", topic: "hooks", difficulty: "intermediate" },
  { text: "Jak zarządzać stanem aplikacji w React za pomocą useReducer?", topic: "state", difficulty: "intermediate" },
  { text: "Czym są i do czego służą hooks w React?", topic: "hooks", difficulty: "basic" },
  { text: "Jak działa kontekst (Context) w React i kiedy go używać?", topic: "state", difficulty: "intermediate" },
  { text: "Co to jest i jak działa useContext w React?", topic: "state", difficulty: "intermediate" },
  { text: "Czym różnią się komponenty klasowe od komponentów funkcyjnych w React?", topic: "components", difficulty: "basic" },
  { text: "Co to jest JSX i jak działa w React?", topic: "basics", difficulty: "basic" },
  { text: "Jak działają renderowanie warunkowe i lista w React?", topic: "basics", difficulty: "basic" },
  { text: "Czym jest i jak działa React Router?", topic: "ecosystem", difficulty: "intermediate" },
  { text: "Co to jest i jak używać React.memo?", topic: "performance", difficulty: "intermediate" },
  { text: "Co to jest i jak działa useRef w React?", topic: "hooks", difficulty: "intermediate" },
  { text: "Czym jest i jak działa Fragment w React?", topic: "basics", difficulty: "basic" },
  { text: "Co to jest i jak działa lazy loading w React?", topic: "performance", difficulty: "advanced" },
  { text: "Jakie są różnice między uncontrolled a controlled components w React?", topic: "forms", difficulty: "intermediate" },
  { text: "Co to jest Redux i jak z niego korzystać w aplikacjach React?", topic: "state", difficulty: "advanced" },
  { text: "Jak działa optymalizacja wydajności w React, np. PureComponent?", topic: "performance", difficulty: "advanced" },
  { text: "Co to jest useCallback i jak pomaga w optymalizacji aplikacji React?", topic: "performance", difficulty: "advanced" },
  { text: "Jak obsługiwać formularze w React?", topic: "forms", difficulty: "basic" },
  { text: "Co to jest React DevTools i jak go używać do debugowania aplikacji?", topic: "ecosystem", difficulty: "basic" },
  { text: "Czym są HOC (Higher Order Components) i jak je używać w React?", topic: "components", difficulty: "advanced" },
  { text: "Jakie są zasady dotyczące cyklu życia komponentu w React?", topic: "components", difficulty: "intermediate" },
  { text: "Co to jest i jak działa Suspense w React?", topic: "performance", difficulty: "advanced" },
  { text: "Jakie są zalety stosowania TypeScript z React?", topic: "ecosystem", difficulty: "intermediate" },
  { text: "Czym jest i jak używać prop-types w React?", topic: "ecosystem", difficulty: "basic" },
];

export const REACT_QUESTIONS: readonly string[] = QUESTION_BANK.map((q) => q.text);

export function isKnownQuestion(question: string): boolean {
  return REACT_QUESTIONS.includes(question);
}
