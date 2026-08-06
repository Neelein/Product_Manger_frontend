import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCalendarEvents } from '../hooks/useCalendar'
import type { CalendarDisplayEvent } from '../types'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'] as const

const TYPE_STYLES: Record<CalendarDisplayEvent['type'], { bg: string; text: string; border: string }> = {
  event: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  announcement: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  chat: { bg: '#fed7aa', text: '#9a3412', border: '#f97316' },
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isSameDay(d1: Date, y: number, m: number, d: number): boolean {
  return d1.getFullYear() === y && d1.getMonth() + 1 === m && d1.getDate() === d
}

function getEventsForDay(events: CalendarDisplayEvent[], year: number, month: number, day: number) {
  const dateStr = formatDate(year, month, day)
  return events.filter(e => {
    const start = e.start_time.slice(0, 10)
    const end = e.end_time.slice(0, 10)
    return dateStr >= start && dateStr <= end
  })
}

function hasEventOnDay(events: CalendarDisplayEvent[], id: string, year: number, month: number, day: number) {
  const ds = formatDate(year, month, day)
  return events.some(e => e.id === id && ds >= e.start_time.slice(0, 10) && ds <= e.end_time.slice(0, 10))
}

export function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const navigate = useNavigate()
  const { member } = useAuth()
  const { displayEvents, loading, error, refetch } = useCalendarEvents(year, month)

  const goToPrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else { setMonth(m => m - 1) }
  }

  const goToNextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else { setMonth(m => m + 1) }
  }

  const goToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const firstDayIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const calendarDays = useMemo(() => {
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDayIndex; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [firstDayIndex, daysInMonth])

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarDisplayEvent[]> = {}
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = getEventsForDay(displayEvents, year, month, d)
    }
    return map
  }, [displayEvents, year, month, daysInMonth])

  const MAX_BARS = 4

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="page-header">
          <h1>日曆</h1>
        </div>
        <div className="page-loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calendar-page">
        <div className="page-header">
          <h1>日曆</h1>
        </div>
        <div className="error-banner">{error}</div>
      </div>
    )
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={goToPrevMonth}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '16px', lineHeight: 1 }}
          >
            ◀
          </button>
          <h1 style={{ fontSize: '22px', whiteSpace: 'nowrap', margin: 0 }}>
            {year} 年 {month} 月
          </h1>
          <button
            onClick={goToNextMonth}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '16px', lineHeight: 1 }}
          >
            ▶
          </button>
          <button onClick={goToToday} className="btn-secondary" style={{ marginLeft: '4px' }}>
            今天
          </button>
        </div>
        <div className="header-actions">
          <button onClick={refetch} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            重新整理
          </button>
          {member && (
            <button
              onClick={() => navigate(`/calendar/new?date=${formatDate(year, month, 1)}`)}
              className="btn-primary"
            >
              + 新增事件
            </button>
          )}
        </div>
      </div>

      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          background: '#fff',
        }}
      >
        {WEEKDAYS.map(d => (
          <div
            key={d}
            style={{
              padding: '10px 8px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '13px',
              color: '#64748b',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            {d}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} style={{ minHeight: '100px', background: '#fcfcfc' }} />
          }

          const events = eventsByDay[day] ?? []
          const visible = events.slice(0, MAX_BARS)
          const extra = events.length - MAX_BARS
          const isToday = isSameDay(today, year, month, day)
          const dateStr = formatDate(year, month, day)

          return (
            <div
              key={day}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.calendar-event-bar')) return
                navigate(`/calendar/new?date=${dateStr}`)
              }}
              style={{
                minHeight: '100px',
                padding: '6px',
                borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #e2e8f0',
                borderBottom: calendarDays.length - i <= 7 ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer',
                background: isToday ? '#eff6ff' : '#fff',
                position: 'relative',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isToday) (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                if (!isToday) (e.currentTarget as HTMLDivElement).style.background = '#fff'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: isToday ? 700 : 500,
                  marginBottom: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: isToday ? '#3b82f6' : 'transparent',
                  color: isToday ? '#fff' : undefined,
                }}
              >
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {visible.map(ev => {
                  const style = TYPE_STYLES[ev.type]
                  const hasPrev = day > 1 && hasEventOnDay(displayEvents, ev.id, year, month, day - 1)
                  const hasNext = day < daysInMonth && hasEventOnDay(displayEvents, ev.id, year, month, day + 1)
                  const br = !hasPrev && !hasNext ? '4px'
                    : hasPrev && hasNext ? '0'
                    : hasPrev ? '0 0 4px 4px'
                    : '4px 4px 0 0'
                  return (
                    <div
                      key={ev.id}
                      className="calendar-event-bar"
                      data-has-next={hasNext || undefined}
                      data-has-prev={hasPrev || undefined}
                      onClick={(e) => {
                        e.stopPropagation()
                        const path = ev.type === 'event' ? '/calendar' : ev.type === 'announcement' ? '/announcements' : '/chat/rooms'
                        navigate(`${path}/${ev.sourceId}`)
                      }}
                      style={{
                        fontSize: '11px',
                        lineHeight: '1.3',
                        padding: hasPrev ? '2px 4px 2px 3px' : '2px 4px 2px 6px',
                        borderRadius: br,
                        background: style.bg,
                        color: style.text,
                        borderLeft: !hasPrev ? style.border : 'transparent',
                        borderLeftWidth: !hasPrev ? '3px' : '0',
                        borderLeftStyle: !hasPrev ? 'solid' : 'none',
                        overflow: hasPrev || hasNext ? 'visible' : 'hidden',
                        textOverflow: hasPrev || hasNext ? 'clip' : 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        '--connector-bg': style.bg,
                      } as React.CSSProperties}
                    >
                      {ev.title}
                    </div>
                  )
                })}
                {extra > 0 && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      padding: '2px 4px',
                    }}
                  >
                    +{extra} 更多...
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
