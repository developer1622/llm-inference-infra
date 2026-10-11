import React from 'react'
import { Page } from '../components/ui.jsx'
import { glossaryPages } from '../data/glossaryTerms.js'

export default function GlossaryAppendix() {
  return (
    <>
      {glossaryPages.map((gPage, pageIdx) => (
        <Page
          key={pageIdx}
          tone="multi"
          running={`Appendix B · 100 GenAI Inference Terms (${pageIdx + 1}/4)`}
          part="Appendix B"
        >
          <div className="app-intro" style={{ marginBottom: '2.5mm' }}>
            <div className="kicker">Appendix B · GenAI &amp; Inference Engineering Glossary</div>
            <h1 className="big" style={{ fontSize: '17pt', marginBottom: '1mm' }}>
              100 Essential Terms: From Socket to Silicon
            </h1>
            <p className="fine left" style={{ margin: 0, fontSize: '8pt', color: '#5f6368' }}>
              <b>{gPage.pageTitle}</b> · Terms #{gPage.terms[0].id} to #{gPage.terms[gPage.terms.length - 1].id} of 100.
              Essential terminology for systems, infrastructure, and platform engineers operating modern model serving runtimes.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.6mm 3.5mm',
            }}
          >
            {gPage.terms.map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#fff',
                  border: '0.25mm solid #dadce0',
                  borderRadius: '1.8mm',
                  padding: '1.6mm 2.2mm',
                  fontSize: '7.4pt',
                  lineHeight: '1.34',
                  breakInside: 'avoid',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', marginBottom: '0.6mm' }}>
                  <span
                    style={{
                      display: 'inline-grid',
                      placeItems: 'center',
                      width: '4.2mm',
                      height: '4.2mm',
                      borderRadius: '50%',
                      background: '#1a73e8',
                      color: '#fff',
                      fontSize: '6.4pt',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {t.id}
                  </span>
                  <b style={{ color: '#202124', fontSize: '8pt' }}>{t.term}</b>
                </div>
                <div style={{ color: '#3c4043', paddingLeft: '5.7mm' }}>{t.def}</div>
              </div>
            ))}
          </div>
        </Page>
      ))}
    </>
  )
}
