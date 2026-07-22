# Plan — Add Room Members (2026-07-22)

## Overview

Add a page that lets users invite other members into a chat room. Shows all system members with checkboxes, sends selected member IDs to the backend.

## API

| Method | Path | Request | Response |
|--------|------|---------|----------|
| `POST /api/members` | List members | `{page?, limit?}` | `{members: [{id,email,name}], total}` |
| `POST /api/chat/rooms/{roomId}/members` | Add members | `{member_ids: ["uuid"]}` | `{message: "members added"}` |

## Pages

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/chat/rooms/:roomId/add-members` | AddRoomMembersPage | Yes | Member selection with checkboxes |

## Files

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add `MembersListResponse` |
| `src/api/members.ts` | Modify | Add `listMembers()` |
| `src/api/chat.ts` | Modify | Add `addRoomMembers()` |
| `src/pages/AddRoomMembersPage.tsx` | New | Member selection page |
| `src/pages/ChatRoomDetailPage.tsx` | Modify | Add "邀請成員" button in header |
| `src/App.tsx` | Modify | Add route |
| `src/App.css` | Modify | Add member selection page styles |
| `decisions/2026-07-22.md` | Modify | Update decisions |

## Implementation Order

1. Plan file
2. Types → API
3. AddRoomMembersPage (sub-agent)
4. ChatRoomDetailPage button + App.tsx route
5. CSS + Decision file + Build verification
