import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { FlaskConical, Settings2 } from 'lucide-react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-zinc-900 text-white">
              <FlaskConical className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">采购查价工作台</div>
              <div className="text-xs text-zinc-500">公开价 · 手动触发 · 可追溯</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/" label="查价" icon={<FlaskConical className="size-4" />} />
            <NavItem to="/settings" label="设置" icon={<Settings2 className="size-4" />} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100',
        )
      }
      end={to === '/'}
    >
      {icon}
      {label}
    </NavLink>
  )
}

