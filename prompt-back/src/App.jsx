import React, { useEffect, useState } from 'react'
import { defaultAuthor, authorFields } from './data/author.js'
import Cover from './pages/Cover.jsx'
import Author from './pages/Author.jsx'
import LabSystemSpecsPage from './pages/LabSystemSpecsPage.jsx'
import TOCPage from './pages/TOCPage.jsx'

// Part 0 (6 pages)
import {
  Part0Page1,
  Part0Page2,
  Part0Page3,
  Part0Page4,
  Part0Page5,
  Part0Page6,
} from './pages/Part0Expanded.jsx'

// Part 1 (4 pages)
import {
  Part1Page1,
  Part1Page2,
  Part1Page3,
  Part1Page4,
} from './pages/Part1Expanded.jsx'

// Part 2 (10 pages)
import {
  Part2Page1,
  Part2Page2,
  Part2Page3,
  Part2Page4,
  Part2Page5,
  Part2Page6,
  Part2Page7,
  Part2Page8,
  Part2Page9,
  Part2Page10,
} from './pages/Part2DeepScheduling.jsx'

// Part 3 (10 pages)
import {
  Part3Page1,
  Part3Page2,
  Part3Page3,
  Part3Page4,
  Part3Page5,
  Part3Page6,
  Part3Page7,
  Part3Page8,
  Part3Page9,
  Part3Page10,
} from './pages/Part3HardwareArchitecture.jsx'

// Part 4 (8 pages)
import {
  QuantizationIntro,
  NumericalFormats,
  UniformQuantization,
  AWQDeepDive,
  GPTQDeepDive,
  SmoothQuantAndW8A8,
  GGUFDeepDive,
  QuantizationMatrix,
} from './pages/Part4QuantizationMechanics.jsx'

// Part 5 (8 pages)
import {
  LinuxSocketStack,
  EpollEventLoops,
  StreamingProtocols,
  HTTPProtocols,
  MemorySubsystem,
  CPUSchedulingAndNUMA,
  CgroupsAndThrottling,
  HighPerformanceIPC,
} from './pages/Part5LowLevelSystems.jsx'

// Part 6 (Stage 1 Deep Dive - 8 pages)
import {
  Stage1Architecture,
  OllamaInternals,
  GoClientArchitecture,
  WireProtocolDeepDive,
  GenerationMetrics,
  ExecutionProfiling,
  MemoryBreakdown,
  Stage1FailureModes,
} from './pages/Part6Stage1DeepDive.jsx'

// Hands-On Stage 1 Lab (2 pages)
import LabStage1Architecture from './pages/LabStage1Architecture.jsx'
import LabStage1Profiling from './pages/LabStage1Profiling.jsx'

// Part 7 (Stage 2 Deep Dive - 10 pages)
import {
  Stage2Architecture,
  LiteLLMInternals,
  RoutingTableConfig,
  VirtualKeysAndRBAC,
  RateLimitingAlgorithms,
  CostTrackingAndPostgres,
  FailoverAndRouting,
  CircuitBreaking,
  WireCaptureProtocolNormalization,
  Stage2HardeningPlaybook,
} from './pages/Part7Stage2DeepDive.jsx'

// Hands-On Stage 2 Lab (4 pages)
import {
  LabStage2Page1,
  LabStage2Page2,
  LabStage2Page3,
  LabStage2Page4,
} from './pages/LabStage2Walkthrough.jsx'

// Part 8 (Stage 3 Deep Dive - 12 pages)
import {
  Stage3Introduction,
  KinDClusterTopology,
  KServeArchitecture,
  RawDeploymentVsServerless,
  PredictorImplementation,
  IngressAndNetworking,
  PodSchedulingAndResources,
  HealthProbingMechanics,
  ScalingFromControlPlane,
  EndToEndTrafficPath,
  FaultInjectionAndResilience,
  BenchmarkComparisonAllStages,
} from './pages/Part8Stage3DeepDive.jsx'

// Hands-On Stage 3 Lab (4 pages)
import {
  LabStage3Page1,
  LabStage3Page2,
  LabStage3Page3,
  LabStage3Page4,
} from './pages/LabStage3Walkthrough.jsx'

// Part 9 (Observability & SRE - 8 pages)
import {
  GoldenSignalsAI,
  PrometheusMetricsExporters,
  OpenTelemetryTracing,
  EBPFSocketTracing,
  GrafanaDashboardArchitecture,
  SLOsAndErrorBudgets,
  SREIncidentPlaybooks,
  Day2OperationsAndCapacity,
} from './pages/Part9ObservabilitySRE.jsx'

