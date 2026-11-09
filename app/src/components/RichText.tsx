import React from 'react'

type Node = {
  type?: string
  text?: string
  tag?: string
  listType?: string
  children?: Node[]
  [k: string]: unknown
}

/** 極簡 Lexical → React 渲染器（足夠型錄描述使用）。 */
export function RichText({ data }: { data: unknown }) {
  const root = (data as { root?: Node } | undefined)?.root
  if (!root?.children?.length) return null
  return <div className="rich-text">{root.children.map((n, i) => render(n, i))}</div>
}

function render(node: Node, key: number): React.ReactNode {
  if (!node) return null

  if (node.type === 'text') {
    let out: React.ReactNode = node.text ?? ''
    const format = Number(node.format ?? 0)
    if (format & 1) out = <strong key={key}>{out}</strong>
    if (format & 2) out = <em key={key}>{out}</em>
    return <React.Fragment key={key}>{out}</React.Fragment>
  }

  const children = (node.children ?? []).map((c, i) => render(c, i))

  switch (node.type) {
    case 'root':
      return <React.Fragment key={key}>{children}</React.Fragment>
    case 'paragraph':
      return <p key={key}>{children}</p>
    case 'heading': {
      const tag = (node.tag as string) || 'h2'
      const H = tag as keyof React.JSX.IntrinsicElements
      return <H key={key}>{children}</H>
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={key}>{children}</Tag>
    }
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'quote':
      return <blockquote key={key}>{children}</blockquote>
    case 'link': {
      const fields = node.fields as { url?: string } | undefined
      return (
        <a key={key} href={fields?.url ?? '#'} rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    case 'linebreak':
      return <br key={key} />
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>
  }
}
