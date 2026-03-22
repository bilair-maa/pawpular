# Pawpular

A cute serotonin boost for animal lovers.

Pawpular is a responsive pet gallery website built for browsing, following, saving, and downloading cute animal photos from a pet API. The app is meant to feel playful without turning the animals into a competition. Users can choose the pets and crews they want to follow, but there is no public ranking or follower-count emphasis because every animal is already pawpular and deserves love.

The experience centers on discovery. You can browse the full gallery, search by name or description, filter by animal type, sort the collection, open individual pet profiles, view larger photos in a lightbox, start a slideshow, follow animal crews, save favorites, and download selected pets as a zip file. Users who make an account can also keep their favorites and download history so they can return to the animals and images they saved.

## Scope

This project was built as a frontend take-home challenge and is presented here as a portfolio case study. The intended scope was a responsive pet gallery experience using the provided pet API, with browsing, filtering, detail views, saved favorites, image downloads, and clear loading and error states.

The project is not meant to represent a complete production application. It does not include real backend authentication, server-side persistence, admin tools, or a complete production content model. Account-style features are implemented as local prototype flows to demonstrate the intended user experience.

## Technical Highlights

- React + TypeScript web app with component-driven architecture.
- Strict TypeScript configuration with `strict: true`.
- Context-based state management for user interactions and preferences.
- Typed API transformation layer separating external API data from internal app models.
- Stable pet IDs derived from API metadata instead of image URLs, so deep links and saved state are not tied to CDN paths.
- Responsive design across desktop and mobile layouts.
- Accessibility-focused implementation with keyboard navigation, semantic HTML, ARIA support, and focus management.
- API-backed experiences include loading, error, empty, and retry states.
- Error boundary around lazy routes so page-level crashes show a recoverable error screen instead of a blank app.
- Vitest + Testing Library coverage for formatting, zip downloads, filter/sort behavior, and selection flows.
- React-rendered API content instead of raw HTML injection.

## Project Structure

```text
src/
  components/   Reusable UI, gallery, auth, layout, and shared state components.
  context/      App-level client state for user, selection, saved pets, follows, and pets.
  hooks/        Shared data and interaction hooks, including pet loading and focus trapping.
  pages/        Route-level screens such as Gallery, Details, Crews, Favorites, and Downloads.
  styles/       Global styles and theme tokens.
  types/        Shared TypeScript domain types.
  utils/        Pure helpers for filtering, sorting, downloads, formatting, and crew building.
  __tests__/    Vitest + Testing Library coverage for core logic and user flows.
```

## How To Run

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

To run the test suite:

```bash
npx vitest run
```

## Core Features

- A responsive gallery with search, animal filters, sorting, and progressive loading.
- Pet detail pages with larger images, descriptions, species labels, favorite/follow actions, sharing, and downloads.
- Animal pal crews that users can join or leave.
- A slideshow mode with playback controls, shuffle, captions, speed options, filters, and background styles.
- A lightbox for focused photo viewing with keyboard-friendly controls and download/select actions.
- Gallery multi-select downloads that package chosen pet images into a zip file and report partial download failures instead of silently skipping them.
- Selection and batch downloads on the main Gallery, Favorites, and Following pages.
- Account-supported favorites, followed pets, followed crews, and download history so users can save their stuff and come back to it.
- API-backed loading, error, empty, retry, and not-found states so the app still feels intentional when data is unavailable.

The app fetches pet data from:

```text
GET /pets
```

The Vite dev server proxies `/pets` to `https://eulerity-hackathon.appspot.com/pets`
for local development.

## UI Design

Since there was no strict product direction, I spent some time envisioning what the user experience should be. One option was a Pinterest-like browsing board focused on collecting and saving photos. Another option was something closer to an adoption agency, with a more formal profile-first structure. I settled on Pawpular as a middle ground: a playful social-style gallery where the animals can be browsed, followed, grouped into crews, viewed in a slideshow, and downloaded without making the experience feel transactional or competitive.

The visual direction is warm, soft, and rounded because the subject matter is cute animals. I chose a cream-toned background, warm orange primary color, soft shadows, friendly typography, and small motion details to make the site feel affectionate and inviting while still keeping the gallery easy to scan. Since the available photo set was limited, I also used placeholder-style names, crews, labels, and design variables to help communicate the intended product feel. Those details give the site a more complete visual identity and make it easier to see what the experience could become with a larger official image set and fuller content model.

