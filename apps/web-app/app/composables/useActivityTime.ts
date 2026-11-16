export function useActivityTime() {
  const { locale } = useI18n()
  const now = useState('activity-clock', () => Date.now())
  useIntervalFn(() => {
    now.value = Date.now()
  }, 60000)
  return (date: string) => {
    const seconds = Math.max(0, (now.value - Date.parse(date)) / 1000)
    const [value, unit] = seconds < 3600 ? [seconds / 60, 'minute'] : seconds < 86400 ? [seconds / 3600, 'hour'] : [seconds / 86400, 'day']
    return new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(-Math.floor(value as number), unit as Intl.RelativeTimeFormatUnit)
  }
}
