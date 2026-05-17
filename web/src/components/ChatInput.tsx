import { Badge, Box, createStyles, Kbd } from '@mantine/core'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import type { ChannelDef, SuggestionDef } from '../types'
import { Suggestions } from './Suggestions'

const useStyles = createStyles((theme) => ({
  shell: {
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(3px, 0.25vw, 5px)',
    animation: 'slide-up 0.18s ease-out both',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(5px, 0.4vw, 8px)',
    backgroundColor: theme.colors.dark[7],
    border: `1px solid ${theme.colors.dark[5]}`,
    borderRadius: theme.radius.sm,
    padding: 'clamp(4px, 0.35vw, 8px) clamp(8px, 0.55vw, 12px)',
    boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
  },
  channelBadge: {
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 'clamp(9px, 0.45vw, 10px)',
    letterSpacing: '0.06em',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: theme.colors.gray[0],
    fontFamily: 'inherit',
    fontSize: 'clamp(11px, 0.6vw, 13px)',
    padding: 0,
    minWidth: 0,
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(3px, 0.25vw, 5px)',
    color: theme.colors.dark[2],
    fontSize: 'clamp(9px, 0.45vw, 10px)',
    flexShrink: 0,
  },
}))

export function ChatInput(props: {
  inputRef: RefObject<HTMLInputElement>
  channels: ChannelDef[]
  channelsById: Map<string, ChannelDef>
  activeChannel: string
  onCycleChannel: () => void
  suggestions: Record<string, SuggestionDef>
  sentHistory: string[]
  onSubmit: (message: string, channel: string) => void
  onClose: () => void
}) {
  const { classes } = useStyles()
  const [value, setValue] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [recallIdx, setRecallIdx] = useState<number>(-1)

  const ch = props.channelsById.get(props.activeChannel) ?? props.channels[0]

  const matches = useMemo(() => {
    if (!value.startsWith('/')) return []
    const term = value.slice(1).split(/\s+/)[0].toLowerCase()
    const all = Object.values(props.suggestions)
    if (!term) return all.slice(0, 8)
    return all
      .filter((s) => s.name.replace(/^\//, '').toLowerCase().startsWith(term))
      .slice(0, 8)
  }, [value, props.suggestions])

  useEffect(() => { setHighlight(0) }, [matches.length, value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      props.onClose()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (matches.length > 0 && value.startsWith('/')) {
        const choice = matches[highlight] ?? matches[0]
        const name = choice.name.startsWith('/') ? choice.name : `/${choice.name}`
        setValue(name + ' ')
      } else {
        props.onCycleChannel()
      }
      return
    }
    if (matches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => (h + 1) % matches.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => (h - 1 + matches.length) % matches.length)
        return
      }
    } else {
      if (e.key === 'ArrowUp' && props.sentHistory.length > 0) {
        e.preventDefault()
        const next = recallIdx < 0
          ? props.sentHistory.length - 1
          : Math.max(0, recallIdx - 1)
        setRecallIdx(next)
        setValue(props.sentHistory[next] ?? '')
        return
      }
      if (e.key === 'ArrowDown' && recallIdx >= 0) {
        e.preventDefault()
        const next = recallIdx + 1
        if (next >= props.sentHistory.length) {
          setRecallIdx(-1)
          setValue('')
        } else {
          setRecallIdx(next)
          setValue(props.sentHistory[next] ?? '')
        }
        return
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      props.onSubmit(value, props.activeChannel)
      return
    }
  }

  return (
    <Box className={classes.shell}>
      {matches.length > 0 && <Suggestions matches={matches} highlight={highlight} />}
      <Box className={classes.row}>
        <Badge
          color={ch?.color ?? 'gray'}
          variant="light"
          className={classes.channelBadge}
          onClick={props.onCycleChannel}
          title="Tab to cycle channel"
        >
          {ch?.label ?? props.activeChannel}
        </Badge>
        <input
          ref={props.inputRef}
          className={classes.input}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (recallIdx >= 0) setRecallIdx(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Say something — or type / for commands"
          maxLength={256}
          spellCheck={false}
          autoComplete="off"
        />
        <Box className={classes.hint}>
          <Kbd>Tab</Kbd>
          <span>channel</span>
          <Kbd>Esc</Kbd>
        </Box>
      </Box>
    </Box>
  )
}
