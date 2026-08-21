# QA + BA Audit — "Hôm nay của mình" (no code changed)

Scope: code read of `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/lib/store.tsx`, `src/components/{AppShell,Onboarding,RescueFlow,ComparisonReset,Scale}.tsx`, `src/styles.css`, `src/routeTree.gen.ts`.

Headline: the app is currently **non-functional**. The route tree contains only `/`, and `/` renders `useStore()` / `useRescue()` without any provider or shell mounted, so the home route throws on first render. Everything below assumes P0-1 is fixed first.

## P0 — blocking

**P0-1. StoreProvider and AppShell are never mounted.**
`__root.tsx` renders only `QueryClientProvider > Outlet`. `index.tsx` calls `useStore()`, which throws `useStore must be used inside StoreProvider`.
Repro: open `/` → root error boundary ("This page didn't load"); console shows the throw.
Fix: in `__root.tsx`, wrap `<Outlet />` in `<StoreProvider><AppShell>…</AppShell></StoreProvider>`. Because AppShell renders `<main>`, delete no other landmark. Mount `<Toaster />` (sonner) once here too.

**P0-2. Header/bottom nav and onboarding/rescue never render.**
They live inside `AppShell`, which nothing renders. Consequence: no navigation, no onboarding, "Tụt mood" only reachable via the home hero button — and that button calls `useRescue()` from an unmounted provider (default no-op context), so it silently does nothing even if the store were provided.
Fix: same as P0-1; verify the rescue dialog opens from both header and hero.

**P0-3. Five navigation targets do not exist (dead links + type errors).**
`src/routes/` contains only `__root.tsx` and `index.tsx`. Linked-to paths `/nhat-ky`, `/tien-bo`, `/muc-tieu`, `/tu-noi-voi-minh`, `/thiet-lap` have no route files, so `routeTree.gen.ts` has no entries, `<Link to>` fails typecheck, and clicks land on the 404 page.
Repro: click any nav item or "Ghi chi tiết hơn" / "Xem thư viện" on home → 404.
Fix: create the five route files with `head()` metadata each; Nhật ký (check-in list + edit/delete + detailed entry), Tiến bộ (evidence, trigger patterns, actions done), Mục tiêu (goal CRUD incl. "ngoài tầm kiểm soát"), Tự nói với mình (reminder CRUD), Thiết lập (the "Thiết lập lại cách app hỗ trợ mình" surface — re-run onboarding, edit prefs, clear samples, reset all, export).

**P0-4. `Onboarding` passes `showCloseButton={false}`, which this `DialogContent` does not accept.**
`rg showCloseButton src/components/ui/dialog.tsx` → no match. TypeScript error; also means the modal ships with a visible X while `open` is hard-forced, producing an inconsistent state.
Fix: drop the prop; control dismissal via a real "Bỏ qua" action (already present) and `onOpenChange`.

**P0-5. Onboarding is an inescapable focus trap.**
`<Dialog open={open}>` with no `onOpenChange`: Esc and overlay click cannot close it, and after `finish()` the dialog only closes because `prefs.onboarded` flips — if `setPrefs` fails there is no exit. Violates the "dừng lúc nào cũng được" promise and WCAG 2.1.2.
Fix: pass `onOpenChange={(o) => { if (!o) finish(); }}` (skip = save draft + mark onboarded).

**P0-6. Fonts declared but never loaded.**
`--font-display: "Lora"` and `--font-sans: "Be Vietnam Pro"` are set in `styles.css`, but no `<link>` exists in `__root.tsx` head. The whole "gentle, warm" type direction silently falls back to Georgia/system UI, and Vietnamese diacritics render inconsistently.
Fix: add the Google Fonts `<link rel="stylesheet">` entries to the root route `head().links` (never `@import` in the Tailwind v4 CSS).

## P1 — data integrity & core-flow correctness

**P1-1. Rescue flow writes fabricated mood/energy.**
`RescueFlow.finish()` hardcodes `mood: 2, energy: 2`. Any rescue session therefore injects an unverified 2/2 data point that drives the "ngày tối giản" banner (`lowEnergy = energy <= 2`), the home summary text, and every future trend chart.
Repro: set mood 5 / energy 5 on home → run "Tụt mood" to the end → home now claims low energy.
Fix: ask mood/energy inside the flow (one `Scale` step), or record the rescue as a distinct entry type without numeric scores and exclude it from averages.

