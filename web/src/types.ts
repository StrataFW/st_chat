export interface ChannelDef {
  id: string
  label: string
  prefix: string | null
  color: string // Mantine palette name (e.g. 'gray', 'yellow', 'cyan')
  range: number | null
}

export interface InitPayload {
  channels: ChannelDef[]
  defaultChannel: string
  idleFadeMs: number
  maxMessages: number
}

export interface IncomingMessage {
  channel?: string
  prefix?: string | null
  color?: string | [number, number, number]
  author?: string
  authorId?: number
  body?: string
  ts?: number

  args?: string[]
  multiline?: boolean
  templateId?: string
  template?: string
}

export interface SuggestionDef {
  name: string
  help?: string
  params?: { name: string; help?: string }[]
}

export interface RenderedMessage {
  id: number
  channelId?: string
  prefix?: string | null
  prefixColor?: string
  authorColor?: [number, number, number] | null
  author?: string
  body: string
  ts: number
}
