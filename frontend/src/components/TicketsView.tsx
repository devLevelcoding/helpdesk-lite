import { useEffect, useState, type FormEvent } from 'react'
import { createResource, listResource, patchResource } from '../api'
import type { Client, Ticket } from '../types'

const STATUS_COLOR: Record<string, string> = {
  open: 'text-accent',
  in_progress: 'text-accent',
  closed: 'text-ok',
}

export default function TicketsView() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [values, setValues] = useState({ clientId: '', title: '', body: '' })
  const [error, setError] = useState<string | null>(null)
  const [responseDrafts, setResponseDrafts] = useState<Record<number, string>>({})

  const load = () => {
    listResource<Ticket>('tickets').then(r => setTickets(r.data)).catch(e => setError(e instanceof Error ? e.message : String(e)))
    listResource<Client>('clients').then(r => setClients(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createResource('tickets', { clientId: Number(values.clientId), title: values.title, body: values.body })
      setValues({ clientId: '', title: '', body: '' })
      setFormOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const respond = async (id: number) => {
    const response = responseDrafts[id]
    if (!response) return
    await patchResource('tickets', id, { status: 'in_progress', response })
    setResponseDrafts(d => ({ ...d, [id]: '' }))
    load()
  }

  const close = async (id: number) => {
    await patchResource('tickets', id, { status: 'closed' })
    load()
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-txt">Tickets</h1>
          <p className="text-xs text-txt2 mt-1">Closing a ticket queues a WhatsApp notification to the client automatically.</p>
        </div>
        <button onClick={() => setFormOpen(f => !f)} className="px-3 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">
          {formOpen ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      {formOpen && (
        <form onSubmit={submit} className="mb-6 p-4 rounded border border-border bg-surface slide-up flex flex-col gap-3">
          <select required value={values.clientId} onChange={e => setValues(v => ({ ...v, clientId: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm">
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required placeholder="Title" value={values.title} onChange={e => setValues(v => ({ ...v, title: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <textarea placeholder="Details" rows={3} value={values.body} onChange={e => setValues(v => ({ ...v, body: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <button type="submit" className="self-end px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">Save</button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {tickets.length === 0 ? (
          <div className="text-txt2 text-sm text-center py-6 border border-border rounded bg-surface">Nothing here yet.</div>
        ) : tickets.map(t => (
          <div key={t.id} className="p-3 rounded border border-border bg-surface">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-txt font-medium">{t.title}</span>
              <span className={`text-xs font-medium ${STATUS_COLOR[t.status] ?? 'text-txt2'}`}>{t.status}</span>
            </div>
            <div className="text-xs text-txt2 mb-1">{t.client?.name ?? `Client #${t.clientId}`}</div>
            <p className="text-xs text-txt mb-2">{t.body}</p>
            {t.response && <p className="text-xs text-txt2 mb-2 italic">Response: {t.response}</p>}
            {t.status !== 'closed' && (
              <div className="flex gap-2">
                <input
                  placeholder="Write a response…"
                  value={responseDrafts[t.id] ?? ''}
                  onChange={e => setResponseDrafts(d => ({ ...d, [t.id]: e.target.value }))}
                  className="flex-1 px-2 py-1 rounded bg-surface2 border border-border text-txt text-xs"
                />
                <button onClick={() => void respond(t.id)} className="text-xs text-accent hover:underline">Respond</button>
                <button onClick={() => void close(t.id)} className="text-xs text-ok hover:underline">Close</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
