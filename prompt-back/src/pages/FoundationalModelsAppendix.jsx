import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'
import { frontierLabs } from '../data/foundationalModels.js'

const commercialLabs = frontierLabs.slice(0, 4) // OpenAI, Google DeepMind, Anthropic, Meta
const openAndSpecializedLabs = frontierLabs.slice(4) // DeepSeek, Qwen, Mistral, Microsoft, Cohere, Ai2
const tones = ['blue', 'red', 'yellow', 'green']

function LabCard({ lab, tone = 'blue' }) {
  return (
    <div className={`card tone-${tone}`} style={{ padding: '1.6mm 2mm', fontSize: '7.1pt' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '1mm' }}>
        <div>
          <b style={{ fontSize: '8.2pt', color: '#202124' }}>{lab.lab}</b>
          <span style={{ fontSize: '6.6pt', color: '#5f6368', marginLeft: '1.5mm' }}>{lab.hq}</span>
        </div>
        <span style={{ fontSize: '6.6pt', fontStyle: 'italic', color: '#1a73e8' }}>{lab.focus}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8mm' }}>
        {lab.models.map((m) => (
          <div key={m.name} style={{ background: '#fff', borderRadius: '1.2mm', padding: '1mm 1.4mm', fontSize: '6.8pt', lineHeight: 1.25, border: '0.2mm solid #e8eaed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3mm' }}>
              <span style={{ fontWeight: 700, color: '#174ea6', fontSize: '7.2pt' }}>{m.name}</span>
              <span style={{ display: 'flex', gap: '1mm', alignItems: 'center' }}>
                <span className={`tag ${m.licType === 'open' ? 'tone-green' : m.licType === 'prop' ? 'tone-red' : 'tone-yellow'}`} style={{ fontSize: '5.6pt', padding: '0.2mm 1.2mm' }}>
                  {m.license}
                </span>
                <span style={{ fontFamily: 'var(--mono-font)', color: '#5f6368', fontSize: '6.2pt' }}>{m.context}</span>
              </span>
            </div>
            <div style={{ color: '#3c4043' }}>
              <b>Arch:</b> {m.arch} · <b>Scale:</b> {m.params}
            </div>
            <div style={{ color: '#5f6368', fontSize: '6.4pt', marginTop: '0.2mm' }}>
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
        <div className="kicker">Appendix A · Foundational AI R&amp;D Labs &amp; Architectures</div>
        <h1 className="big" style={{ fontSize: '16pt', marginBottom: '1mm' }}>Frontier AI R&amp;D Labs &amp; Foundation Models</h1>
        <p className="lead" style={{ fontSize: '8.2pt', marginBottom: '2.2mm', lineHeight: 1.34 }}>
          Rather than derivative fine-tunes, model serving engineering is driven by premier foundation R&amp;D
          laboratories that establish base architectures, attention mechanisms, and context scaling paradigms.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.2mm', marginBottom: '2.2mm' }}>
          {commercialLabs.map((l, i) => (
            <LabCard key={l.lab} lab={l} tone={tones[i % 4]} />
          ))}
        </div>

        <Callout title="Architectural Trend" tone="blue" style={{ marginTop: '1.5mm' }}>
          Frontier labs have bifurcated serving requirements: high-speed multi-modal models (GPT-4o, Gemini Flash) optimized
          for ultra-low TTFT, vs reasoning models (o1, Claude 3.7 Thinking) that generate hidden tokens to maximize factual correctness.
        </Callout>
      </Page>

      {/* Page 2: Open-Weights Frontiers & Global AI Labs */}
      <Page tone="multi" running="Appendix A · Foundational Open-Weights Labs (2/2)" part="Appendix A">
        <div className="kicker">Appendix A · Open-Weights &amp; Architectural Innovators</div>
        <h1 className="big" style={{ fontSize: '16pt', marginBottom: '1mm' }}>Open-Weights Foundations &amp; Research Labs</h1>
        <p className="lead" style={{ fontSize: '8.2pt', marginBottom: '2.2mm', lineHeight: 1.34 }}>
          Open foundation models provide full access to tensor weights, enabling self-hosted private serving on Kubernetes,
          vLLM, and Ollama with custom quantization (FP8, AWQ, GGUF) and multi-node tensor parallelism.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8mm', marginBottom: '1.8mm' }}>
          {openAndSpecializedLabs.map((l, i) => (
            <LabCard key={l.lab} lab={l} tone={tones[i % 4]} />
          ))}
        </div>

        <Callout title="Open Serving Advantage" tone="green" style={{ marginTop: '1.5mm' }}>
          Open-weights architectures like DeepSeek-V3 (MLA attention) and Qwen 2.5 enable enterprises to eliminate vendor lock-in,
          enforce strict data sovereignty, and run high-concurrency continuous batching on private infrastructure.
        </Callout>
      </Page>
    </>
  )
}
