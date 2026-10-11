import React from 'react'

// One physical A4 sheet. Content is laid out inside a fixed 210x297mm box, so a page
// can never spill onto the next one: sections are authored to fit exactly one sheet.
export function Page({ tone = 'multi', running = '', part = '', children, className = '' }) {
  return (
    <section className={`page tone-${tone} ${className}`}>
      <header className="page-head">
        <span className="brand">
          <i className="d-blue" />
          <i className="d-red" />
          <i className="d-yellow" />
          <i className="d-green" />
          <b>How a Prompt Becomes a Token</b>
        </span>
        <span className="running">{running}</span>
        {part && <span className="part-pill">{part}</span>}
      </header>
      <div className="page-body">{children}</div>
      <footer className="page-foot">
        <span>LLM Inference Field Guide</span>
        <span className="pgno" />
      </footer>
    </section>
  )
}

export function PartHero({ n, kicker, title, lead }) {
  return (
    <div className="hero">
      <div className="hero-badge">{n}</div>
      <div>
        <div className="kicker">{kicker}</div>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </div>
    </div>
  )
}

export function Callout({ title, children, tone }) {
  return (
    <div className={`callout ${tone ? `tone-${tone}` : ''}`}>
      {title && <b className="callout-title">{title}</b>}
      <div>{children}</div>
    </div>
  )
}

// Dark terminal block. Lines: "$ cmd" = command, "# text" = comment, anything else = output.
export function Term({ title = 'bash', code }) {
  return (
    <div className="term">
      <div className="term-bar">
        <i className="d-red" />
        <i className="d-yellow" />
        <i className="d-green" />
        <span>{title}</span>
      </div>
      <pre>{code
          .trim()
          .split('\n')
          .map((l, i) => {
            if (l.startsWith('$ '))
              return (
                <div key={i}>
                  <span className="t-prompt">$</span> {l.slice(2)}
                </div>
              )
            if (l.startsWith('# '))
              return (
                <div key={i} className="t-comment">
                  {l}
                </div>
              )
            return <div key={i}>{l || '\u00A0'}</div>
          })}</pre>
    </div>
  )
}

export function Section({ title, color = 'accent', children, className = '' }) {
  return (
    <div className={`sec ${className}`}>
      <h3 className={`sec-title c-${color}`}>
        <span className="sec-dot" />
        {title}
      </h3>
      {children}
    </div>
  )
}

export function Mono({ children }) {
  return <code>{children}</code>
}

export function DownArrow({ label }) {
  return (
    <div className="down-arrow">
      <span />
      {label && <em>{label}</em>}
    </div>
  )
}
