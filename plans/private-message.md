# Plan — Private Message Frontend (2026-07-21)

## Overview

Add private message room listing UI that connects to the backend chat API. Users can see a list of their chat rooms (private/group) displayed as cards, matching the announcement list page layout.

## Pages

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/chat/rooms` | ChatRoomListPage | Yes | Card list of user's chat rooms |

## Files

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add ChatRoom response types |
| `src/api/chat.ts` | New | Chat room API calls |
| `src/hooks/useChat.ts` | New | Chat room list hook |
| `src/pages/ChatRoomListPage.tsx` | New | Chat room list page |
| `src/pages/MessagesPage.tsx` | Modify | Add private message card |
| `src/App.tsx` | Modify | Add chat room route |
| `src/App.css` | Modify | Add chat room list styles |

## Implementation Order

1. Types → API → Hooks
2. ChatRoomListPage
3. MessagesPage card + Route + CSS
4. Build verification
