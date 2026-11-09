/**
 * 極簡 Lexical 富文本產生器。
 * 把純文字（\n 分段）轉成 Payload lexical 欄位可接受的 JSON 結構。
 */

type LexNode = Record<string, unknown>

const textNode = (text: string): LexNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraph = (text: string): LexNode => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [textNode(text)],
})

const listItem = (text: string): LexNode => ({
  type: 'listitem',
  value: 1,
  checked: undefined,
  version: 1,
  children: [textNode(text)],
})

const bulletList = (items: string[]): LexNode => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map(listItem),
})

/**
 * 純文字 → Lexical root。
 * 以行為單位；單行視為段落，行數 > 1 且行數 ≤ 20 時視為條列（型錄描述多為規格條列）。
 */
export function textToLexical(
  input: string | undefined | null,
  opts: { asList?: boolean } = {},
): { root: LexNode } | undefined {
  const raw = (input || '').trim()
  if (!raw) return undefined

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return undefined

  const useList = opts.asList ?? (lines.length > 1 && lines.length <= 25)

  const children: LexNode[] = useList
    ? [bulletList(lines)]
    : lines.map(paragraph)

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }
}
