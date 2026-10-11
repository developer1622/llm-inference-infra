import React from 'react'

const parts = [
  ['0', 'GenAI ecosystem', 'multi'],
  ['1', 'Ingress & OS boundary', 'blue'],
  ['2', 'Scheduler & memory', 'red'],
  ['3', 'PCIe, CUDA & GPUs', 'yellow'],
  ['4', 'Systems truth', 'green'],
  ['★', 'Hands-on lab', 'green'],
  ['A', 'Foundational labs', 'multi'],
  ['B', '100-term glossary', 'multi'],
]

export default function Cover({ author }) {
  const edition = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return (
    <section className="page cover">
      {/* decorative geometry, pure CSS, Google palette */}
      <div className="cv-shape cv-blue" />
      <div className="cv-shape cv-red" />
      <div className="cv-shape cv-yellow" />
      <div className="cv-shape cv-green" />
      <div className="cv-shape cv-ring" />

      <div className="cv-top">
        <span className="brand">
          <i className="d-blue" />
          <i className="d-red" />
          <i className="d-yellow" />
          <i className="d-green" />
          <b>Field Guide</b>
        </span>
        <span className="cv-edition">{edition} edition &middot; A4</span>
      </div>

      <div className="cv-main">
        <div className="cv-eyebrow">LLM inference for Linux &amp; infra engineers</div>
        <h1 className="cv-title">
          <span className="c-blue">How a</span>
          <br />
          <span className="c-red">Prompt</span> <span className="c-yellow">Becomes</span>
          <br />
          <span className="c-green">a Token</span>
        </h1>
        <p className="cv-sub">
          The life of an LLM request, from a <code>read()</code> on a socket to a GPU kernel and back, explained with the
          Linux and distributed-systems ideas you already know.
        </p>

        <ul className="cv-parts">
          {parts.map(([n, t, tone]) => (
            <li key={n} className={`tone-${tone}`}>
              <b>{n}</b>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="cv-bottom">
        <div>
          <div className="cv-by">Written by</div>
          <div className="cv-author">{author.name}</div>
          <div className="cv-role">{author.role}</div>
          <div style={{ fontSize: '7.5pt', color: '#5f6368', marginTop: '1.5mm', fontFamily: 'var(--mono-font)' }}>
            github.com/developer1622/llm-inference-infra
          </div>
        </div>
        <div className="cv-stripe">
          <i className="d-blue" />
          <i className="d-red" />
          <i className="d-yellow" />
          <i className="d-green" />
        </div>
      </div>
    </section>
  )
}
