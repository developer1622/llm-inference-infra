import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'
import { frontierLabs } from '../data/foundationalModels.js'

const commercialLabs = frontierLabs.slice(0, 4) // OpenAI, Google DeepMind, Anthropic, Meta
const openAndSpecializedLabs = frontierLabs.slice(4) // DeepSeek, Qwen, Mistral, Microsoft, Cohere, Ai2

function LabCard({ lab }) {
  return (
    <div className="lab-entry" style={{ marginBottom: '3.5mm', background: '#fff', border: '0.3mm solid #dadce0', borderRadius: '2.5mm', padding: '2.8mm 3.2mm' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.25mm solid #e8eaed', paddingBottom: '1.2mm', marginBottom: '1.6mm' }}>
        <div>
          <b style={{ fontSize: '9.6pt', color: '#202124' }}>{lab.lab}</b>
          <span style={{ fontSize: '7.4pt', color: '#5f6368', marginLeft: '2mm' }}>{lab.hq}</span>
        </div>
        <span style={{ fontSize: '7.2pt', fontStyle: 'italic', color: '#1a73e8' }}>{lab.focus}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8mm' }}>
        {lab.models.map((m) => (
          <div key={m.name} style={{ background: '#f8f9fa', borderRadius: '1.8mm', padding: '1.8mm 2.4mm', fontSize: '7.6pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8mm' }}>
              <span style={{ fontWeight: 700, color: '#174ea6', fontSize: '8.2pt' }}>{m.name}</span>
              <span style={{ display: 'flex', gap: '1.6mm', alignItems: 'center' }}>
                <span className={`tag ${m.licType === 'open' ? 'tone-green' : m.licType === 'prop' ? 'tone-red' : 'tone-yellow'}`} style={{ fontSize: '6.2pt' }}>
                  {m.license}
                </span>
                <span style={{ fontFamily: 'var(--mono-font)', color: '#5f6368', fontSize: '7pt' }}>{m.context}</span>
              </span>
            </div>
            <div style={{ color: '#3c4043', lineHeight: 1.35 }}>
              <b>Arch:</b> {m.arch} · <b>Scale:</b> {m.params}
            </div>
            <div style={{ color: '#5f6368', fontSize: '7.1pt', marginTop: '0.5mm', lineHeight: 1.3 }}>
              <b>Serving Notes:</b> {m.serving}
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
        <h1 className="big" style={{ fontSize: '18pt', marginBottom: '1.5mm' }}>Frontier AI R&amp;D Labs &amp; Foundation Models</h1>
        <p className="lead" style={{ fontSize: '8.8pt', marginBottom: '3.5mm' }}>
          Rather than derivative fine-tunes, model serving engineering is driven by the world&rsquo;s premier foundation R&amp;D
          laboratories that establish base architectures, attention mechanisms, and context scaling paradigms.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
        <h1 className="big" style={{ fontSize: '18pt', marginBottom: '1.5mm' }}>Open-Weights Foundations &amp; Research Labs</h1>
        <p className="lead" style={{ fontSize: '8.8pt', marginBottom: '3.5mm' }}>
          Open foundation models provide full access to tensor weights, enabling self-hosted private serving on Kubernetes,
          vLLM, and Ollama with custom quantization (FP8, AWQ, GGUF) and multi-node tensor parallelism.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
