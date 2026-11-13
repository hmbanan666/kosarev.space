export interface ProjectDecision {
  title: string
  why: string
}

export interface ProjectSectionLink {
  label: string
  href: string
}

export interface ProjectSections {
  problem?: string
  built?: string
  decisions: ProjectDecision[]
  stack: string[]
  statusNext?: string
  links: ProjectSectionLink[]
}

export interface ProjectSectionMessages {
  te: (key: string) => boolean
  tm: (key: string) => unknown
  resolve?: (message: unknown) => string
}

function readLeaf(value: unknown, resolve?: (message: unknown) => string): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (!value || typeof value !== 'object' || !resolve) {
    return undefined
  }
  try {
    const trimmed = resolve(value).trim()
    return trimmed || undefined
  } catch {
    return undefined
  }
}

function isSafeHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value)
    || (value.startsWith('/') && !value.startsWith('//'))
    || /^mailto:\S+$/i.test(value)
}

function readDecisions(value: unknown, leaf: (value: unknown) => string | undefined): ProjectDecision[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }
    const record = item as Record<string, unknown>
    const title = leaf(record.title)
    const why = leaf(record.why)
    return title && why ? [{ title, why }] : []
  })
}

function readStack(value: unknown, leaf: (value: unknown) => string | undefined): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item) => {
    const label = leaf(item)
    return label ? [label] : []
  })
}

function readLinks(value: unknown, leaf: (value: unknown) => string | undefined): ProjectSectionLink[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }
    const record = item as Record<string, unknown>
    const label = leaf(record.label)
    const href = leaf(record.href)
    return label && href && isSafeHref(href) ? [{ label, href }] : []
  })
}

export function readProjectSections(source: unknown, resolve?: (message: unknown) => string): ProjectSections | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return null
  }
  const record = source as Record<string, unknown>
  const leaf = (value: unknown) => readLeaf(value, resolve)
  const problem = leaf(record.problem)
  const built = leaf(record.built)
  const statusNext = leaf(record.statusNext)
  const decisions = readDecisions(record.decisions, leaf)
  const stack = readStack(record.stack, leaf)
  const links = readLinks(record.links, leaf)
  if (!problem && !built && !statusNext && decisions.length === 0 && stack.length === 0 && links.length === 0) {
    return null
  }
  return {
    ...(problem ? { problem } : {}),
    ...(built ? { built } : {}),
    decisions,
    stack,
    ...(statusNext ? { statusNext } : {}),
    links,
  }
}

export function projectSectionsFor(key: string, messages: ProjectSectionMessages): ProjectSections | null {
  const path = `projects.${key}.sections`
  if (!messages.te(path)) {
    return null
  }
  return readProjectSections(messages.tm(path), messages.resolve)
}
