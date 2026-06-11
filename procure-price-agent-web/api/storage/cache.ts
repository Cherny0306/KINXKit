export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class TtlCache<T> {
  private map = new Map<string, CacheEntry<T>>()

  constructor(private ttlMs: number) {}

  get(key: string): T | null {
    const e = this.map.get(key)
    if (!e) return null
    if (Date.now() >= e.expiresAt) {
      this.map.delete(key)
      return null
    }
    return e.value
  }

  set(key: string, value: T) {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }
}