**P1-2. Rescue creates a second check-in for the same day instead of merging.**
`addCheckIn` always prepends. `useToday().latest` = newest, so the earlier honest entry is shadowed on home but still counted in totals. Also `thought` glues feelings/fear/expectation into one string, and the **`fact` field the user typed is discarded entirely** — that is the core "tách sự thật khỏi nỗi sợ" value proposition being thrown away.
Fix: store `fact`/`fear`/`expect` as separate optional fields on `CheckIn`; merge into today's entry (update if one exists) or explicitly model multiple entries per day everywhere.

**P1-3. Home form state goes stale after any write from elsewhere.**
`mood`/`energy`/`evening` are initialised from `latest?.…` once. After a rescue session or an edit in Nhật ký, home still shows the old selection, and "Cập nhật hôm nay" writes it back — silent data regression.
Fix: derive from store (`useEffect` sync on `latest?.id`, or key the section by `latest?.id`).

**P1-4. Evening note fabricates a 3/3 check-in.**
`index.tsx` line ~330: if no check-in exists, saving the evening note creates one with `mood: mood ?? 3, energy: energy ?? 3`. Neutral scores the user never gave.
Fix: allow a check-in with `mood`/`energy` optional (`number | undefined`) and skip such entries in averages, or require a quick scale before saving.

**P1-5. Evening note has no save feedback and no dirty-state guard.**
Clicking "Lưu" changes nothing visible. Same for "Lưu ghi nhận".
Fix: sonner toast + disabled state when unchanged.

**P1-6. "Ngày da của mình" chips create duplicates with no undo.**
Each click appends a new `done: true` action, so 5 taps = 5 identical rows inflating the "việc nhỏ đã làm" counter — an emotionally meaningful number in this product.
Fix: toggle behaviour (if an action with that title exists today, remove it), and show the chips as pressed (`aria-pressed`).

**P1-7. Onboarding has no validation and no priority cap.**
Copy says "Chọn tối đa 2–3 mảng" but all 4 can be selected; header says "7 câu hỏi ngắn" while the flow has 5 steps; `name` accepts any length with no trim. `total = 5` but progress starts at 20% and the flow can be skipped from step 0 only.
Fix: enforce max 3 priorities (disable further chips + hint), trim/limit name, align the copy with the real step count, and allow "Bỏ qua" on every step.

**P1-8. Personalisation collected but unused.**
`beforeDrop`, `usualThoughts`, `supportThatHelps`, `supportThatAnnoys`, `goodEnoughDay` are stored and never read anywhere. Only `name` and `tone` affect the UI, and `priorities` only pre-selects a `<select>`. Asking 7 intimate questions and visibly ignoring them is the single biggest trust cost in the app.
Fix: surface `goodEnoughDay` in the low-energy card, `beforeDrop`/`usualThoughts` as a pre-filled prompt in the rescue flow step 1–2, and order home/action suggestions by `priorities`.

**P1-9. Sample data is indistinguishable from real data.**
Seeded check-in/actions/goals/reminders are dated today and marked only by an invisible `sample` flag. First-run "Bằng chứng mình vẫn đang đi" already claims 1 day recorded and pre-filled goals she never wrote. `clearSamples()` exists but is unreachable (no Thiết lập route).
Fix: label sample rows as "ví dụ", exclude them from evidence counters, and offer "Xoá dữ liệu mẫu" in Thiết lập.

**P1-10. `updateCheckIn` on a sample entry clears `sample` but not the seeded prose.**
Editing mood on the sample entry silently promotes fictional `thought`/`helped` text to real user data in the journal.
Fix: on first edit, either wipe sample text fields or hard-require the sample to be deleted before editing.

## P2 — accessibility, mobile, safety, product gaps

**P2-1. `Scale` radiogroup is not keyboard-operable per ARIA.**
All five `role="radio"` buttons are individually tabbable and arrow keys do nothing; no `aria-labelledby` links the group to the `<legend>`.
Fix: use shadcn `RadioGroup` (Radix handles roving tabindex + arrows) styled as the 1–5 row.

