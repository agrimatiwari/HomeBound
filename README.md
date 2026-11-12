# HomeBound — Student Travel Partner Discovery Prototype

HomeBound is a lightweight, vanilla HTML5, CSS3, and JavaScript prototype designed to help Thapar Institute of Engineering & Technology (TIET) students discover fellow students travelling to the same or nearby destinations around similar dates.

## Problem Statement Alignment

- **Discovery Only:** HomeBound helps students discover potential travel partners to coordinate plans. It does **not** book cabs, process payments, register drivers, or collect fares.
- **Safety & Verification Disclosure:** Student verification and account restrictions are simulated in the frontend prototype. A match does not guarantee the identity, reliability, or safety of another student. Students are encouraged to verify travel arrangements independently through trusted university channels and involve trusted adults.
- **Privacy Protection:** Full Thapar student IDs are masked immediately upon entry, and private emails, phone numbers, or residential addresses are never exposed on public discovery cards.

## Project Structure

```text
homebound_project/
├── index.html               # Semantic HTML5 entry point with skip-link & live toast region
├── styles.css               # Accessible responsive CSS3 styles (light/dark themes, focus rings)
├── package.json             # DevDependencies & test runner script (Vitest)
├── src/
│   ├── storage.js           # Safe LocalStorage persistence, schema normalization, initial seed data
│   ├── matching.js          # Weighted travel-partner matching algorithm & explanation labels
│   ├── domain.js            # Input sanitization, privacy views, plan/request/message business logic
│   ├── ui.js                # Modular HTML template components & public view rendering
│   └── app.js               # Delegated event controller, debounced search, match cache, modals
└── tests/
    └── homebound.test.js    # Automated Vitest test suite covering profiles, plans, matching, requests, chat & storage
```

## Running Locally

1. Open the project folder in VS Code and launch `index.html` using **Live Server**, or run any static HTTP server from the root directory:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in your browser. (ES Modules require serving over HTTP rather than `file://`.)

## Running Automated Tests

1. Install dev dependencies (Vitest):
   ```bash
   npm install
   ```
2. Run the automated test suite:
   ```bash
   npm test
   ```

## Manual Testing Checklist

1. **Simulated Auth & Privacy:** Sign out from Settings, register with a `@thapar.edu` email and student ID, and verify the student ID is masked (`10******`) and hidden from public cards.
2. **Travel Plan Lifecycle:** Create a travel plan, verify duplicate active plans for the same city/date are blocked, edit the plan, pause/reactivate it, mark it completed, and confirm deletion via modal.
3. **Matching Accuracy:** Create an active plan to `Jaipur` in 7 days and verify `Exact Destination Match` (Diya Kapoor) ranks above `Nearby Destination` / `Flexible Date Match` (Rohan Mehta, Ajmer). Pause a plan and confirm matches update immediately.
4. **Connection Requests & Messaging:** Send a connection request, cancel a pending sent request, accept an incoming request, and verify messaging unlocks only for accepted connections with isolated conversation histories.
5. **Accessibility & Responsiveness:** Navigate using `Tab` / `Shift+Tab` / `Escape` (on confirmation modals), verify focus outlines, test light/dark theme contrast, and inspect mobile/tablet viewports.
