import { Box, createStyles } from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChannelDef, RenderedMessage } from '../types'
import { Message } from './Message'

const MESSAGE_TTL_MS = 5000

const useStyles = createStyles((theme) => ({
  panel: {
    pointerEvents: 'none',
    backgroundColor: 'rgba(20, 21, 23, 0.55)',
    border: `1px solid ${theme.colors.dark[5]}`,
    borderRadius: theme.radius.sm,
    padding: 'clamp(3px, 0.3vw, 6px) clamp(5px, 0.4vw, 8px)',
    maxHeight: 'clamp(120px, 14vw, 220px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(1px, 0.15vw, 3px)',
  },
}))

export function MessageList(props: {
  messages: RenderedMessage[]
  channels: Map<string, ChannelDef>
  forcedVisible: boolean
}) {
  const { messages, channels, forcedVisible } = props
  const { classes } = useStyles()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (forcedVisible) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [forcedVisible])

  const visible = useMemo(() => {
    if (forcedVisible) return messages
    return messages.filter((m) => now - m.ts < MESSAGE_TTL_MS)
  }, [messages, now, forcedVisible])

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visible])

  if (visible.length === 0) return null

  return (
    <Box ref={scrollRef} className={classes.panel}>
      {visible.map((m) => (
        <Message
          key={m.id}
          message={m}
          channel={m.channelId ? channels.get(m.channelId) : undefined}
          fadingOut={!forcedVisible && now - m.ts > MESSAGE_TTL_MS - 1000}
        />
      ))}
    </Box>
  )
}
