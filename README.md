# Dziennik Treningowy

Osobisty dziennik treningowy (PWA) zbudowany w Next.js 14 (App Router) + TypeScript +
Tailwind CSS. Wszystkie dane (treningi, plan, ustawienia) są trzymane **wyłącznie lokalnie**
na urządzeniu użytkownika, w IndexedDB (przez bibliotekę `dexie`). Brak backendu, brak
logowania, brak synchronizacji między urządzeniami.

## Uruchomienie lokalne

Wymagany Node.js 18+.

```bash
npm install
npm run dev
```

Aplikacja wystartuje na `http://localhost:3000` i przekieruje na `/trening`.

## Build produkcyjny

```bash
npm run build
npm run start
```

## Deploy na Vercel

1. Wypchnij ten katalog jako repozytorium Git (GitHub/GitLab/Bitbucket).
2. Wejdź na [vercel.com/new](https://vercel.com/new) i zaimportuj repozytorium.
3. Framework Preset: **Next.js** (wykryje się automatycznie). Nie są potrzebne żadne
   zmienne środowiskowe ani baza danych.
4. Deploy — gotowe. Service worker (`public/sw.js`) rejestruje się tylko w trybie
   produkcyjnym, więc pełne działanie PWA (instalacja na ekranie głównym, cache offline)
   zobaczysz dopiero na wdrożonej wersji, nie w `npm run dev`.

## Dodanie do ekranu głównego telefonu

- **iOS (Safari)**: otwórz stronę → przycisk „Udostępnij” → „Dodaj do ekranu głównego”.
- **Android (Chrome)**: otwórz stronę → menu (⋮) → „Dodaj do ekranu głównego” / pojawi się
  automatyczny baner instalacji.

Po dodaniu aplikacja otwiera się w trybie `standalone`, bez paska przeglądarki.

## Struktura projektu

```
app/                     – trasy Next.js App Router (każda strona to cienki wrapper
                            renderujący odpowiedni komponent kliencki bez SSR — IndexedDB
                            istnieje tylko w przeglądarce)
components/pages/         – właściwa logika i UI każdego ekranu (Trening, Plan, Historia,
                            Statystyki, Ustawienia)
components/               – komponenty współdzielone (dolna nawigacja, pasek góry, timer
                            odpoczynku, pola liczbowe, przełącznik motywu…)
lib/db.ts                 – definicja bazy Dexie (IndexedDB) + typy tabel
lib/types.ts               – typy domenowe (sesja treningowa, ćwiczenie, seria, plan…)
lib/exportImport.ts        – eksport/import kopii zapasowej do/z pliku JSON
lib/ThemeProvider.tsx       – ciemny/jasny motyw (zapisywany w ustawieniach w IndexedDB)
public/manifest.json        – manifest PWA
public/sw.js                – service worker (cache runtime, działanie offline)
public/icon*.png            – ikony aplikacji (wygenerowane, motyw sztangi)
```

## Najważniejsze funkcje

- **Trening** — dziennik na dany dzień: dodawanie ćwiczeń i serii (przycisk „+ seria”
  kopiuje ostatnią serię), podgląd poprzedniego wyniku dla danego ćwiczenia, notatka
  tekstowa, autosave z debounce ~400 ms, mikro-toast potwierdzający zapis, szybkie
  wczytanie dnia z zapisanego planu.
- **Plan** — w pełni edytowalny podział treningowy: dni (Dzień A/B/C…), przypisane
  ćwiczenia z sugerowaną liczbą serii/powtórzeń, zmiana kolejności strzałkami góra/dół.
- **Historia** — lista zapisanych treningów z filtrowaniem po partii mięśniowej i
  zakresie dat, rozwijane szczegóły, usuwanie treningu.
- **Statystyki** — wykres progresu najcięższego ciężaru w czasie dla wybranego ćwiczenia
  (Recharts) + kalkulator 1RM (wzór Epley).
- **Ustawienia** — przełącznik ciemny/jasny motyw, zarządzanie listą partii mięśniowych,
  domyślny czas timera odpoczynku (+ dźwięk/wibracje), eksport/import kopii zapasowej
  JSON, czyszczenie danych urządzenia.
- **PWA / mobile-first** — `overscroll-behavior: contain` blokujący przypadkowy
  pull-to-refresh, `display: standalone`, duże pola liczbowe z klawiaturą numeryczną
  (`inputMode="decimal"/"numeric"`), dolna nawigacja przypięta na stałe z obsługą
  `env(safe-area-inset-bottom)`.

## Uwaga o kopii zapasowej

Ponieważ dane siedzą wyłącznie w IndexedDB przeglądarki na danym telefonie, wyczyszczenie
danych przeglądarki lub zmiana telefonu skasuje historię treningów. W zakładce
**Ustawienia** znajduje się „Eksportuj kopię zapasową” (plik `.json`) i „Importuj z
pliku” — warto robić to regularnie.

## Ikony

Ikony (`public/icon*.png`, `apple-touch-icon.png`) zostały wygenerowane programowo
(motyw sztangi, pomarańczowy akcent na czarnym tle) i są gotowe do użycia. Jeśli
chcesz własne logo, podmień pliki w `public/` zachowując te same nazwy i wymiary
(192×192, 512×512, 180×180) oraz zaktualizuj `public/manifest.json` w razie potrzeby.
