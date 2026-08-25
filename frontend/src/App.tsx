import { useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import ResourceView from './components/ResourceView'
import TicketsView from './components/TicketsView'
import WhatsAppQueueView from './components/WhatsAppQueueView'
import type { Client } from './types'

const NAV: NavItem[] = [
  { key: 'tickets', label: 'Tickets' },
  { key: 'clients', label: 'Clients' },
  { key: 'whatsapp', label: 'WhatsApp Queue' },
]

export default function App() {
  const [active, setActive] = useState('tickets')

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          helpdesk<span className="text-txt2 font-normal">lite</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 2 &middot; Hybrid</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'tickets' && <TicketsView />}

          {active === 'clients' && (
            <ResourceView<Client>
              resource="clients"
              title="Clients"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
              ]}
              formFields={[
                { key: 'name', label: 'Name', required: true },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
              ]}
            />
          )}

          {active === 'whatsapp' && <WhatsAppQueueView />}
        </main>
      </div>
    </div>
  )
}
