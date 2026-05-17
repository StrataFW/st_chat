import { Box, createStyles, Text } from '@mantine/core'
import type { SuggestionDef } from '../types'

const useStyles = createStyles((theme) => ({
  panel: {
    backgroundColor: theme.colors.dark[7],
    border: `1px solid ${theme.colors.dark[5]}`,
    borderRadius: theme.radius.sm,
    padding: 'clamp(3px, 0.25vw, 5px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
    maxHeight: 'clamp(130px, 14vw, 200px)',
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    padding: 'clamp(3px, 0.25vw, 5px) clamp(6px, 0.45vw, 10px)',
    borderRadius: theme.radius.xs,
    cursor: 'default',
  },
  active: {
    backgroundColor: theme.fn.rgba(theme.colors.blue[6], 0.18),
  },
  name: {
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    fontWeight: 600,
    color: theme.colors.gray[0],
    fontFamily: 'Montserrat, sans-serif',
  },
  help: {
    fontSize: 'clamp(9px, 0.45vw, 10px)',
    color: theme.colors.dark[1],
  },
  params: {
    marginTop: 2,
    display: 'flex',
    gap: 'clamp(3px, 0.25vw, 5px)',
    flexWrap: 'wrap',
  },
  param: {
    fontSize: 'clamp(9px, 0.4vw, 10px)',
    color: theme.colors.gray[5],
    backgroundColor: theme.colors.dark[6],
    padding: '1px 5px',
    borderRadius: theme.radius.xs,
    fontFamily: 'Montserrat, sans-serif',
  },
}))

export function Suggestions({ matches, highlight }: { matches: SuggestionDef[]; highlight: number }) {
  const { classes, cx } = useStyles()
  return (
    <Box className={classes.panel}>
      {matches.map((s, i) => {
        const display = s.name.startsWith('/') ? s.name : `/${s.name}`
        return (
          <Box key={s.name + i} className={cx(classes.row, i === highlight && classes.active)}>
            <Text className={classes.name}>{display}</Text>
            {s.help && <Text className={classes.help}>{s.help}</Text>}
            {s.params && s.params.length > 0 && (
              <Box className={classes.params}>
                {s.params.map((p) => (
                  <span key={p.name} className={classes.param}>
                    {p.name}
                  </span>
                ))}
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
