# OTherapy – System dopasowywania terapeutów

## Opis projektu
Aplikacja webowa wspierająca dopasowanie użytkownika do terapeuty na podstawie quizu. System umożliwia zarządzanie terapeutami, tagami (jeszcze w trakcie rozwoju), quizem oraz posiada panel administracyjny z autoryzacją JWT.

## Architektura
- **auth-service** – logowanie admina, JWT
- **therapists-service** – terapeuci, powiązania z tagami
- **tags-service** – tagi, powiązania z terapeutami i quizem
- **quizzes-service** – quiz, pytania, odpowiedzi, wersje robocze
- **frontend** – React, REST API

## Wymagania
- Node.js >= 18
- npm

## Uruchomienie
1. Zainstaluj zależności w każdym mikroserwisie i frontendzie:
   ```
   cd auth-service && npm install
   cd ../therapists-service && npm install
   cd ../tags-service && npm install
   cd ../quizzes-service && npm install
   cd ../frontend && npm install
   ```
2. Skonfiguruj pliki `.env` (przykładowe są już w repozytorium)
3. Uruchom każdy mikroserwis i frontend (w osobnych terminalach):
   ```
   cd auth-service && npm run dev
   cd therapists-service && npm run dev
   cd tags-service && npm run dev
   cd quizzes-service && npm run dev
   cd frontend && npm start
   ```
4. Otwórz aplikację: [http://localhost:3000](http://localhost:3000)