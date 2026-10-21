# TODO

Wszystkie zadania z [roadmapy](README.md#roadmap) w jednym miejscu. Zadanie odhaczamy (`[x]`) w tym samym PR, który je kończy. Kolejność w sekcjach to kolejność pracy.

## Etap 1: zapisane odpowiedzi i postępy

- [x] Ustrukturyzowana ocena AI: wynik 0–10, podsumowanie, mocne strony, braki, wskazówki (#11)
- [x] Baza danych: Neon + Drizzle, migracje, seed pytań, kontrola migracji w CI (#13)
- [x] Zapisywanie odpowiedzi i ocen w bazie, historia z bazy (#14)
- [x] Tryb demo z limitem pytań (#15)
- [x] Pobranie i usunięcie danych (RODO), webhook Clerk `user.deleted` (#16)
- [x] Statystyki postępów w SQL: średnia na temat, trend, najsłabsze tematy, największy postęp, pytania bez odpowiedzi
- [x] Strona `/progress`: kafelki, wykres wyników, tematy, pytania bez odpowiedzi
- [ ] Agent postępów: endpoint z raportem od modelu (co się poprawiło, powtarzające się braki, co ćwiczyć), cache w tabeli `progress_reports`, nowy raport tylko po nowych odpowiedziach
- [ ] Raport agenta na stronie `/progress`
- [ ] Dobór pytań pod użytkownika: częściej słabe tematy i pytania bez odpowiedzi
- [ ] Okres przechowywania transkrypcji: zasada (np. usuwanie po X miesiącach) i opis na stronie prywatności
- [ ] Kontakt w sprawie danych na stronie prywatności: e-mail zamiast publicznych GitHub Issues

## Etap 2: przygotowanie do produkcji

- [ ] GitHub Action: `pnpm db:migrate` na produkcji po scaleniu do `main`
- [ ] Globalny limit zapytań w Upstash Redis (`@upstash/ratelimit`) zamiast limitu w pamięci
- [ ] Monitoring błędów: Sentry, Vercel Analytics lub Speed Insights
- [ ] Dzienny limit zapytań do AI na użytkownika (w bazie) i alerty kosztów w panelu OpenAI
- [ ] Testy E2E w Playwright: logowanie → pytanie → odpowiedź → ocena (Clerk testing tokens, mock AI)
- [ ] Automatyczne aktualizacje zależności (Dependabot lub Renovate), scalane po zielonym CI

## Etap 3: nauka

- [ ] Odpowiedź pisana: pole tekstowe dla przeglądarek bez Web Speech API (Firefox) i dla chętnych
- [ ] Streaming oceny AI do szuflady na bieżąco
- [ ] Więcej pytań (React 19, Server Components, Next.js), zarządzanych w bazie zamiast w tablicy
- [ ] Tryb próbnej rozmowy: kilka pytań z rzędu i podsumowanie na końcu
- [ ] Powtórki (spaced repetition) pytań z niską oceną
- [ ] Polskie formularze Clerk (`@clerk/localizations`, `plPL`)
- [ ] Opcjonalnie: wersja angielska z rozpoznawaniem mowy `en-US`

## Etap 4: utrzymanie

- [ ] React 19 i Next.js 16, gdy wspierają je `react-speech-recognition` i Clerk
- [ ] Odświeżenie danych przeglądarek (`npx update-browserslist-db@latest`)
- [ ] Porównanie nowszych lub tańszych modeli na zestawie wzorcowych odpowiedzi przed zmianą `OPENAI_MODEL`
