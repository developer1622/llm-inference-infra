import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

// Table of Contents with updated page numbers
const toc = [
  ['3', 'multi', 'Part 0 · The GenAI ecosystem', 'The 8-layer stack, open vs closed, parameter economics'],
  ['5', 'multi', 'The map', 'Four stops from socket to silicon, plus a Rosetta table'],
  ['6', 'blue', 'Part 1 · Ingress & the Linux subsystem', 'epoll, read(), processes and the GIL'],
  ['7', 'red', 'Part 2 · Scheduler & memory', 'Continuous batching, PagedAttention, prefix cache'],
  ['9', 'yellow', 'Part 3 · PCIe, CUDA & GPUs', 'Prefill vs decode, NVLink, tensor parallelism'],
  ['11', 'green', 'Part 4 · Systems & observability', 'Queues, disaggregation, TTFT / TPOT, cheat sheet'],
  ['13', 'green', 'Hands-On Lab · Stage 1 Architecture', 'Go net/http client, wire dissection & chunking'],
  ['14', 'green', 'Hands-On Lab · Stage 1 Profiling', 'Live hardware benchmarks, TTFT & prefill/decode cliff'],
  ['15', 'multi', 'Appendix A · Foundational Models & Labs', 'Frontier AI labs, architectures, and serving parameters'],
  ['17', 'multi', 'Appendix B · 100 GenAI Inference Terms', 'Comprehensive 100-word glossary from socket to silicon'],
]

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export default function Author({ author }) {
  const topics = author.topics
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const tones = ['blue', 'red', 'yellow', 'green']
  const links = [
    ['Email', author.email],
    ['LinkedIn', author.linkedin],
    ['Medium', author.medium],
    ['Website', author.website],
    ['GitHub', author.github],
  ].filter(([, v]) => v)

  return (
    <Page tone="multi" running="About the author" part="Author">
      <div className="kicker">About the author</div>
      <h1 className="big">Hello, I&rsquo;m {author.name}.</h1>

      <div className="author-grid">
        <aside className="author-card">
          <div className="avatar">
            <span>{initials(author.name)}</span>
          </div>
          <div className="author-name">{author.name}</div>
          <div className="author-role">{author.role}</div>
          <div className="author-meta">
            {author.org && <div>{author.org}</div>}
            {author.location && <div>{author.location}</div>}
            {author.education && <div style={{ marginTop: '1.5mm', fontSize: '7.8pt', color: '#5f6368' }}>{author.education}</div>}
            {author.certification && <div style={{ fontSize: '7.8pt', color: '#137333', fontWeight: 600 }}>{author.certification}</div>}
          </div>
          <ul className="author-links">
            {links.map(([k, v], i) => {
              const href = k === 'Email' ? `mailto:${v}` : v.startsWith('http') ? v : `https://${v}`
              return (
                <li key={k}>
                  <i className={`d-${tones[i % 4]}`} />
                  <span>
                    <small>{k}</small>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1a73e8', textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {v}
                    </a>
                  </span>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="author-text">
          <Section title="Professional Background" color="blue">
            <p>{author.bio}</p>
          </Section>
          <Section title="Why I wrote this guide" color="red">
            <p>{author.why}</p>
          </Section>
          <Section title="Core Engineering Stack (from Production Experience)" color="yellow">
            <div className="chips">
              {topics.map((t, i) => (
                <span key={t} className={`chip tone-${tones[i % 4]}`}>
                  {t}
                </span>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <Section title="What&rsquo;s inside this guide" color="accent" className="mt-s">
        <ol className="toc">
          {toc.map(([page, tone, title, sub]) => (
            <li key={title} className={`tone-${tone}`}>
              <span className="toc-dot" />
              <span className="toc-text">
                <b>{title}</b>
                <small>{sub}</small>
              </span>
              <span className="toc-page">{page}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Callout title="Engineering Perspective" tone="green" className="mt-s">
        This field guide is grounded in real production engineering: no mystical AI jargon, just the concrete
        realities of Linux network sockets, memory paging, scheduler time-slices, and hardware bus saturation.
      </Callout>
    </Page>
  )
}
