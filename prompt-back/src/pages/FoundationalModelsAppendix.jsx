import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'
import { frontierLabs } from '../data/foundationalModels.js'

const commercialLabs = frontierLabs.slice(0, 4) // OpenAI, Google DeepMind, Anthropic, Meta
const openAndSpecializedLabs = frontierLabs.slice(4) // DeepSeek, Qwen, Mistral, Microsoft, Cohere, Ai2

function LabCard({ lab }) {
  return (
    <div className="lab-entry" style={{ background: '#fff', border: '0.25mm solid #dadce0', borderRadius: '1.8mm', padding: '1.8mm 2.2mm', fontSize: '7.2pt' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.8mm', marginBottom: '1.2mm' }}>
        <div>
          <b style={{ fontSize: '8.4pt', color: '#202124' }}>{lab.lab}</b>
          <span style={{ fontSize: '6.8pt', color: '#5f6368', marginLeft: '1.5mm' }}>{lab.hq}</span>
        </div>
        <span style={{ fontSize: '6.8pt', fontStyle: 'italic', color: '#1a73e8' }}>{lab.focus}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1mm' }}>
        {lab.models.map((m) => (
          <div key={m.name} style={{ background: '#f8f9fa', borderRadius: '1.2mm', padding: '1.2mm 1.6mm', fontSize: '6.9pt', lineHeight: 1.25 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4mm' }}>
              <span style={{ fontWeight: 700, color: '#174ea6', fontSize: '7.4pt' }}>{m.name}</span>
              <span style={{ display: 'flex', gap: '1mm', alignItems: 'center' }}>
                <span className={`tag ${m.licType === 'open' ? 'tone-green' : m.licType === 'prop' ? 'tone-red' : 'tone-yellow'}`} style={{ fontSize: '5.8pt', padding: '0.2mm 1.5mm' }}>
                  {m.license}
                </span>
                <span style={{ fontFamily: 'var(--mono-font)', color: '#5f6368', fontSize: '6.4pt' }}>{m.context}</span>
              </span>
            </div>
            <div style={{ color: '#3c4043' }}>
              <b>Arch:</b> {m.arch} · <b>Scale:</b> {m.params}
            </div>
            <div style={{ color: '#5f6368', fontSize: '6.5pt', marginTop: '0.3mm' }}>
              <b>Serving:</b> {m.serving}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FoundationalModelsAppendix() {
  return (
    <>
      {/* Page 1: Frontier Commercial R&D Labs & Flagship Foundation Models */}
      <Page tone="multi" running="Appendix A · Foundational Frontier Labs (1/2)" part="Appendix A">
        <div className="kicker">Appendix A · Foundational AI R&D Labs &amp; Architectures</div>
        <h1 className="big" style={{ fontSize: '17pt', marginBottom: '1.2mm' }}>Frontier AI R&amp;D Labs &amp; Foundation Models</h1>
        <p className="lead" style={{ fontSize: '8.4pt', marginBottom: '2.5mm', lineHeight: 1.35 }}>
          Rather than derivative fine-tunes, model serving engineering is driven by premier foundation R&amp;D
          laboratories that establish base architectures, attention mechanisms, and context scaling paradigms.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5mm', marginBottom: '2.5mm' }}>
          {commercialLabs.map((l) => (
            <LabCard key={l.lab} lab={l} />
          ))}
        </div>

        <Callout title="Architectural Trend" tone="blue" style={{ marginTop: '2mm' }}>
          Frontier labs have bifurcated serving requirements: high-speed multi-modal models (GPT-4o, Gemini Flash) optimized
          for ultra-low TTFT, vs reasoning models (o1, Claude 3.7 Thinking) that generate hidden tokens to maximize factual correctness.
        </Callout>
      </Page>

      {/* Page 2: Open-Weights Frontiers & Global AI Labs */}
      <Page tone="multi" running="Appendix A · Foundational Open-Weights Labs (2/2)" part="Appendix A">
        <div className="kicker">Appendix A · Open-Weights &amp; Architectural Innovators</div>
        <h1 className="big" style={{ fontSize: '17pt', marginBottom: '1.2mm' }}>Open-Weights Foundations &amp; Research Labs</h1>
        <p className="lead" style={{ fontSize: '8.4pt', marginBottom: '2.5mm', lineHeight: 1.35 }}>
          Open foundation models provide full access to tensor weights, enabling self-hosted private serving on Kubernetes,
          vLLM, and Ollama with custom quantization (FP8, AWQ, GGUF) and multi-node tensor parallelism.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '2mm' }}>
          {openAndSpecializedLabs.map((l) => (
            <LabCard key={l.lab} lab={l} />
          ))}
        </div>

        <Callout title="Open Serving Advantage" tone="green" style={{ marginTop: '2mm' }}>
          Open-weights architectures like DeepSeek-V3 (MLA attention) and Qwen 2.5 enable enterprises to eliminate vendor lock-in,
          enforce strict data sovereignty, and run high-concurrency continuous batching on private infrastructure.
        </Callout>
      </Page>
    </>
  )
}