**P2-2. Tap targets and label semantics.**
The "dù không có mood" and delete buttons in the action list are well under 44×44 and sit inside a row whose `<label>` wraps the whole title — an accidental tap toggles the checkbox. Bottom-nav items are ~44px tall but the 5-item row is cramped at 320px.
Fix: `min-h-11 min-w-11` on the row buttons, move them outside the label, and allow the nav labels to wrap to two lines with `text-[10px]` at the smallest breakpoint.

**P2-3. `min-h-screen` instead of `min-h-dvh`.**
`AppShell` and both `__root.tsx` boundary screens use `min-h-screen`, which under mobile Safari's dynamic toolbar pushes the fixed bottom nav off-screen.
Fix: `min-h-dvh`.

**P2-4. Fixed bottom nav overlaps content on some pages.**
Home compensates with `pb-32`/footer `pb-28`, but each new route will have to remember this. Fix: put the padding in `AppShell`'s `<main>` only, once, and drop per-page hacks.

**P2-5. No `aria-live` on the two counters that change.**
Evidence numbers and "x/y đã làm" update silently for screen-reader users. Fix: `aria-live="polite"` on those two nodes.

**P2-6. `lang="en"` on `<html>` for an all-Vietnamese app.**
Screen readers will read Vietnamese with an English voice. Fix: `lang="vi"` in `RootShell`.

**P2-7. Crisis support is passive and easy to miss.**
The 115 / Ngày Mai 096 306 1414 numbers appear only as small muted footer text and in the rescue-flow footnote; neither is a `tel:` link. Nothing escalates when the user selects mood 1 ("Rất nặng nề") or feelings like "Sợ tương lai" repeatedly.
Fix: make both numbers tappable `tel:` links; when mood = 1 or the rescue flow ends with no chosen regulation, show a calm, non-alarming card offering the hotline and "nói với một người mình tin cậy" — worded as an option, never as a diagnosis or an alert.

**P2-8. Rescue flow can be completed empty and still congratulates.**
No selections required; step 5 says "Mình vừa xử lý nó bằng hành động" even if nothing was entered. Also Esc-closing mid-flow discards everything with no "lưu nháp".
Fix: soften step-5 copy when the session is empty; offer "Lưu những gì mình đã viết" on dismiss.

**P2-9. Privacy promise is not backed by controls.**
Footer states data stays in the browser, but there is no way to view, export, or delete it (both `clearSamples` and `resetAll` are unreachable), and `resetAll` re-seeds samples and re-opens onboarding without a confirmation dialog.
Fix: Thiết lập gets JSON export, "Xoá toàn bộ dữ liệu" behind an `AlertDialog`, and a one-line note that clearing browser data erases everything.

**P2-10. Storage robustness.**
Single key `hom-nay-cua-minh.v1` with no schema version check: a corrupt or older blob is either silently discarded (whole history lost, no notice) or shallow-merged with sample data. Quota failures are swallowed, so the user can journal for minutes and lose it.
Fix: keep a `version` field with a migration switch, and surface a toast when a write fails.

**P2-11. JTBD gaps against the brief.**
No trend view over time (Tiến bộ route missing entirely, so no "mood vs. actions" evidence); no trigger-pattern insight even though `trigger` is captured; nothing connects goals → weekly actions → today's list, so "Mục tiêu" would be a dead-end form; skin care is a chip row with no gentle streak/patience framing over weeks; no "so sánh" log so the ComparisonReset session is discarded entirely (nothing is written to the store).
Fix: prioritise Tiến bộ (30-day mood/energy sparkline + top triggers + actions-done-without-mood count) and a "kéo việc tuần này từ Mục tiêu vào hôm nay" action, and persist ComparisonReset sessions.

**P2-12. Minor code hygiene.**
`index.tsx` ends with dead `{TRIGGERS.length === 0 && null}`; `useStreakEvidence` is defined but unused while home recomputes the same numbers inline; `formatDate` unused so far.

## Suggested fix order
1. P0-1 → P0-6 (make the app runnable and navigable).
2. P1-1 → P1-4 (data integrity before she starts trusting the numbers).
3. P1-7 → P1-10 (onboarding honesty and personalisation payoff).
4. P2 accessibility (1–6), then safety (7–9), then storage and JTBD depth.
