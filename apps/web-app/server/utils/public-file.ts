import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

export function resolvePublicFile(relativePath: string): string {
  const roots = [join(process.cwd(), 'public'), join(process.cwd(), '.output', 'public')]
  for (const root of roots) {
    const candidate = join(root, relativePath)
    if (existsSync(candidate)) {
      return candidate
    }
  }
  throw new Error(`Public file not found: ${relativePath}`)
}
