# Pokemon Explorer — Design Doc

## 1. Current state

The backend is done and needs no changes:

- `server/app.ts` — `GET /api/pokemon` with `page`/`limit`/`search`, matching the README contract exactly (filters on name, type, description; returns `data` + `pagination`).
- `scripts/generate-pokemon.mjs` / `src/data/pokemon.json` — 1000 fixtures already generated.
- `vite.config.ts` mounts the Express app as Vite middleware, so `pnpm dev` serves both.

The frontend is a stub. `src/components/PokemonGrid.tsx` renders a bare `<Input>` and a `"Pokemon Grid"` div — no fetching, no grid, no cards. Only one shadcn primitive exists (`ui/input.tsx`); `Card`, `Badge`, `Button`, `Skeleton` etc. are not yet added. This doc scopes the work to build the frontend against the existing API.

## 2. Requirements (from README)

1. Searchable grid view of Pokemon, backed by `/api/pokemon?search=`.
2. Infinite scroll (no pagination controls) — load in batches, fetch more automatically near the bottom.
3. Two card states, toggled per-card by click:
   - **Default**: name + type badge(s) only.
   - **Expanded**: full stats (hp/attack/defense/spAtk/spDef/speed), description, height, weight, generation, legendary flag.
4. Responsive layout across screen sizes.

Non-goals: no auth, no routing, no persistence of expanded/search state across reload, no backend changes.

## 3. Data layer

