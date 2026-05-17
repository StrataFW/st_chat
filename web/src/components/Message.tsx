import { Badge, Box, createStyles, Text } from '@mantine/core'
import type { ChannelDef, RenderedMessage } from '../types'

const useStyles = createStyles((theme) => ({
  row: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'clamp(3px, 0.3vw, 6px)',
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    lineHeight: 1.35,
    color: theme.colors.gray[2],
    animation: 'fade-up 0.18s ease-out both',
    flexWrap: 'wrap',
    transition: 'opacity 1000ms ease',
  },
  fading: {
    opacity: 0,
  },
  prefix: {
    flex: '0 0 auto',
  },
  author: {
    fontWeight: 600,
    color: theme.colors.gray[0],
  },
  body: {
    flex: '1 1 200px',
    wordBreak: 'break-word',
  },
  systemBody: {
    color: theme.colors.dark[1],
    fontStyle: 'italic',
  },
}))

export function Message({ message, channel, fadingOut }: { message: RenderedMessage; channel?: ChannelDef; fadingOut?: boolean }) {
  const { classes, cx } = useStyles()

  const prefixText = message.prefix ?? channel?.prefix ?? null
  const prefixColor = message.prefixColor ?? channel?.color ?? 'gray'
  const authorStyle = message.authorColor
    ? { color: `rgb(${message.authorColor[0]}, ${message.authorColor[1]}, ${message.authorColor[2]})` }
    : undefined

  const isSystem = !message.author

  return (
    <Box className={cx(classes.row, fadingOut && classes.fading)}>
      {prefixText && (
        <Badge size="xs" color={prefixColor} variant="light" className={classes.prefix}>
          {prefixText}
        </Badge>
      )}
      {message.author && (
        <Text component="span" className={classes.author} style={authorStyle}>
          {message.author}:
        </Text>
      )}
      <Text component="span" className={cx(classes.body, isSystem && classes.systemBody)}>
        {message.body}
      </Text>
    </Box>
  )
}
