// Default "About the author" details.
// Author: Ramu Mangalarapu (Senior Backend Engineer)
export const defaultAuthor = {
  name: 'Ramu Mangalarapu',
  role: 'Senior Backend Engineer · Golang · Distributed Systems · Cloud Native',
  org: 'UBS (Core Banking Platforms) · Ex-OpsRamp/HPE, NCR Voyix',
  location: 'Hyderabad, India',
  email: 'ramu.mangalarapu1622@gmail.com',
  linkedin: 'linkedin.com/in/ramu-mangalarapu',
  medium: 'medium.com/@ramu.mangalarapu1622',
  website: 'vishvakosha.com',
  github: 'github.com/ramum',
  education: 'B.Tech in CSE · RGUKT IIIT Basar (2014–2018)',
  certification: 'Certified Kubernetes & Cloud Native Associate (KCNA) · CNCF, 2024',
  bio:
    'Senior Backend Engineer with nearly 8 years of experience designing, developing, and operating ' +
    'production-grade distributed systems and microservices using Go. Specialized in core banking platforms, ' +
    'Identity and Access Management (IAM), and enterprise observability across Kubernetes. Strong track record ' +
    'optimizing CPU hot paths and memory bottlenecks using pprof and K6, strengthening production reliability ' +
    'with OpenTelemetry, Prometheus, Grafana, and eBPF diagnostics, and operating resilient event-driven architectures.',
  why:
    'As backend and systems engineers, we manage network sockets, RPC contracts, kernel queues, and memory ' +
    'allocations daily. LLM inference looks like a black box of machine learning from the outside, but behind ' +
    'the prompt it obeys the exact same laws of computer systems: TCP sockets, epoll loops, virtual memory paging, ' +
    'and hardware bandwidth constraints. This field guide bridges classical Go and Linux systems engineering ' +
    'with the real-world mechanics of model serving.',
  topics:
    'Go (Golang), Kubernetes, Docker, Helm, Cilium, Linux Internals, Distributed Systems, Microservices, ' +
    'Event-Driven Architecture, Asynchronous Workflows, REST APIs, gRPC, Protobuf, OpenAPI, PostgreSQL, Redis, ' +
    'OpenTelemetry, Prometheus, Grafana, LGTM Stack, Go pprof, K6, eBPF, OPA, Rego, OAuth 2.0, SAML, JWT, TDD',
  highlights: [
    {
      company: 'UBS',
      role: 'Software Engineer',
      period: '2025 – Present',
      desc: 'Scale 15+ Go microservices on K8s processing 40k daily transactions. Reduced incident MTTR from 2h to 12m with Linux diagnostics and eBPF.',
    },
    {
      company: 'OpsRamp (HPE)',
      role: 'Cloud Developer-3',
      period: '2024 – 2025',
      desc: 'Co-engineered K8s-native observability agent in Go and OpenTelemetry operating across 100+ production clusters ingesting thousands of metrics/sec.',
    },
    {
      company: 'NCR Voyix',
      role: 'Golang Developer',
      period: '2021 – 2024',
      desc: 'Engineered cloud-native Go microservices for enterprise edge IAM handling 10k auth reqs/sec with OAuth 2.0, OIDC, SAML, and sub-ms Redis caching.',
    },
    {
      company: 'TCS',
      role: 'Golang Developer',
      period: '2018 – 2021',
      desc: 'Developed production REST and gRPC microservices in Go using TDD (80%+ coverage), PostgreSQL schema design, and enterprise SSO integrations.',
    },
  ],
}

export const authorFields = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role / headline' },
  { key: 'org', label: 'Company / community' },
  { key: 'location', label: 'Location' },
  { key: 'bio', label: 'Short bio', multiline: true },
  { key: 'why', label: 'Why I wrote this', multiline: true },
  { key: 'topics', label: 'Topics (comma separated)' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
]