```ts
// src/lib/types.ts
type Pokemon = {
  id: number
  name: string
  types: string[]
  description: string
  imageUrl: string
  generation: number
  height: number
  weight: number
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  isLegendary?: boolean
}

type PokemonPage = {
  data: Pokemon[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### `usePokemonList` hook (`src/hooks/usePokemonList.ts`)

Owns all fetch/pagination/search state so `PokemonGrid` stays a view. Interface:

```ts
function usePokemonList(search: string): {
  items: Pokemon[]
  loadMore: () => void
  hasNext: boolean
  isLoading: boolean      // any fetch in flight (first page or next page)
  error: string | null
}
```

Behavior:

- Internal state: `items`, `page`, `hasNext`, `isLoading`, `error`.
- **Search changes** (debounced 300ms upstream, see below): reset `items = []`, `page = 1`, refetch page 1, replacing (not appending) results.
- **`loadMore()`**: no-op if `isLoading` or `!hasNext`; otherwise fetches `page + 1` with the current `search` and appends to `items`.
- Every fetch uses `AbortController`; a new request (new search, or an unmount) aborts the previous one so a slow stale response can't clobber a newer one or append onto a just-reset list. Ignore `AbortError` in the catch; surface other errors via `error`.
- `limit` fixed at 24 (grid-friendly batch size; not user-configurable, no requirement calls for it).

### Search debounce

A small `useDebouncedValue(value, delay)` hook (`src/hooks/useDebouncedValue.ts`) sits between the `<Input>` and `usePokemonList` so every keystroke doesn't trigger a network call. 300ms delay. The input itself stays uncontrolled-fast (updates local state immediately for responsiveness); the debounced value is what's passed to the hook.

## 4. Infinite scroll mechanism

`IntersectionObserver` on a sentinel `<div>` rendered after the last grid item, rather than a scroll-position listener — avoids scroll-jank and manual throttling.

```tsx
// src/hooks/useInfiniteScrollSentinel.ts
function useInfiniteScrollSentinel(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onIntersect(),
      { rootMargin: '400px' } // start fetching before the sentinel is actually on-screen
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect, enabled])
  return ref
}
```

`enabled` is `hasNext && !isLoading`, so the observer doesn't re-fire `loadMore` while a fetch is already in flight or after the list is exhausted.

## 5. Component plan

```
src/
├── hooks/
│   ├── usePokemonList.ts
│   ├── useDebouncedValue.ts
│   └── useInfiniteScrollSentinel.ts
├── lib/
│   └── types.ts
├── components/
│   ├── ui/                    # add via shadcn: card, badge, skeleton
│   ├── PokemonGrid.tsx        # container: search input + grid + sentinel + states
│   ├── PokemonCard.tsx        # single card, owns its own expand/collapse state
│   ├── TypeBadge.tsx          # extracted from PokemonGrid's existing `colors` map
│   └── PokemonCardSkeleton.tsx
```

- **`PokemonGrid`**: renders `<Input>` (search), a responsive CSS grid of `PokemonCard`s from `usePokemonList`, the sentinel div, and the loading/error/empty states below.
- **`PokemonCard`**: local `useState<boolean>` for expanded — expansion is per-card and independent, not lifted to the grid (no requirement ties it to a single-expanded-at-a-time pattern, and lifting it would force re-renders of the whole grid on every toggle).
- **`TypeBadge`**: thin wrapper reusing the existing `colors` record already written in `PokemonGrid.tsx` today (color-by-type is good and shouldn't change) — just needs to move out of the stub component into shadcn's `Badge`.
- shadcn additions: `card`, `badge`, `skeleton` (`button` optional, only if the expand affordance ends up as a button rather than the whole card being clickable).

## 6. Card content spec

| Field | Default | Expanded |
|---|---|---|
| Image | ✅ thumbnail | ✅ larger |
| Name | ✅ | ✅ |
| Type badge(s) | ✅ | ✅ |
| Description | — | ✅ |
| HP / Atk / Def / SpAtk / SpDef / Speed | — | ✅ (simple bar or labeled list) |
| Height / Weight / Generation | — | ✅ |
| Legendary flag | — | ✅ badge/star if `isLegendary` |

Click target is the whole card (`role="button"`, `aria-expanded`, `tabIndex=0`, Enter/Space handling) so it's keyboard-accessible without adding a separate visible toggle button.

## 7. Responsive layout

Tailwind grid on `PokemonGrid`'s wrapper:

```
grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4
```

Expanded cards keep their grid cell (no reflow of siblings) — extra content grows the card's height within its own cell/row, which CSS grid handles natively since rows auto-size. Search input is full-width and sticky-optional at top; verify at 320px (small phone), 768px (tablet), 1440px+ (desktop).

## 8. Loading / empty / error states

- **Initial load**: render `PokemonCardSkeleton` × ~8 in the grid instead of a spinner, so layout doesn't jump.
- **Loading more**: small spinner/skeleton row below the existing grid, near the sentinel.
- **Empty search results**: "No Pokemon found for '…'" message, no grid.
- **Fetch error**: inline message + retry button that re-triggers the current page fetch (reuse `usePokemonList`'s internal fetch fn).
- **End of list**: once `!hasNext` and `items.length > 0`, optionally show "You've caught them all" — nice-to-have, not required.

## 9. Edge cases to guard against

- **Race between search and in-flight `loadMore`**: handled by `AbortController` cancel-on-new-search in §3.
- **Rapid scroll firing multiple `loadMore` calls**: guarded by `enabled = hasNext && !isLoading` on the observer.
- **Empty `search` string**: same code path as a search term, just omits the query param (mirrors current stub behavior in `server/app.ts`, no special-casing needed client-side).
- **Duplicate ids on append**: not expected (server data is stable, page-based), but `items` should still be keyed by `pokemon.id` in the `.map` to avoid an index-key.

## 10. Out of scope / explicitly not doing

- No URL/query-param sync of search term (README doesn't ask for shareable search links).
- No client-side caching layer (React Query, SWR) — the hook above is simple enough that adding a data-fetching library is unnecessary weight for this scope.
- No changes to `server/app.ts` or the fixture generator — both already satisfy the documented API contract.

## 11. Verification plan

- `pnpm dev`, manually exercise: type a search term (debounce fires once, not per keystroke), scroll to trigger multiple `loadMore` batches, expand/collapse several cards independently, resize viewport across the three breakpoints above, throttle network in devtools to confirm skeletons/spinner appear and no duplicate/overlapping requests fire.
- `pnpm lint` / `pnpm types` clean.
