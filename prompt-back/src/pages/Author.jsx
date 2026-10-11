import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

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
    ['O11y blog', author.blog],
    ['Website', author.website],
    ['GitHub', author.github],
  ].filter(([, v]) => v)

  return (
    <Page tone="multi" running="About the author &amp; Legal Notice" part="Author">
      <div className="kicker">About the author &amp; Independent Research Notice</div>
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
            {author.education && <div style={{ marginTop: '1.2mm', fontSize: '7.5pt', color: '#5f6368' }}>{author.education}</div>}
            {author.certification && <div style={{ fontSize: '7.5pt', color: '#137333', fontWeight: 600 }}>{author.certification}</div>}
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
            <p style={{ fontSize: '7.6pt', lineHeight: 1.35 }}>{author.bio}</p>
          </Section>
          <Section title="Why I wrote this guide" color="red">
            <p style={{ fontSize: '7.6pt', lineHeight: 1.35 }}>{author.why}</p>
          </Section>
          <Section title="Core Engineering Stack (Production Experience)" color="yellow">
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

      <div className="grid4 mt-s" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.8mm' }}>
        <div className="card tone-blue" style={{ padding: '1.8mm 2mm', fontSize: '7.2pt' }}>
          <b style={{ color: '#1a73e8', display: 'block', marginBottom: '0.6mm' }}>1. Foundations</b>
          <p style={{ margin: 0, fontSize: '6.8pt', lineHeight: 1.25 }}>8-layer stack, parameter math, token economics.</p>
        </div>
        <div className="card tone-red" style={{ padding: '1.8mm 2mm', fontSize: '7.2pt' }}>
          <b style={{ color: '#d93025', display: 'block', marginBottom: '0.6mm' }}>2. Mechanics</b>
          <p style={{ margin: 0, fontSize: '6.8pt', lineHeight: 1.25 }}>Continuous batching, PagedAttention, AVX2 SIMD.</p>
        </div>
        <div className="card tone-yellow" style={{ padding: '1.8mm 2mm', fontSize: '7.2pt' }}>
          <b style={{ color: '#b06000', display: 'block', marginBottom: '0.6mm' }}>3. The 3 Labs</b>
          <p style={{ margin: 0, fontSize: '6.8pt', lineHeight: 1.25 }}>Ollama Go client, LiteLLM gateway, KServe on KinD.</p>
        </div>
        <div className="card tone-green" style={{ padding: '1.8mm 2mm', fontSize: '7.2pt' }}>
          <b style={{ color: '#188038', display: 'block', marginBottom: '0.6mm' }}>4. SRE &amp; Signals</b>
          <p style={{ margin: 0, fontSize: '6.8pt', lineHeight: 1.25 }}>TTFT, eBPF tracing, Prometheus metrics &amp; runbooks.</p>
        </div>
      </div>

      {/* Comprehensive Legal Disclaimer & Non-Affiliation Statement */}
      <div className="card tone-yellow" style={{ padding: '2mm 2.8mm', marginTop: '2.5mm', fontSize: '6.3pt', lineHeight: '1.34' }}>
        <b style={{ color: '#b06000', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6mm' }}>
          Legal Disclaimer &amp; Strict Non-Affiliation Statement
        </b>
        <p style={{ margin: 0, color: '#3c4043' }}>
          <b>Independent Personal Research:</b> This document, the accompanying code repository, architectural designs, and benchmarks are authored strictly in the author&rsquo;s individual, personal capacity for educational and research exploration.
          {' '}<b>Strict Non-Affiliation:</b> The views, configurations, and technical opinions expressed herein belong solely to the author and do NOT represent, reflect, or bind the views, positions, strategies, or policies of the author&rsquo;s current employer (UBS), former employers (including OpsRamp, Hewlett Packard Enterprise, NCR Voyix, TCS, or any prior organizations), future employers, affiliated academic institutions (including RGUKT IIIT Basar, past, present, or future universities), clients, contractors, or partners.
          {' '}<b>No Warranty &amp; Limitation of Liability:</b> All materials, configuration files, and code snippets are provided strictly on an &ldquo;AS-IS&rdquo; basis without warranties of any kind, express or implied. Under no circumstances shall the author, current/past/future employers, academic institutions, or associated entities be held liable for any damages, production downtime, security incidents, or financial losses arising from the use or implementation of these materials.
          {' '}<b>Testing Mandate:</b> This is an educational research artifact. Do NOT deploy these configurations into production, banking, or mission-critical environments without independent verification, comprehensive security audits, and exhaustive validation in isolated lower/sandbox environments.
        </p>
      </div>
    </Page>
  )
}
