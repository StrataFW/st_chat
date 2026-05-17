local MAX_MESSAGE_LEN <const> = 256

local function stopDefaultChat()
    if GetResourceState('chat') == 'started' then
        StopResource('chat')
    end
end

CreateThread(stopDefaultChat)

AddEventHandler('onResourceStart', function(name)
    if name ~= 'chat' then return end
    StopResource('chat')
    if Log then
        Log.warn('st_chat', 'cfx default chat was started — stopped to prevent UI conflict')
    end
end)

---@param id string
---@return st_chat.Channel|nil
local function findChannel(id)
    for _, ch in ipairs(Config.Channels) do
        if ch.id == id then return ch end
    end
end

---@param src integer
---@return string
local function getName(src)
    return GetPlayerName(src) or ('Player ' .. src)
end

---@param channel st_chat.Channel
---@param src integer
---@param message string
local function broadcast(channel, src, message)
    local payload = {
        channel  = channel.id,
        prefix   = channel.prefix,
        color    = channel.color,
        author   = getName(src),
        authorId = src,
        body     = message,
        ts       = os.time(),
    }

    if channel.range == nil then
        TriggerClientEvent('st_chat:incoming', -1, payload)
        return
    end

    local origin = GetEntityCoords(GetPlayerPed(src))
    if not origin then
        TriggerClientEvent('st_chat:incoming', src, payload)
        return
    end

    for _, pid in ipairs(GetPlayers()) do
        local target = tonumber(pid)
        if target then
            local ped = GetPlayerPed(target)
            local pos = ped and GetEntityCoords(ped)
            if pos and #(pos - origin) <= channel.range then
                TriggerClientEvent('st_chat:incoming', target, payload)
            end
        end
    end
end

RegisterNetEvent('st_chat:say', function(data)
    local src = source
    if type(data) ~= 'table' then return end

    local message = tostring(data.message or '')
    if #message == 0 or #message > MAX_MESSAGE_LEN then return end

    local channel = findChannel(data.channel) or findChannel(Config.DefaultChannel)
    if not channel then return end

    TriggerEvent('chatMessage', src, getName(src), message)
    if WasEventCanceled() then return end

    broadcast(channel, src, message)
end)

AddEventHandler('chat:addMessage', function(target, message)
    if message == nil then
        message = target
        target  = -1
    end
    TriggerClientEvent('chat:addMessage', target, message)
end)
