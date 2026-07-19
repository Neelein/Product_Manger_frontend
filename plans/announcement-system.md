# Plan — Announcement System Frontend (2026-07-19)

## Overview

Add announcement (bulletin board) UI matching the backend announcement API. Announcements support title, content, and optional image upload.

## Pages

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/announcements` | AnnouncementListPage | No (list public) | Long-card list, newest first, centered |
| `/announcements/:id` | AnnouncementDetailPage | No (view public) | Single announcement content + image |
| `/announcements/new` | AnnouncementCreatePage | Yes | Create form with title/content/image |

## Files

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add Announcement, request/response types |
| `src/api/client.ts` | Modify | Add `apiFetchFormData` helper |
| `src/api/announcements.ts` | New | Announcement API calls (incl. multipart) |
| `src/hooks/useAnnouncement.ts` | New | Announcement CRUD hooks |
| `src/pages/AnnouncementListPage.tsx` | New | List page with long cards |
| `src/pages/AnnouncementDetailPage.tsx` | New | Detail page |
| `src/pages/AnnouncementCreatePage.tsx` | New | Create form |
| `src/pages/DashboardPage.tsx` | Modify | Add 訊息 section with 佈告欄 card |
| `src/components/Layout.tsx` | Modify | Replace disabled 訊息 with link to /announcements |
| `src/App.tsx` | Modify | Add announcement routes |
| `src/App.css` | Modify | Add announcement styles |
| `vite.config.ts` | Modify | Add /media proxy |

## Implementation Order

1. Types → API → Hooks
2. Pages (List → Detail → Create)
3. Dashboard + Layout + Router + CSS + Vite config
4. Build verification
