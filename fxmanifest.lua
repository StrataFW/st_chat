fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'st_chat'
author 'Strata Framework'
description 'Strata chat — replaces native FiveM chat with on-brand Mantine UI, channels, and slash-command suggestions.'
version '1.0.0'
repository 'https://github.com/StrataFW/st_chat'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/types.lua',
    'shared/config.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@st_log/lib/init.lua',
    'server/main.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*',
}

dependencies {
    'ox_lib',
}
