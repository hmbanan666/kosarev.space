export function useHighlights() {
  const { tm, rt } = useI18n()

  function getHighlights(key: string): string[] {
    const raw = tm(key) as unknown[]
    if (!Array.isArray(raw)) {
      return []
    }
    return raw.map((item) => rt(item as Parameters<typeof rt>[0]))
  }

  return { getHighlights }
}
