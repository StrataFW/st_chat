---@class st_chat.Config
Config = {}

---@type st_chat.Channel[]
Config.Channels = {
    { id = 'global', label = 'Global', prefix = nil,     color = 'gray',   range = nil  },
    { id = 'local',  label = 'Local',  prefix = 'LOCAL', color = 'yellow', range = 30.0 },
    { id = 'ooc',    label = 'OOC',    prefix = 'OOC',   color = 'cyan',   range = nil  },
}

Config.DefaultChannel = 'global'
Config.IdleFadeMs     = 12000
Config.MaxMessages    = 100
Config.OpenKey        = 'T'
