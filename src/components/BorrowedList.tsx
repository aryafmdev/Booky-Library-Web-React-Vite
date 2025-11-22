import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Loan, Review } from '../lib/api'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Icon } from '@iconify/react'

type Props = {
  items: Loan[]
  title?: string
  showBorrowerName?: boolean
  borrowerName?: string
  onReturn?: (loanId: number) => void
  variant?: 'admin' | 'profile'
  reviews?: Review[]
  onGiveReview?: (bookId: number) => void
}

export default function BorrowedList({ items, title = 'Borrowed List', showBorrowerName = false, borrowerName = 'John Doe', onReturn, variant = 'profile', reviews, onGiveReview }: Props) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'All' | 'Active' | 'Returned' | 'Overdue'>('All')
  const isAdmin = variant === 'admin'

  const computed = useMemo(() => {
    return (items ?? []).map((l) => {
      const isOverdue = l.due_at ? dayjs(l.due_at).isBefore(dayjs(), 'day') : false
      const s = l.status === 'Returned' ? 'Returned' : l.status === 'Overdue' ? 'Overdue' : isOverdue ? 'Overdue' : 'Active'
      return { ...l, status: s } as Loan & { status: string }
    })
  }, [items])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return computed.filter((l) => {
      const byStatus = status === 'All' ? true : l.status === status
      const bySearch = !qq || l.book.title.toLowerCase().includes(qq) || l.book.author.name.toLowerCase().includes(qq)
      return byStatus && bySearch
    })
  }, [computed, q, status])

  return (
    <section className='mt-3xl'>
      <h2 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>{title}</h2>
      {isAdmin ? (
        <div className='mt-md relative md:w-1/2'>
          <Icon icon='lucide:search' className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <Input placeholder='Search' value={q} onChange={(e) => setQ(e.target.value)} className='rounded-full pl-10 w-full border-gray-300' />
        </div>
      ) : (
        <div className='w-full'>
          <Input placeholder='Search book' className='w-full' value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}
      <div className='mt-lg flex items-center gap-sm'>
        {(['All', 'Active', 'Returned', 'Overdue'] as const).map((s) => {
          const isSelected = status === s
          const classes = isAdmin
            ? s === 'Overdue'
              ? isSelected
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-white text-red-700 border border-red-200'
              : isSelected
              ? 'bg-white text-primary-300 border border-primary-300'
              : 'bg-white text-neutral-900 border border-neutral-300'
            : (isSelected ? 'bg-primary-100 border-primary-300 text-primary-300' : 'bg-white border-neutral-200 text-neutral-950')
          return (
            <button key={s} onClick={() => setStatus(s)} className={`px-md py-xxs rounded-full border text-sm font-semibold ${classes}`} aria-pressed={isSelected}>
              {s}
            </button>
          )
        })}
      </div>
      <div className='mt-lg space-y-md'>
        {filtered.map((l) => {
          const dueLabel = l.due_at ? dayjs(l.due_at).format('DD MMMM YYYY') : ''
          const borrowedLabel = l.borrowed_at ? dayjs(l.borrowed_at).format('DD MMM YYYY') : ''
          const durationDays = l.borrowed_at && l.due_at ? dayjs(l.due_at).diff(dayjs(l.borrowed_at), 'day') : undefined
          const durationText = typeof durationDays === 'number' ? `Duration ${durationDays} Days` : ''
          if (isAdmin) {
            const statusClass = l.status === 'Active' ? 'inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-green-50 text-green-700 border-green-200' : l.status === 'Returned' ? 'inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-neutral-100 text-neutral-700 border-neutral-200' : 'inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-red-50 text-red-700 border-red-200'
            return (
              <Card key={l.id} className='p-md border-neutral-200 bg-white'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-neutral-900 font-semibold flex items-center gap-xxs'>
                    <span>Status</span>
                    <span className={statusClass}>{l.status}</span>
                  </div>
                  {dueLabel && (
                    <div className='flex items-center gap-xxs'>
                      <span className='text-sm font-bold text-neutral-900'>Due Date</span>
                      <span className='inline-flex leading-tight px-sm py-xxs rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-bold'>
                        {dueLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className='my-sm h-px bg-neutral-200' />
                <div className='grid grid-cols-[1fr_auto] gap-md items-start'>
                  <div className='flex items-start gap-md'>
                    <img src={l.book.cover_image} alt={l.book.title} className='w-20 h-28 rounded-md object-cover' />
                    <div className='flex-1'>
                      <div className='flex items-center gap-xxs'>
                        <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                          {l.book.category?.name || '—'}
                        </span>
                      </div>
                      <div className='mt-xxs text-neutral-950 font-bold text-md'>{l.book.title}</div>
                      <div className='text-xs text-neutral-700'>{l.book.author.name}</div>
                      <div className='mt-xxs text-xs text-neutral-700'>
                        {borrowedLabel || '-'}
                        {durationText ? ` · ${durationText}` : ''}
                      </div>
                    </div>
                  </div>
                  {showBorrowerName && (
                    <div className='text-right'>
                      <div className='text-xs text-neutral-700'>borrower’s name</div>
                      <div className='text-md font-bold text-neutral-950'>{borrowerName}</div>
                    </div>
                  )}
                </div>
                <div className='mt-md flex gap-sm justify-end'>
                  {onReturn && (l.status === 'Active' || l.status === 'Overdue') && (
                    <Button className='rounded-full bg-primary-300 text-white font-bold hover:bg-primary-400' onClick={() => onReturn(l.id)}>Return Book</Button>
                  )}
                  {onGiveReview && (
                    <Button className='rounded-full bg-primary-300 text-white font-bold leading-tight hover:bg-primary-400' onClick={() => onGiveReview(l.book.id)}>
                      {Array.isArray(reviews) && reviews.some((r) => r.book.id === l.book.id) ? 'Edit Review' : 'Give Review'}
                    </Button>
                  )}
                </div>
              </Card>
            )
          } else {
            const statusClass = l.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : l.status === 'Returned' ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : 'bg-red-100 text-red-700 border-red-200'
            return (
              <Card key={l.id} className='p-md bg-white border-neutral-200'>
                <div className='flex items-start gap-md'>
                  <img src={l.book.cover_image} alt={l.book.title} className='w-20 h-28 rounded-md object-cover' />
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <span className={`inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold ${statusClass}`}>Status {l.status}</span>
                      <span className='inline-flex leading-tight py-xxs rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-semibold'>
                        Due Date <span className='ml-xxs font-bold'>{dueLabel || '-'}</span>
                      </span>
                    </div>
                    <div className='mt-sm flex items-start gap-md'>
                      <div className='flex-1'>
                        <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                          {l.book.category?.name || '—'}
                        </span>
                        <div className='mt-xxs text-neutral-950 font-bold text-md'>{l.book.title}</div>
                        <div className='text-xs text-neutral-700'>{l.book.author.name}</div>
                        <div className='mt-xxs text-xs text-neutral-700'>
                          {borrowedLabel || '-'}
                          {durationText ? ` · Duration ${durationText.replace('Duration ', '')}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className='mt-md flex gap-sm justify-end'>
                      {onReturn && (l.status === 'Active' || l.status === 'Overdue' || !l.status) && (
                        <Button variant='outline' className='rounded-full leading-tight text-neutral-950' onClick={() => onReturn(l.id)}>Return Book</Button>
                      )}
                      {onGiveReview && (
                        <Button className='rounded-full bg-primary-300 text-white font-bold leading-tight hover:bg-primary-400' onClick={() => onGiveReview(l.book.id)}>
                          {Array.isArray(reviews) && reviews.some((r) => r.book.id === l.book.id) ? 'Edit Review' : 'Give Review'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          }
        })}
        {filtered.length === 0 && <div className='text-sm text-neutral-700'>No overdue loans.</div>}
      </div>
    </section>
  )
}