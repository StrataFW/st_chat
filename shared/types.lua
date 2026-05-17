---@meta

---@class st_chat.Channel
---@field id     string
---@field label  string
---@field prefix string|nil
---@field color  string
---@field range  number|nil    nil = global, number = world units for proximity

---@class st_chat.Suggestion
---@field name    string         starts with '/'
---@field help    string?
---@field params? { name: string, help: string? }[]

---@class st_chat.Message
---@field channel  string?
---@field prefix   string?
---@field color    string?
---@field author   string?
---@field authorId integer?
---@field body     string?
---@field args?    any[]
---@field ts       integer?

---@class st_chat.SayPayload
---@field channel string
---@field message string