The design supports the product goals: cards make the animals easy to compare visually, filters keep browsing manageable, the slideshow creates a more relaxed way to enjoy the photos, and the download selection bar makes batch actions clear without taking over the page. I used infinite scroll instead of button-based pagination because pagination has benefits, but repeated clicking and waiting can create user exhaustion. Loading more as the user scrolls keeps browsing feeling seamless. The interface is meant to feel cheerful, but the structure still stays practical.

I also avoided turning follows into a leaderboard competition. The follow feature is personal, users can keep track of animals and crews they like, but the app does not frame one pet as more popular than another.

## Frontend Mindset

With the help of AI, it can be easy to generate something that looks like a finished frontend. But frontend work is more than visuals. It is the user interface, the user experience, the design system, the product decisions, the accessibility path, and the security decisions that shape whether people can actually use and trust the product.

That mindset guided how I thought about Pawpular. A cute interface still needs clear flows, readable controls, predictable navigation, meaningful feedback, and accessibility support. The design has to consider how a user experiences the product from the first page to the moment they save a favorite, download images, open a modal, or move through the app with a keyboard.

My background in cybersecurity influences how I approach frontend development. While a frontend application cannot enforce security on its own, it plays an important role in protecting users through safe data handling, clear trust boundaries, accessible design, and defensive implementation choices. Throughout this project, I considered how frontend decisions affect user trust, application resilience, and the overall security posture of the product.

## Accessibility

Accessibility is imperative to frontend work. The app uses semantic links, buttons, forms, headings, and image alt text where possible. Interactive controls include visible focus states, and components such as dialogs, popovers, selected buttons, expanded menus, and status messages use ARIA where additional context is needed.

Keyboard access was considered across the main flows: navigation links, gallery actions, toolbar controls, modal controls, slideshow controls, and form fields can be reached without a mouse. The slideshow and lightbox use focus trapping and return focus when closed, which helps keep modal interactions predictable for keyboard and assistive technology users. Error states use alert semantics where appropriate, and reduced-motion preferences are respected in animated areas.

The goal was to stay aligned with WCAG principles: the interface should be perceivable through real text and alt text, operable with keyboard controls, understandable through consistent layout and labels, and robust enough for assistive technology to interpret.

## Frontend Decisions

The frontend decisions were made with UX, accessibility, security, performance, and product feel in mind. I wanted the app to be playful, but I also wanted the implementation choices to stay thoughtful about how users move through the experience and how their saved data is handled.

I kept API fetching contained in the pet data provider so pages and components work with the app's internal `Pet` shape instead of raw API fields. I also thought about the difference between server state and client state. The pet list comes from the server, while selections, favorites, follows, demo account state, and download history are client-side interaction state.

Global client state is split by purpose: selected downloads, saved pets, followed pets and crews, and demo user state each have their own provider. That keeps the routes focused on user workflows instead of low-level state management.

For security-conscious frontend behavior, I treated the client-side rendering carefully. API-provided text is rendered through React instead of raw HTML injection, avoiding `dangerouslySetInnerHTML` and reducing cross-site scripting risk. The account flow exists so users can save favorites, follow pets and crews, and keep a download history, but those saved collections are stored in the browser for prototype convenience rather than presented as secure production authentication.

## Trade-Offs

I did not build real authentication or backend accounts because that would be unnecessary for this challenge prototype. A production version would use a backend or trusted identity provider, secure sessions, and server-side persistence. Here, the local demo login is there to support protected flows like favorites, downloads, profile, following, and download history without adding backend complexity that the prototype does not need.

I also kept the data layer proportional to the app. Since the challenge uses one primary pet API resource, a single provider is enough. If this expanded into a larger product with multiple server resources, mutations, background refetching, or cache invalidation, I would reach for a dedicated server-state library such as TanStack Query.

Pet IDs are derived from `title + created` because the API does not provide a dedicated unique ID, and the app needed a deterministic identifier that stays consistent across reloads, routes, favorites, and download history. This was a reasonable fallback for the provided data, the trade-off is that two pets with the exact same title and creation timestamp would collide. A larger production system should use a true unique ID from the data source. 

With more time, I would improve the project across security, accessibility, and UI polish. On the security side, I would replace the prototype account flow with real user-specific persistence, review browser storage choices, and make privacy expectations clearer. For accessibility, I would do deeper keyboard and screen reader QA, strengthen focus management across every modal and drawer, and run both automated and manual WCAG checks. On the UI side, I would refine the mobile experience, improve loading and empty states, and expand the visual/content system if more official animal data were available.
