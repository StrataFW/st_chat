local HUD_TEXT_CHAT <const> = 20

---@class st_chat.Client
Chat = {}

---@type table<string, st_chat.Suggestion>
local suggestions = {}
local isOpen = false

---@param action string
---@param payload table?
local function send(action, payload)
    SendNUIMessage({ action = action, payload = payload })
end

---@param open boolean
local function setFocus(open)
    isOpen = open
    SetNuiFocus(open, open)
    SetNuiFocusKeepInput(false)
end

---@param message string|st_chat.Message
function Chat.addMessage(message)
    if type(message) == 'string' then
        send('addMessage', { args = { message } })
        return
    end
    if type(message) ~= 'table' then return end
    send('addMessage', message)
end

---@param initialChannelId string?
function Chat.open(initialChannelId)
    if isOpen then return end
    setFocus(true)
    send('open', { channel = initialChannelId, suggestions = suggestions })
end

function Chat.close()
    if not isOpen then return end
    setFocus(false)
    send('close')
end

-- ─── chat events (compat with cfx default) ───────────────────────────────

RegisterNetEvent('chat:addMessage', Chat.addMessage)

RegisterNetEvent('chat:addSuggestion', function(name, help, params)
    suggestions[name] = { name = name, help = help, params = params }
    send('setSuggestions', { suggestions = suggestions })
end)

RegisterNetEvent('chat:removeSuggestion', function(name)
    suggestions[name] = nil
    send('setSuggestions', { suggestions = suggestions })
end)

RegisterNetEvent('chat:addSuggestions', function(list)
    for _, s in ipairs(list) do suggestions[s.name] = s end
    send('setSuggestions', { suggestions = suggestions })
end)

RegisterNetEvent('chat:clear', function() send('clear') end)
RegisterNetEvent('chat:addTemplate', function() end)

RegisterNetEvent('st_chat:incoming', function(payload)
    send('addMessage', payload)
end)

-- ─── nui callbacks ───────────────────────────────────────────────────────

RegisterNUICallback('close', function(_, cb)
    setFocus(false)
    cb({ ok = true })
end)

RegisterNUICallback('submit', function(data, cb)
    local message = tostring(data.message or ''):gsub('^%s+', ''):gsub('%s+$', '')
    local channel = tostring(data.channel or Config.DefaultChannel)

    setFocus(false)

    if message == '' then return cb({ ok = true }) end

    if message:sub(1, 1) == '/' then
        ExecuteCommand(message:sub(2))
    else
        TriggerServerEvent('st_chat:say', { channel = channel, message = message })
    end
    cb({ ok = true })
end)

-- ─── keybinds ────────────────────────────────────────────────────────────

lib.addKeybind({
    name        = 'st_chat_open',
    description = 'Open chat',
    defaultKey  = Config.OpenKey,
    onPressed   = function() Chat.open(Config.DefaultChannel) end,
})

lib.addKeybind({
    name        = 'st_chat_open_ooc',
    description = 'Open chat (OOC)',
    defaultKey  = '',
    onPressed   = function() Chat.open('ooc') end,
})

-- ─── init + native HUD chat suppression ──────────────────────────────────

CreateThread(function()
    Wait(100)
    send('init', {
        channels       = Config.Channels,
        defaultChannel = Config.DefaultChannel,
        idleFadeMs     = Config.IdleFadeMs,
        maxMessages    = Config.MaxMessages,
    })
end)

CreateThread(function()
    while true do
        HideHudComponentThisFrame(HUD_TEXT_CHAT)
        Wait(0)
    end
end)

exports('addMessage', Chat.addMessage)
