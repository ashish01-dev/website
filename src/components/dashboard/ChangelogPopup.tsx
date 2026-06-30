'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'

const APP_PATHS = ['/dashboard', '/syllabus', '/roadmap', '/timetable', '/progress', '/pomodoro', '/completion', '/activity', '/questions', '/tests', '/revision', '/formula-vault', '/settings', '/ai', '/ai-policies']

function parseReleaseBody(body: string): string[] {
  return body
    .split('\n')
    .map(l => l.replace(/^[-*]\s*/, '').replace(/^#+\s*/, '').trim())
    .filter(l => l.length > 0 && !l.startsWith('```'))
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ChangelogPopup() {
  const { settings, loaded, update } = useSettingsStore()
  const [show, setShow] = useState(false)
  const [releaseData, setReleaseData] = useState<{ tag_name: string; name: string; body: string; published_at: string; html_url: string } | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!loaded) return
    if (!settings.showChangelog) return
    if (!settings.onboarded) return

    const fromLanding = sessionStorage.getItem('fromLanding') === 'true'
    sessionStorage.removeItem('fromLanding')

    const fetchAndCompare = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/ashish01-dev/JEEIFY/releases/latest')
        if (!res.ok) return
        const data = await res.json()
        setReleaseData(data)

        const version = data.tag_name?.replace(/^v/, '') || '1.0.0'

        if (fromLanding) {
          setShow(true)
          return
        }

        if (settings.changelogSeenVersion !== version) {
          setShow(true)
          update({ changelogSeenVersion: version })
        }
      } catch {
        // fallback — silently skip
      }
    }

    fetchAndCompare()
  }, [loaded, settings.showChangelog, settings.changelogSeenVersion, settings.onboarded, update])

  useEffect(() => {
    if (pathname && !APP_PATHS.some(p => pathname.startsWith(p))) {
      sessionStorage.setItem('fromLanding', 'true')
    }
  }, [pathname])

  if (!show) return null

  const version = (releaseData?.tag_name || 'v1.0.0').replace(/^v/, '')
  const date = releaseData?.published_at ? formatDate(releaseData.published_at) : ''
  const changes = releaseData?.body ? parseReleaseBody(releaseData.body) : []
  const releaseUrl = releaseData?.html_url || '#'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto rounded-[18px] px-[26px] py-[28px]" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(35,131,226,0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.2px]" style={{ color: 'var(--c-text)' }}>What&apos;s New</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--c-blue)' }}>
                v{version}
              </span>
              {date && <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>{date}</span>}
            </div>
          </div>
        </div>

        {changes.length > 0 && (
          <div className="mt-5 space-y-2">
            {changes.map((change, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: 'var(--c-text-secondary)' }}>
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-blue)' }} />
                {change}
              </div>
            ))}
          </div>
        )}

        {releaseUrl !== '#' && (
          <a href={releaseUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-4 text-[11px] font-medium underline transition-opacity hover:opacity-80"
            style={{ color: 'var(--c-caption)' }}>
            View full release notes →
          </a>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShow(false)}
            className="text-xs font-medium px-5 py-2 rounded-[40px] text-white transition-all"
            style={{ background: 'var(--c-btn-primary)' }}
          >Got it</button>
        </div>
      </div>
    </div>
  )
}
