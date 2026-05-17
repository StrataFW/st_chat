import { Box, createStyles } from '@mantine/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import type {
  ChannelDef,
  IncomingMessage,
  InitPayload,
  RenderedMessage,
  SuggestionDef,
} from './types'
import { isInGame, nui } from './nui-kit/nui'

const useStyles = createStyles(() => ({
  root: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
  },
  rail: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '42%',
    left: 'clamp(8px, 1vw, 16px)',
    transform: 'translateY(-50%)',
    width: 'clamp(240px, 18vw, 360px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(2px, 0.25vw, 5px)',
  },
}))

const DEFAULT_INIT: InitPayload = {
  channels: [
    { id: 'global', label: 'Global', prefix: null, color: 'gray', range: null },
    { id: 'local', label: 'Local', prefix: 'LOCAL', color: 'yellow', range: 30 },
    { id: 'ooc', label: 'OOC', prefix: 'OOC', color: 'cyan', range: null },
  ],
  defaultChannel: 'global',
  idleFadeMs: 12000,
  maxMessages: 100,
}

const MOCK_MESSAGES: RenderedMessage[] = [
  { id: 1, body: 'Welcome to Strata. Type / to see available commands.', ts: Date.now() - 30000 },
  { id: 2, channelId: 'global', author: 'Carl Vance', body: 'Heading to mission row.', ts: Date.now() - 15000 },
  { id: 3, channelId: 'local', prefix: 'LOCAL', prefixColor: 'yellow', author: 'Diane Park', body: 'Anyone need a ride?', ts: Date.now() - 5000 },
]

let nextId = 1000

function normalize(m: IncomingMessage): RenderedMessage {
  const body = m.body ?? (m.args ? m.args.slice(m.author ? 1 : 0).join(' ') : '')
  const author = m.author ?? (m.args && m.args.length > 1 ? m.args[0] : undefined)

  let authorColor: [number, number, number] | null = null
  if (Array.isArray(m.color) && m.color.length === 3) {
    authorColor = [m.color[0], m.color[1], m.color[2]]
  }

  const prefixColor = typeof m.color === 'string' ? m.color : undefined

  return {
    id: nextId++,
    channelId: m.channel,
    prefix: m.prefix ?? null,
    prefixColor,
    authorColor,
    author,
    body,
    ts: m.ts ? m.ts * 1000 : Date.now(),
  }
}

export default function App() {
  const { classes } = useStyles()
  const [init, setInit] = useState<InitPayload>(DEFAULT_INIT)
  const [messages, setMessages] = useState<RenderedMessage[]>(isInGame ? [] : MOCK_MESSAGES)
  const [inputOpen, setInputOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<string>(DEFAULT_INIT.defaultChannel)
  const [suggestions, setSuggestions] = useState<Record<string, SuggestionDef>>({})
  const [sentHistory, setSentHistory] = useState<string[]>([])

  const channelsById = useMemo(() => {
    const map = new Map<string, ChannelDef>()
    for (const c of init.channels) map.set(c.id, c)
    return map
  }, [init.channels])

  const pushMessage = useCallback((m: IncomingMessage) => {
    setMessages((prev) => {
      const next = [...prev, normalize(m)]
      if (next.length > init.maxMessages) next.splice(0, next.length - init.maxMessages)
      return next
    })
  }, [init.maxMessages])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const msg = e?.data
      if (!msg || typeof msg !== 'object' || !msg.action) return

      switch (msg.action) {
        case 'init':
          setInit(msg.payload as InitPayload)
          setActiveChannel((msg.payload as InitPayload).defaultChannel)
          break
        case 'addMessage':
          pushMessage(msg.payload as IncomingMessage)
          break
        case 'setSuggestions':
          setSuggestions((msg.payload?.suggestions ?? {}) as Record<string, SuggestionDef>)
          break
        case 'clear':
          setMessages([])
          break
        case 'open': {
          const ch = (msg.payload?.channel as string | undefined) ?? init.defaultChannel
          setActiveChannel(ch)
          if (msg.payload?.suggestions) {
            setSuggestions(msg.payload.suggestions as Record<string, SuggestionDef>)
          }
          setInputOpen(true)
          break
        }
        case 'close':
          setInputOpen(false)
          break
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [init.defaultChannel, pushMessage])

  const handleClose = useCallback(() => {
    setInputOpen(false)
    nui('close')
  }, [])

  const handleSubmit = useCallback(async (message: string, channel: string) => {
    setInputOpen(false)
    const trimmed = message.trim()
    if (trimmed.length > 0) {
      setSentHistory((prev) => {
        if (prev[prev.length - 1] === trimmed) return prev
        const next = [...prev, trimmed]
        return next.length > 50 ? next.slice(next.length - 50) : next
      })
    }
    await nui('submit', { message, channel })
  }, [])

  const handleCycleChannel = useCallback(() => {
    setActiveChannel((cur) => {
      const ids = init.channels.map((c) => c.id)
      const idx = ids.indexOf(cur)
      return ids[(idx + 1) % ids.length] ?? cur
    })
  }, [init.channels])

  const channels = init.channels

  return (
    <Box className={classes.root}>
      <Box className={classes.rail}>
        <MessageList
          messages={messages}
          channels={channelsById}
          forcedVisible={inputOpen}
        />
        {inputOpen && (
          <ChatInputContainer
            channels={channels}
            channelsById={channelsById}
            activeChannel={activeChannel}
            onCycleChannel={handleCycleChannel}
            suggestions={suggestions}
            sentHistory={sentHistory}
            onSubmit={handleSubmit}
            onClose={handleClose}
          />
        )}
      </Box>
    </Box>
  )
}

function ChatInputContainer(props: {
  channels: ChannelDef[]
  channelsById: Map<string, ChannelDef>
  activeChannel: string
  onCycleChannel: () => void
  suggestions: Record<string, SuggestionDef>
  sentHistory: string[]
  onSubmit: (message: string, channel: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [])
  return <ChatInput inputRef={ref} {...props} />
}
