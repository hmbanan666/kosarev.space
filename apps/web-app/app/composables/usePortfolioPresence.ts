export function usePortfolioPresence() {
  const enabled = useState('portfolio-presence-enabled', () => true)
  const available = useState('portfolio-presence-available', () => false)
  const connected = useState('portfolio-presence-connected', () => false)
  const count = useState('portfolio-presence-count', () => 0)
  function toggle() {
    enabled.value = !enabled.value
    try {
      localStorage.setItem('kosarev-live-cursors', enabled.value ? 'on' : 'off')
    } catch {}
  }
  return { enabled, available, connected, count, toggle }
}
