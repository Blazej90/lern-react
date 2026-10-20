import Link from "next/link";
import DataControls from "@/components/data-controls";

export const metadata = {
  title: "Prywatność i dane | Learn React",
};

const sectionClass = "space-y-2";
const headingClass = "text-lg sm:text-xl font-semibold";
const listClass = "list-disc pl-5 space-y-1";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 text-sm sm:text-base leading-relaxed">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Prywatność i dane</h1>
        <p className="text-muted-foreground">
          Learn React to aplikacja do nauki. Zbiera tylko dane potrzebne do
          oceny odpowiedzi i pokazywania Twojej historii.
        </p>
      </div>

      <section className={sectionClass}>
        <h2 className={headingClass}>Jakie dane przechowujemy</h2>
        <ul className={listClass}>
          <li>
            <strong>Konto:</strong> logowanie obsługuje Clerk. Clerk
            przechowuje Twój e-mail, imię i zdjęcie profilowe (np. z konta
            Google). Aplikacja zapisuje tylko identyfikator konta.
          </li>
          <li>
            <strong>Odpowiedzi:</strong> tekst rozpoznanej wypowiedzi, czas
            odpowiedzi i datę.
          </li>
          <li>
            <strong>Oceny AI:</strong> wynik, podsumowanie, mocne strony,
            braki, wskazówki i nazwę modelu.
          </li>
          <li>
            <strong>Wersja demonstracyjna:</strong> liczbę wykorzystanych
            pytań.
          </li>
        </ul>
        <p>
          Nagrania głosu nie są zapisywane. Mowę zamienia na tekst Twoja
          przeglądarka (Web Speech API). W Chrome i Edge dźwięk jest w tym celu
          przesyłany do usługi rozpoznawania mowy producenta przeglądarki.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>Kto przetwarza dane</h2>
        <ul className={listClass}>
          <li>
            <strong>OpenAI:</strong> otrzymuje pytanie i tekst Twojej
            odpowiedzi, żeby ją ocenić. Według zasad OpenAI dane z API nie są
            domyślnie używane do trenowania modeli i mogą być przechowywane do
            30 dni w celu wykrywania nadużyć.
          </li>
          <li>
            <strong>Neon:</strong> baza danych (PostgreSQL) we Frankfurcie.
          </li>
          <li>
            <strong>Vercel:</strong> hosting aplikacji.
          </li>
          <li>
            <strong>Clerk:</strong> logowanie i konto użytkownika.
          </li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>Jak długo</h2>
        <p>
          Dane są przechowywane, dopóki ich nie usuniesz albo nie usuniesz
          konta.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>Twoje prawa</h2>
        <ul className={listClass}>
          <li>
            <strong>Pobranie danych:</strong> plik JSON ze wszystkimi Twoimi
            odpowiedziami i ocenami.
          </li>
          <li>
            <strong>Usunięcie historii:</strong> usuwa wszystkie odpowiedzi i
            oceny. Pojedyncze pytanie usuniesz przyciskiem „Usuń” na karcie.
          </li>
          <li>
            <strong>Usunięcie konta:</strong> kliknij swój awatar → „Manage
            account” → „Security” → „Delete account”. Wtedy usuwamy wszystkie
            Twoje dane, także licznik wersji demonstracyjnej.
          </li>
        </ul>
        <DataControls />
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>Kontakt</h2>
        <p>
          W sprawach danych napisz przez{" "}
          <a
            href="https://github.com/Blazej90/lern-react/issues"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      <Link href="/" className="inline-block underline underline-offset-4">
        ← Wróć do aplikacji
      </Link>
    </div>
  );
}
