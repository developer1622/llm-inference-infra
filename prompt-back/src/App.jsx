import React, { useEffect, useState } from 'react'
import { defaultAuthor, authorFields } from './data/author.js'
import Cover from './pages/Cover.jsx'
import Author from './pages/Author.jsx'
import { Part0Ecosystem, Part0Zoo } from './pages/Part0.jsx'
import MapPage from './pages/MapPage.jsx'
import Part1 from './pages/Part1.jsx'
import { Part2Scheduler, Part2Memory } from './pages/Part2.jsx'
import { Part3Accelerator, Part3MultiGpu } from './pages/Part3.jsx'
import { Part4Truth, Part4Observability } from './pages/Part4.jsx'
import LabStage1Architecture from './pages/LabStage1Architecture.jsx'
import LabStage1Profiling from './pages/LabStage1Profiling.jsx'
import FoundationalModelsAppendix from './pages/FoundationalModelsAppendix.jsx'
import GlossaryAppendix from './pages/GlossaryAppendix.jsx'

const STORAGE_KEY = 'llm-guide-author-v2'

function loadAuthor() {
  try {
    return { ...defaultAuthor, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return defaultAuthor
  }
}

export default function App() {
  const [author, setAuthor] = useState(loadAuthor)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(author))
  }, [author])

  const printPdf = async () => {
    // make sure the bundled fonts are ready, otherwise the PDF can fall back to a system font
    if (document.fonts?.ready) await document.fonts.ready
    window.print()
  }

  return (
    <>
      <div className="toolbar no-print">
        <div className="toolbar-title">
          <span className="brand">
            <i className="d-blue" />
            <i className="d-red" />
            <i className="d-yellow" />
            <i className="d-green" />
          </span>
          LLM Inference Field Guide
          <small>A4 · print-ready</small>
        </div>
        <div className="toolbar-actions">
          <button className="btn ghost" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close author editor' : 'Edit author details'}
          </button>
          <button className="btn primary" onClick={printPdf}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <aside className={`drawer no-print ${open ? 'open' : ''}`}>
        <h2>Author details</h2>
        <p>These fill page 1 (name) and page 2 (about the author). Saved in this browser.</p>
        {authorFields.map(({ key, label, multiline }) => (
          <label key={key}>
            {label}
            {multiline ? (
              <textarea rows={4} value={author[key]} onChange={(e) => setAuthor({ ...author, [key]: e.target.value })} />
            ) : (
              <input value={author[key]} onChange={(e) => setAuthor({ ...author, [key]: e.target.value })} />
            )}
          </label>
        ))}
        <button className="btn ghost" onClick={() => setAuthor(defaultAuthor)}>
          Reset to defaults
        </button>
        <div className="hint">
          <b>Tip:</b> in the print dialog choose <b>Save as PDF</b>, paper <b>A4</b>, margins <b>None</b>, and turn on{' '}
          <b>Background graphics</b>.
        </div>
      </aside>

      <main className="doc">
        <Cover author={author} />
        <Author author={author} />
        <Part0Ecosystem />
        <Part0Zoo />
        <MapPage />
        <Part1 />
        <Part2Scheduler />
        <Part2Memory />
        <Part3Accelerator />
        <Part3MultiGpu />
        <Part4Truth />
        <Part4Observability />
        <LabStage1Architecture />
        <LabStage1Profiling />
        <FoundationalModelsAppendix />
        <GlossaryAppendix />
      </main>
    </>
  )
}
