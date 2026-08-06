# Calendar Feature

## Goal
Build a full-featured calendar page that aggregates three event types:
1. **Events** (`GET /api/events?year=&month=`) — full CRUD, blue bars
2. **Bulletin board announcements** (`GET /api/announcements`) — red bars (stub until backend API is ready)
3. **Chat room topics** (`GET /api/chat/rooms`) — orange bars (stub until backend API is ready)

## UI Design

### Month Grid
- Self-built month grid (no external dependency)
- Each day cell shows:
  - Date number (top-left)
  - Event bars (rounded rectangles) below, one per event
  - Colors: events=blue, announcements=red, chat topics=orange
  - Multi-day events span across consecutive day cells
  - Events sorted by start_time per cell
  - If too many events: "+N more..." truncation
- Month navigation: ◀ prev / month title / next ▶ + "Today" button
- Clicking a day cell → create event for that day
- Clicking an event bar → navigate to event detail

### Pages
| Page | Route | Auth | Description |
|------|-------|------|-------------|
| CalendarPage | `/calendar` | No | Month grid with all event types |
| CalendarEventCreatePage | `/calendar/new` | Yes | Create event form |
| CalendarEventDetailPage | `/calendar/:id` | Yes | View/edit/delete event + viewer management |

### Navigation
- Dashboard card: "日曆" with 📅 icon
- Navbar link: "事件管理" added to `<nav>` in Layout

### Data Model (frontend)
```typescript
// Unified display type (not stored in backend)
interface CalendarDisplayEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  type: 'event' | 'announcement' | 'chat'
  sourceId: string         // original ID in source system
  status?: string
  creator_name?: string
  created_at?: string
}
```

Backend `Event` type follows the existing `domain.Event` struct:
- `id`, `title`, `description`, `start_time`, `end_time`, `status`, `created_by`, `creator_name`, `created_at`, `updated_at`

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Add `CalendarEvent`, request/response interfaces |
| `src/api/events.ts` | Event API functions (8 endpoints) |
| `src/hooks/useCalendar.ts` | Calendar hooks (list/create/update/delete) |
| `src/pages/CalendarPage.tsx` | Main calendar grid page |
| `src/pages/CalendarEventCreatePage.tsx` | Create event form |
| `src/pages/CalendarEventDetailPage.tsx` | Event detail/edit/viewer mgmt |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/calendar`, `/calendar/new`, `/calendar/:id` routes |
| `src/components/Layout.tsx` | Add "事件管理" nav link |
| `src/pages/DashboardPage.tsx` | Add "日曆" dashboard card |
| `src/App.css` | Add all `.calendar-*` styles |

## Implementation Order
1. Types → API module → Hook
2. CalendarPage (main view)
3. CalendarEventDetailPage
4. CalendarEventCreatePage
5. App.tsx routing
6. Layout.tsx / DashboardPage.tsx navigation
7. CSS styles
8. Lint verification
