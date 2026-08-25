import { useEffect, useState } from 'react'
import { listResource, patchResource } from '../api'
import type { WhatsAppNotification } from '../types'

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[\s\-().]/g, '')}`
}

export default function WhatsAppQueueView() {
  const [rows, setRows] = useState<WhatsAppNotification[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    listResource<WhatsAppNotification>('whatsapp-notifications')
      .then(r => setRows(r.data))
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
  }

  useEffect(() => { load() }, [])

  const markSent = async (id: number) => {
    await patchResource('whatsapp-notifications', id, { status: 'SENT' })
    load()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">WhatsApp Queue</h1>
        <p className="text-xs text-txt2 mt-1">Open each link, send manually, then mark it sent — no send-from-here integration exists.</p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <div className="text-txt2 text-sm text-center py-6 border border-border rounded bg-surface">Queue is empty.</div>
        ) : rows.map(n => (
          <div key={n.id} className="p-3 rounded border border-border bg-surface flex items-center justify-between">
            <div>
              <div className="text-sm text-txt">{n.message}</div>
              <div className="text-[11px] text-txt2 mt-0.5">{n.phone} &middot; {n.status}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-3">
              <a href={waLink(n.phone)} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Open WhatsApp →</a>
              {n.status === 'PENDING' && (
                <button onClick={() => void markSent(n.id)} className="text-xs text-ok hover:underline">Mark Sent</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