// Appendices & Colophon (11 pages)
import FoundationalModelsAppendix from './pages/FoundationalModelsAppendix.jsx'
import GlossaryAppendix from './pages/GlossaryAppendix.jsx'
import ModelsAppendix from './pages/ModelsAppendix.jsx'
import ColophonBackCover from './pages/ColophonBackCover.jsx'

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
          <small>A4 · print-ready · 111 pages</small>
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
        {/* Front Matter (4 pages) */}
        <Cover author={author} />
        <Author author={author} />
        <LabSystemSpecsPage />
        <TOCPage />

        {/* Part 0: Architecture Foundations (6 pages) */}
        <Part0Page1 />
        <Part0Page2 />
        <Part0Page3 />
        <Part0Page4 />
        <Part0Page5 />
        <Part0Page6 />

        {/* Part 1: Anatomy of an Inference Request (4 pages) */}
        <Part1Page1 />
        <Part1Page2 />
        <Part1Page3 />
        <Part1Page4 />

        {/* Part 2: Deep Scheduling & Memory Architecture (10 pages) */}
        <Part2Page1 />
        <Part2Page2 />
        <Part2Page3 />
        <Part2Page4 />
        <Part2Page5 />
        <Part2Page6 />
        <Part2Page7 />
        <Part2Page8 />
        <Part2Page9 />
        <Part2Page10 />

        {/* Part 3: Hardware Accelerators & Parallelism (10 pages) */}
        <Part3Page1 />
        <Part3Page2 />
        <Part3Page3 />
        <Part3Page4 />
        <Part3Page5 />
        <Part3Page6 />
        <Part3Page7 />
        <Part3Page8 />
        <Part3Page9 />
        <Part3Page10 />

        {/* Part 4: Quantization Mechanics (8 pages) */}
        <QuantizationIntro />
        <NumericalFormats />
        <UniformQuantization />
        <AWQDeepDive />
        <GPTQDeepDive />
        <SmoothQuantAndW8A8 />
        <GGUFDeepDive />
        <QuantizationMatrix />

        {/* Part 5: Low-Level Linux Systems & Networking (8 pages) */}
        <LinuxSocketStack />
        <EpollEventLoops />
        <StreamingProtocols />
        <HTTPProtocols />
        <MemorySubsystem />
        <CPUSchedulingAndNUMA />
        <CgroupsAndThrottling />
        <HighPerformanceIPC />

        {/* Part 6: Stage 1 Deep Dive - Local Model Serving (8 pages) */}
        <Stage1Architecture />
        <OllamaInternals />
        <GoClientArchitecture />
        <WireProtocolDeepDive />
        <GenerationMetrics />
        <ExecutionProfiling />
        <MemoryBreakdown />
        <Stage1FailureModes />

        {/* Hands-On Stage 1 Lab Walkthrough (2 pages) */}
        <LabStage1Architecture />
        <LabStage1Profiling />

        {/* Part 7: Stage 2 Deep Dive - LiteLLM Gateway & Resilience (10 pages) */}
        <Stage2Architecture />
        <LiteLLMInternals />
        <RoutingTableConfig />
        <VirtualKeysAndRBAC />
        <RateLimitingAlgorithms />
        <CostTrackingAndPostgres />
        <FailoverAndRouting />
        <CircuitBreaking />
        <WireCaptureProtocolNormalization />
        <Stage2HardeningPlaybook />

        {/* Hands-On Stage 2 Lab Walkthrough (4 pages) */}
        <LabStage2Page1 />
        <LabStage2Page2 />
        <LabStage2Page3 />
        <LabStage2Page4 />

        {/* Part 8: Stage 3 Deep Dive - KServe on Kubernetes (12 pages) */}
        <Stage3Introduction />
        <KinDClusterTopology />
        <KServeArchitecture />
        <RawDeploymentVsServerless />
        <PredictorImplementation />
        <IngressAndNetworking />
        <PodSchedulingAndResources />
        <HealthProbingMechanics />
        <ScalingFromControlPlane />
        <EndToEndTrafficPath />
        <FaultInjectionAndResilience />
        <BenchmarkComparisonAllStages />

        {/* Hands-On Stage 3 Lab Walkthrough (4 pages) */}
        <LabStage3Page1 />
        <LabStage3Page2 />
        <LabStage3Page3 />
        <LabStage3Page4 />

        {/* Part 9: Observability, Distributed Tracing & SRE (8 pages) */}
        <GoldenSignalsAI />
        <PrometheusMetricsExporters />
        <OpenTelemetryTracing />
        <EBPFSocketTracing />
        <GrafanaDashboardArchitecture />
        <SLOsAndErrorBudgets />
        <SREIncidentPlaybooks />
        <Day2OperationsAndCapacity />

        {/* Appendices & Colophon (11 pages) */}
        <FoundationalModelsAppendix />
        <GlossaryAppendix />
        <ModelsAppendix />
        <ColophonBackCover />
      </main>
    </>
  )
}
