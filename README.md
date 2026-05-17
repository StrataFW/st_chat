# st_chat

Strata's replacement for the cfx-default `chat` resource. Mantine-styled
NUI matching the rest of the framework (dark + blue + Montserrat + `clamp()`),
with channels and slash-command suggestions.

**What you get:**

- On-brand chat UI — dark dark.7 backdrop, dark.5 borders, no blur, full
  framework typography
- Multi-channel state with `Tab` to cycle (default: global / local / ooc)
- Range-filtered local channel (default 30m, configurable per channel)
- Slash-command autocomplete with ↑/↓ navigation and Tab-to-complete
- 100% drop-in compatible with the cfx chat events — `chat:addMessage`,
  `chat:addSuggestion`, `chat:clear`, etc. all work unchanged
- `chatMessage` server event fires for non-command lines; `CancelEvent()`
  to mute / moderate
- Auto-stops the cfx default `chat` resource on start and re-stops it if
  anything tries to bring it back
- Native multiplayer chat HUD component hidden every frame
- ox_lib keybinds — `lib.addKeybind` for **T** (chat) and an unbound
  OOC-shortcut; users rebind via FiveM Settings → Key Bindings

## Setup

1. Drop the resource into `resources/[strata]/st_chat/`.
2. Build the UI (see below).
3. In `server.cfg`:
   ```
   ensure st_chat
   ```
   No other edits required — the server script handles disabling the
   cfx default chat itself.

## Build the UI

```sh
cd web
bun install
bun run dev    # http://localhost:5503 — browser preview with mock data
bun run build  # → ./dist  (committed assets served by FiveM)
```

## Configuration

All runtime config lives in `shared/config.lua`. Highlights:

| Field             | Purpose                                                                |
|-------------------|------------------------------------------------------------------------|
| `Channels[]`      | `{ id, label, prefix, color, range }`. `range = nil` = global; number = world-units for proximity. |
| `DefaultChannel`  | Channel id used when the user opens chat with **T**.                   |
| `IdleFadeMs`      | How long a message stays at full opacity before fading out.            |
| `MaxMessages`     | Ring-buffer size for the scrollback.                                   |
| `OpenKey`         | Default key for the open keybind (user-rebindable via FiveM settings). |

## Compatibility events

Listens to the standard cfx chat events so existing scripts drop in
unmodified:

- `chat:addMessage` (client + server) — display a message. Accepts cfx
  shape `{ color, args, multiline }` and st_chat shape
  `{ channel, prefix, color, author, body, ts }`.
- `chat:addSuggestion` / `chat:removeSuggestion` / `chat:addSuggestions` —
  slash-command autocomplete.
- `chat:clear` — wipe the message buffer.
- Server `chatMessage(source, name, message)` — fired on a non-command
  message. Call `CancelEvent()` from a handler to suppress.

## Keys

| Key      | Action                                                          |
|----------|-----------------------------------------------------------------|
| **T**    | open input                                                      |
| **Enter**| send                                                            |
| **Esc**  | cancel                                                          |
| **Tab**  | cycle channel; or complete the highlighted slash-command match  |
| **↑/↓**  | navigate command suggestions                                    |

## Exports

| Export       | Use                                                       |
|--------------|-----------------------------------------------------------|
| `addMessage` | client-side — push a message into the local scrollback    |

## Layout

```
st_chat/
├── fxmanifest.lua
├── shared/
│   ├── types.lua          ---@meta type aliases (Channel, Message, Suggestion)
│   └── config.lua         channels, default channel, idle fade, max messages
├── client/
│   └── main.lua           Chat.* — cfx event ↔ NUI bridge, keybinds, HUD suppress
├── server/
│   └── main.lua           range filter, chatMessage hook, suggestion broadcast
└── web/
    ├── src/               React + Mantine UI source
    ├── dist/              built bundle (Vite output)
    ├── package.json
    └── vite.config.ts
```

Uses ox_lib helpers — `lib.addKeybind` for the open keys.

## Dependencies

- `ox_lib` — keybinds
- `st_log` *(optional)* — used by the server for the "cfx chat re-started, stopped again" warning

## License

MIT — see [`LICENSE`](./LICENSE).
