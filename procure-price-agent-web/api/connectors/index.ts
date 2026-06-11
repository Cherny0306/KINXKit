import type { SiteId } from '../../shared/types'
import type { SiteConnector } from './types.js'
import { BeyotimeConnector } from './beyotime.js'
import { MceConnector } from './mce.js'
import { JdConnector } from './jd.js'

const allConnectors: SiteConnector[] = [new BeyotimeConnector(), new MceConnector(), new JdConnector()]

export function getConnectors(siteIds: SiteId[]): SiteConnector[] {
  const set = new Set(siteIds)
  return allConnectors.filter((c) => set.has(c.siteId))
}

export function listConnectors(): Array<{ siteId: SiteId; displayName: string }> {
  return allConnectors.map((c) => ({ siteId: c.siteId, displayName: c.displayName }))
}

