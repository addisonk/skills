---
name: presentational-components
description: Enforces presentational UI component patterns where components receive all data via props and callbacks, with data logic in domain-focused hooks. Use when creating new components, reviewing component architecture, or separating data from presentation in React apps using Convex, Clerk, or similar providers.
---

# Presentational Components

UI components must be **presentational only** — they receive all data via props and call callback functions for actions.

## Rules

Components must NOT contain:
- `useQuery` or `useMutation` (Convex)
- `useUser` (Clerk)
- `useRouter` for navigation logic
- Any data fetching or external side effects

Local UI state via `useState` (form input, dropdown open/closed, hover) is fine — that's presentation, not data.

## Reusable Primitive Conventions

Build polished primitives around the DOM they render:

- Type the root with its corresponding native React prop type, such as `ComponentPropsWithoutRef<"article">`, and merge the caller's root `className` with the component defaults.
- Give the root and each meaningful internal DOM part a stable `data-slot` name. Use those slots for composition, CSS targeting, and focused tests.
- Put visual state such as `size`, `tone`, or `orientation` on the root as `data-*` attributes. Treat the root as a styling group and let descendants respond through selectors such as `[data-slot="card"][data-size="compact"] [data-slot="card-title"]`; do not add variants named after a business composition.
- Forward ordinary native root props. Spread them before component-owned `data-slot`, identity, state, and merged `className` attributes so callers cannot accidentally replace the component contract.
- When callers may customize a nested element, accept a dedicated `className` prop for it and merge that value with the element's defaults.
- Name props after rendered UI concepts (`size`, `title`, `actionLabel`), not an upstream data source or placement (`queryResult`, `dashboardSidebarMode`). Keep composition-specific decisions in the parent.
- Query stable `data-slot` selectors in focused tests instead of embedding private test IDs. Add provider-free stories that pass plain props and callbacks so each visual state can be inspected in isolation.

Prefer selectors derived from root state and slots over conditionally changing every descendant class in JSX. This keeps the public API small while preserving independent styling and test hooks for internal parts.

## Naming

Presentational components use simple names without suffixes:

| Good | Bad | Why |
| --- | --- | --- |
| `Message` | `MessageUI` | No suffix needed — all components are presentational |
| `PostCard` | `PostCardUI` | The component _is_ the UI |
| `JoinCard` | `JoinCardPresentation` | Verbose and unnecessary |

## Where Data Logic Goes

1. **Custom hooks** in `hooks/` — for reusable data patterns
2. **Page components** — for one-off data needs

## Hook Naming

Hooks should be **domain-focused**, not component-focused:

| Good (Domain) | Bad (Component) | Why |
| --- | --- | --- |
| `useCommunity` | `useJoinCard` | Reusable by any component needing community data |
| `usePostActions` | `usePostCard` | Reusable for delete/like actions anywhere |
| `useUser` | `useProfileCard` | User data needed in many places |

Domain hooks can serve multiple components:
- `useCommunity` → JoinCard, CommunityHeader, CommunitySidebar, MemberList
- `usePostActions` → PostCard, PostDetail, MessageList, ActivityFeed

## File Structure

```
components/feature/my-component.tsx  → Presentational component
hooks/use-{domain}.ts                → Domain-focused hook
```

## Pattern

```tsx
// hooks/use-community.ts — Domain-focused hook
export function useCommunity(slug: string) {
  const community = useQuery(api.communities.getBySlug, { slug });
  const join = useMutation(api.communityMembers.join);
  return { community, join, isLoading: !community };
}

// components/community/join-card.tsx — Presentational
export function JoinCard({ community, onJoin }: Props) {
  return (
    <Card>
      <h2>{community.name}</h2>
      <Button onClick={onJoin}>Join</Button>
    </Card>
  );
}

// app/c/[slug]/page.tsx — Page wires them together
export default function CommunityPage({ params }) {
  const { community, join } = useCommunity(params.slug);
  return <JoinCard community={community} onJoin={join} />;
}
```

## Worked Examples

### Simple: data + single action

Pass shaped data and named callbacks explicitly:

```tsx
<JoinCard
  community={{ name: "...", memberCount: 123 }}
  isMember={false}
  onJoin={handleJoin}
/>
```

Or spread the hook result when the hook already returns the props the component expects:

```tsx
const props = useCommunity({ communitySlug: "my-community" });
return <JoinCard {...props} />;
```

### Richer: permissions + multiple mutations

When a hook needs to compute permissions and own multiple mutations, take context as input and return everything the component needs as plain values and callbacks:

```tsx
// hooks/use-post-actions.ts
const actions = usePostActions({ post, communitySlug, communityOwnerId });
// → { canDelete, canEdit, onDelete, onLike, isLiked, ... }

// Page:
return <PostCard {...actions} post={post} communitySlug={communitySlug} />;
```

The component receives flags (`canDelete`, `isLiked`) and callbacks (`onDelete`, `onLike`) — never raw mutations, auth state, or routing.

## Adding New Components

1. **Start with the presentational component** — define props interface with all needed data and callbacks
2. **Create a domain-focused hook** in `hooks/` — name it after the data domain, not the UI component

## Presentational Blocks

A **block** is a copy-pasteable composition that ships a complete UI section (dashboard, sign-in, feed) — a folder of presentational components plus one wiring page.

The same rules apply at the block level: components stay presentational, the block's `page.tsx` is the only file that calls hooks, and mock data lives alongside so the block previews without providers.

For folder layout, the block-vs-component decision, and a worked example, see [`references/blocks.md`](references/blocks.md).

## Templates

Starter scaffolds in `templates/`:

- [`templates/component.tsx`](templates/component.tsx) — presentational component
- [`templates/domain-hook.ts`](templates/domain-hook.ts) — domain-focused hook
- [`templates/block/`](templates/block) — full block scaffold (page + components + mock data)

## Benefits

- Components work in registries/storybooks without providers
- Easy testing with mock props
- Clear separation of concerns
- Reusable across different data sources

## Review Checklist

When reviewing or creating components, verify:

- [ ] Component has zero data-fetching imports
- [ ] All dynamic data comes through props
- [ ] All actions are callback props (e.g., `onJoin`, `onDelete`)
- [ ] Hook is named after the domain, not the component
- [ ] Hook lives in `hooks/use-{domain}.ts`
- [ ] Page/parent component wires hook to presentational component
- [ ] Root uses its native React prop type, forwards native props, and merges `className`
- [ ] Meaningful DOM parts have stable `data-slot` names
- [ ] Root `data-*` attributes express visual state for descendant selectors
- [ ] Component-owned slot, identity, and state attributes cannot be overwritten
- [ ] Nested customization classes merge with defaults
- [ ] Props describe rendered UI rather than data sources or business placement
- [ ] Tests use slot selectors and stories render without providers
