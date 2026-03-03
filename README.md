# 🎬 Movie Watchlist

A personal movie tracking mobile application built with React Native and Expo. Browse real movies from TMDB, build your watchlist, rate films, and track what you've watched.

---

## 📦 APK Download

> **[⬇️ Download APK](https://expo.dev/accounts/radoslavyordanov8/projects/movie-watchlist/builds/9f0235cd-f1fb-47b8-aee2-e3a33ad3fa53)**

---

## 🚀 Installation & Running the Project

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your Android/iOS device — **or** an Android/iOS emulator

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm start
```

4. **Run on device or emulator**

- Scan the QR code with **Expo Go** (Android/iOS)
- Or press `a` for Android emulator / `i` for iOS simulator

---

## 📖 Functional Guide

### 1. Project Overview

**Application Name:** Movie Watchlist

**Application Category / Topic:** Movies / Entertainment

**Main Purpose:**
Movie Watchlist is a personal movie tracking application that allows users to manage a list of films they want to watch or have already seen. Users can add movies manually, browse real movie data from the TMDB database, and keep track of ratings and watch status. It solves the problem of forgetting which movies you want to watch and helps you maintain a personal, organized film log.

---

### 2. User Access & Permissions

**Guest (Not Authenticated)**

- Available screens: Login screen, Register screen only
- Cannot access any main app content

**Authenticated User**

- Main sections / tabs: Watchlist, Browse, Custom Add, Profile
- Detail screens: Movie Details (from watchlist), Browse Movie Details (from TMDB search)
- Create: Add movie manually (Custom tab) or from Browse
- Edit: Edit any movie in the watchlist
- Delete: Delete any movie from the Movie Details screen

---

### 3. Authentication & Session Handling

**Authentication Flow:**

1. On app start, a loading spinner is shown while Firebase checks the current auth state
2. Firebase's `onAuthStateChanged` listener is called — this checks if a valid session token exists
3. On successful login or registration, the user object is set in `AuthContext` and the app automatically renders the main tab navigator
4. On logout, `signOut()` is called via Firebase, the user state becomes `null`, and the auth screens are shown

**Session Persistence:**

- Firebase Authentication natively persists the session token on the device
- On app restart, `onAuthStateChanged` fires automatically with the previously logged-in user — no additional AsyncStorage is needed

---

### 4. Navigation Structure

**Root Navigation Logic:**

- `RootNavigator` reads `user` from `AuthContext`
- If `user` is `null` → renders `AuthStack` (Login / Register)
- If `user` is set → renders `AppTabs` (main app)

**Main Navigation:**

- Bottom Tab Navigator with 4 tabs: Watchlist, Browse, Custom, Profile

**Nested Navigation:**

- `HomeStack` (Stack inside Watchlist tab): MovieList → MovieDetails → EditMovie
- `BrowseStack` (Stack inside Browse tab): BrowseSearch → BrowseMovieDetails
- `AuthStack` (Stack for unauthenticated users): Login → Register

---

### 5. List → Details Flow

**List / Overview Screen:**

- Displays the user's saved movies as cards with poster, title, genre, rating, and watched status
- User can filter by status (All / Watched / To Watch), filter by genre via dropdown, sort by newest/oldest/rating/A–Z, search by title, pull-to-refresh, and toggle watched status inline

**Details Screen:**

- Triggered by tapping a movie card
- Receives `movieId` and `title` via route params
- Fetches full movie data from Firestore by ID on mount and re-fetches silently on focus

---

### 6. Data Source & Backend

**Backend Type:** Real backend — Firebase (Firestore, Firebase Auth, Firebase Storage) + TMDB REST API for browsing real movie data

---

### 7. Data Operations (CRUD)

**Read (GET):**

- `getMovies(userId)` — fetches all user movies on the Watchlist screen
- `getMovieById(movieId)` — fetches a single movie for the Details screen
- TMDB search API — fetches real movie search results on the Browse screen

**Create (POST):**

- Manual: User fills the Custom Add form → `addMovie()` writes to Firestore, optionally uploads a poster to Firebase Storage
- From Browse: User finds a TMDB movie → taps "Add to Watchlist" → `addMovie()` saves it with the TMDB poster URL

**Update:**

- User taps Edit on Movie Details → `updateMovie()` patches the Firestore document; poster image is replaced in Firebase Storage if changed

**Delete:**

- User taps Delete on Movie Details → `deleteMovie()` removes the Firestore document and deletes the poster from Storage; UI navigates back to the list automatically

---

### 8. Forms & Validation

**Forms Used:**

- Login Form
- Register Form
- Add Movie Form
- Edit Movie Form

**Validation Rules (React Hook Form + Zod):**

| Field               | Rules                                          |
| ------------------- | ---------------------------------------------- |
| Email               | Required, valid email format                   |
| Password (Register) | Required, min 6 characters, max 72 characters  |
| Confirm Password    | Required, must match Password                  |
| Title               | Required, min 2 characters, max 150 characters |
| Genre               | Required, must select from list                |
| Description         | Required, max 500 characters                   |
| Rating              | Required, number between 1–5                   |
| Watch Date          | Required, must match YYYY-MM-DD format         |

---

### 9. Native Device Features

**Used Native Feature:** Image Picker (`expo-image-picker`)

**Where it is used:** Add Movie screen and Edit Movie screen

**What it provides:** Allows the user to select a photo from their device's photo library to use as a custom movie poster. The selected image is uploaded to Firebase Storage and the download URL is stored with the movie record. The poster can also be replaced later via the Edit screen.

---

### 10. Typical User Flow

1. User opens the app → Firebase checks the session → if new user, lands on the Login screen
2. User registers with email and password → automatically redirected to the main Watchlist tab
3. User taps the Browse tab → searches for a movie by title using TMDB → taps a result to see details → taps "Add to Watchlist" → is redirected to the Watchlist tab where the movie now appears
4. User taps a movie in the Watchlist to open Details → taps Edit to change the rating or toggle watched status → saves → returns to the detail screen with updated data
5. User opens the Profile tab to view stats (total movies, watched count) → taps Sign Out → returns to the Login screen

---

### 11. Error & Edge Case Handling

**Authentication errors:** Server errors from Firebase (wrong password, email already in use) are caught and displayed inline below the form as a red error message. Form validation errors are shown per-field via Zod schema messages.

**Network or data errors:** All service functions return `{ error: string }` on failure. List screens display an `ErrorMessage` component with a "Retry" button. Detail screens show an inline error message. The app never crashes on a failed network request.

**Empty or missing data states:** The Watchlist shows a friendly empty state with an emoji and a call-to-action when no movies exist or no results match the current filter/search. A `LoadingSpinner` component is displayed while data is being fetched.
