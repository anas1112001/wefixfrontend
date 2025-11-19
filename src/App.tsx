import { FC } from 'react'

import 'styles/App.css'

const tickets = [
  {
    branch: 'Branch D',
    company: 'Premier Industries',
    date: '11/19/2025',
    id: 'TKT000088',
    status: 'Completed',
    technician: 'Mohammed Hassan',
    type: 'Preventive',
    zone: 'Zone 6',
  },
  {
    branch: 'Branch D',
    company: 'TechCorp Solutions',
    date: '11/19/2025',
    id: 'TKT000028',
    status: 'Pending',
    technician: 'Khalid Ibrahim',
    type: 'Emergency',
    zone: 'Zone 4',
  },
  {
    branch: 'Branch E',
    company: 'Digital Solutions',
    date: '11/19/2025',
    id: 'TKT000069',
    status: 'In Progress',
    technician: 'Mohammed Hassan',
    type: 'Preventive',
    zone: 'Zone 1',
  },
]

const navItems = ['Dashboard', 'Calendar', 'Tickets', 'Customers', 'Contracts', 'Roles']
const viewModes = ['Month', 'Week', 'Day', 'List']

const App: FC = () => (
  <div className="dashboard">
    <aside className="sidebar">
      <div className="logo">WeFix</div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li className={item === 'Tickets' ? 'active' : ''} key={item}>
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </aside>

    <main className="content">
      <header className="content-header">
        <div>
          <h1>Tickets</h1>
          <p className="subtitle">Keep track of every job and technician in one place.</p>
        </div>
        <button className="primary-button">+ Create New Ticket</button>
      </header>

      <section className="filters-card">
        <div className="calendar-controls">
          <button aria-label="previous day" className="icon-btn">
            ‹
          </button>
          <button className="pill active">Today</button>
          <button aria-label="next day" className="icon-btn">
            ›
          </button>
        </div>
        <div className="view-mode">
          {viewModes.map((mode) => (
            <button className={`pill ${mode === 'Month' ? 'active' : ''}`} key={mode}>
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="tickets-card">
        <header className="tickets-toolbar">
          <input placeholder="Search tickets..." type="search" />
          <select>
            <option>Newest First</option>
          </select>
          <select>
            <option>All Status</option>
          </select>
          <select>
            <option>All Types</option>
          </select>
          <span className="ticket-count">100 tickets found</span>
        </header>

        <div className="tickets-list">
          {tickets.map((ticket) => (
            <article className="ticket-card" key={ticket.id}>
              <div className="ticket-card-header">
                <div>
                  <h2>{ticket.id}</h2>
                  <ul className="ticket-meta">
                    <li>
                      <span>Company</span>
                      <strong>{ticket.company}</strong>
                    </li>
                    <li>
                      <span>Type</span>
                      <strong>{ticket.type}</strong>
                    </li>
                    <li>
                      <span>Branch</span>
                      <strong>{ticket.branch}</strong>
                    </li>
                    <li>
                      <span>Zone</span>
                      <strong>{ticket.zone}</strong>
                    </li>
                    <li>
                      <span>Technician</span>
                      <strong>{ticket.technician}</strong>
                    </li>
                    <li>
                      <span>Date</span>
                      <strong>{ticket.date}</strong>
                    </li>
                  </ul>
                </div>
                <span className={`status ${ticket.status.replace(' ', '-').toLowerCase()}`}>{ticket.status}</span>
              </div>

              <div className="ticket-actions">
                <div className="primary-actions">
                  <button>Time Line</button>
                  <button>Update By Technician</button>
                  <button>Additional Work</button>
                </div>
                <div className="secondary-actions">
                  <button>Edit</button>
                  <button>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  </div>
)

export default App
