// Source: Wikipedia, "List of large language models" (snapshot used for this guide: 7 Oct 2026).
// Text is available under CC BY-SA 4.0:
//   https://en.wikipedia.org/wiki/List_of_large_language_models
//
// Row format: [name, release date, developer, # params, corpus size, license]
// Parameters are in billions (B) or trillions (T). Cells that were merged
// ("rowspan") on Wikipedia are filled in with the value inherited from the row above.
const U = 'Unknown'
const P = 'Proprietary'

export const modelsByYear = [
  {
    year: 2018,
    rows: [
      ['GPT-1', 'Jun 11, 2018', 'OpenAI', '0.117B', U, 'MIT'],
      ['BERT', 'Oct 2018', 'Google', '0.340B', '3.3B words', 'Apache 2.0'],
    ],
  },
  {
    year: 2019,
    rows: [
      ['T5', 'Oct 2019', 'Google', '11B', '34B tokens', 'Apache 2.0'],
      ['XLNet', 'Jun 2019', 'Google', '0.340B', '33B words', 'Apache 2.0'],
      ['GPT-2', 'Feb 2019', 'OpenAI', '1.5B', '40GB (~10B tokens)', 'MIT'],
    ],
  },
  {
    year: 2020,
    rows: [['GPT-3', 'May 2020', 'OpenAI', '175B', '300B tokens', P]],
  },
  {
    year: 2021,
    rows: [
      ['GPT-Neo', 'Mar 2021', 'EleutherAI', '2.7B', '825 GiB', 'MIT'],
      ['HyperCLOVA', 'May 2021', 'Naver', '204B', '560B tokens', 'Unreleased'],
      ['GPT-J', 'Jun 2021', 'EleutherAI', '6B', '825 GiB', 'Apache 2.0'],
      ['Megatron-Turing NLG', 'Oct 2021', 'Microsoft and Nvidia', '530B', '338.6B tokens', 'Unreleased'],
      ['Ernie 3.0 Titan', 'Dec 2021', 'Baidu', '260B', '4TB', P],
      ['Claude', 'Dec 2021', 'Anthropic', '52B', '400B tokens', P],
      ['GLaM', 'Dec 2021', 'Google', '1162B', '1.6T tokens', P],
      ['Gopher', 'Dec 2021', 'Google DeepMind', '280B', '300B tokens', P],
    ],
  },
  {
    year: 2022,
    rows: [
      ['LaMDA', 'Jan 2022', 'Google', '137B', '1.56T words', P],
      ['GPT-NeoX', 'Feb 2022', 'EleutherAI', '20B', '825 GiB', 'Apache 2.0'],
      ['Chinchilla', 'Mar 2022', 'Google DeepMind', '70B', '1.4T tokens', P],
      ['PaLM', 'Apr 2022', 'Google', '540B', '768B tokens', P],
      ['OPT', 'May 2022', 'Meta', '175B', '180B tokens', 'Non-commercial research'],
      ['YaLM 100B', 'Jun 2022', 'Yandex', '100B', '1.7TB', 'Apache 2.0'],
      ['Minerva', 'Jun 2022', 'Google', '540B', '38.5B tokens (math, arXiv)', P],
      ['BLOOM', 'Jul 2022', 'Hugging Face-led collab.', '175B', '350B tokens (1.6TB)', 'Responsible AI'],
      ['Galactica', 'Nov 2022', 'Meta', '120B', '106B tokens', 'CC-BY-NC-4.0'],
      ['AlexaTM', 'Nov 2022', 'Amazon', '20B', '1.3T', P],
    ],
  },
  {
    year: 2023,
    rows: [
      ['Llama', 'Feb 2023', 'Meta AI', '65B', '1.4T', 'Non-commercial research'],
      ['Stanford Alpaca', 'Mar 13, 2023', 'Stanford University', '7B', '52K demonstrations', 'Non-commercial'],
      ['GPT-4', 'Mar 2023', 'OpenAI', U, U, P],
      ['Cerebras-GPT', 'Mar 2023', 'Cerebras', '13B', U, 'Apache 2.0'],
      ['Falcon', 'Mar 2023', 'Technology Innovation Inst.', '40B', '1T tokens (RefinedWeb)', 'Apache 2.0'],
      ['BloombergGPT', 'Mar 2023', 'Bloomberg L.P.', '50B', '363B proprietary + 345B tokens', 'Unreleased'],
      ['PanGu-Σ', 'Mar 2023', 'Huawei', '1085B', '329B tokens', P],
      ['OpenAssistant', 'Mar 2023', 'LAION', '17B', '1.5T tokens', 'Apache 2.0'],
      ['Vicuna', 'Mar 2023', 'LMSYS', '13B', '70K conversations', 'Non-commercial'],
      ['Jurassic-2', 'Mar 2023', 'AI21 Labs', U, U, P],
      ['PaLM 2', 'May 2023', 'Google', '340B', '3.6T tokens', P],
      ['YandexGPT', 'May 17, 2023', 'Yandex', U, U, P],
      ['Phi-1', 'Jun 21, 2023', 'Microsoft', '1.3B', '7B tokens', 'MIT'],
      ['Llama 2', 'Jul 2023', 'Meta AI', '70B', '2T tokens', 'Llama 2'],
      ['Claude 2', 'Jul 2023', 'Anthropic', U, U, P],
      ['Granite 13b', 'Jul 2023', 'IBM', U, U, P],
      ['Mistral 7B', 'Sep 2023', 'Mistral AI', '7.3B', U, 'Apache 2.0'],
      ['YandexGPT 2', 'Sep 7, 2023', 'Yandex', U, U, P],
      ['Claude 2.1', 'Nov 2023', 'Anthropic', U, U, P],
      ['Grok-1', 'Nov 2023', 'xAI', '314B', U, 'Apache 2.0'],
      ['Gemini 1.0', 'Dec 2023', 'Google DeepMind', U, U, P],
      ['Mixtral 8x7B', 'Dec 2023', 'Mistral AI', '46.7B', U, 'Apache 2.0'],
      ['DeepSeek-LLM', 'Nov 29, 2023', 'DeepSeek', '67B', '2T tokens', 'DeepSeek'],
      ['Phi-2', 'Dec 2023', 'Microsoft', '2.7B', '1.4T tokens', 'MIT'],
    ],
  },
  {
    year: 2024,
    rows: [
      ['Gemini 1.5', 'Feb 2024', 'Google DeepMind', U, U, P],
      ['Gemini Ultra', 'Feb 2024', 'Google DeepMind', U, U, P],
      ['Gemma', 'Feb 2024', 'Google DeepMind', '7B', '6T tokens', 'Gemma Terms of Use'],
      ['OLMo', 'Feb 2024', 'Allen Institute for AI', '7B', '2T tokens', 'Apache 2.0'],
      ['Claude 3', 'Mar 2024', 'Anthropic', U, U, P],
      ['DBRX', 'Mar 2024', 'Databricks and Mosaic ML', '136B', '12T tokens', 'Databricks Open Model'],
      ['YandexGPT 3 Pro', 'Mar 28, 2024', 'Yandex', U, U, P],
      ['Fugaku-LLM', 'May 2024', 'Fujitsu, Tokyo Tech, RIKEN +', '13B', '380B tokens', 'Fugaku-LLM Terms of Use'],
      ['Chameleon', 'May 2024', 'Meta AI', '34B', '4.4T', 'Non-commercial research'],
      ['Mixtral 8x22B', 'Apr 17, 2024', 'Mistral AI', '141B', U, 'Apache 2.0'],
      ['Phi-3', 'Apr 23, 2024', 'Microsoft', '14B', '4.8T tokens', 'MIT'],
      ['Granite Code Models', 'May 2024', 'IBM', U, U, 'Apache 2.0'],
      ['YandexGPT 3 Lite', 'May 28, 2024', 'Yandex', U, U, P],
      ['Qwen2', 'Jun 2024', 'Alibaba Cloud', '72B', '3T tokens', 'Various'],
      ['DeepSeek-V2', 'Jun 2024', 'DeepSeek', '236B', '8.1T tokens', 'DeepSeek'],
      ['Nemotron-4', 'Jun 2024', 'Nvidia', '340B', '9T tokens', 'NVIDIA Open Model'],
      ['Claude 3.5', 'Jun 2024', 'Anthropic', U, U, P],
      ['Llama 3.1', 'Jul 2024', 'Meta AI', '405B', '15.6T tokens', 'Llama 3'],
      ['Grok-2', 'Aug 14, 2024', 'xAI', U, U, 'xAI Community License'],
      ['OpenAI o1', 'Sep 12, 2024', 'OpenAI', U, U, P],
      ['Sarvam-1', 'Oct 24, 2024', 'Sarvam AI', '2B', '~2T tokens', 'Sarvam AI Research'],
      ['YandexGPT 4 Lite and Pro', 'Oct 24, 2024', 'Yandex', U, U, P],
      ['Mistral Large', 'Nov 2024', 'Mistral AI', '123B', U, 'Mistral Research'],
      ['Pixtral', 'Nov 2024', 'Mistral AI', '123B', U, 'Mistral Research'],
      ['OLMo 2', 'Nov 2024', 'Allen Institute for AI', '32B', '6.6T tokens', 'Apache 2.0'],
      ['Phi-4', 'Dec 12, 2024', 'Microsoft', '14B', '9.8T tokens', 'MIT'],
      ['DeepSeek-V3', 'Dec 2024', 'DeepSeek', '671B', '14.8T tokens', 'MIT'],
      ['Amazon Nova', 'Dec 2024', 'Amazon', U, U, P],
    ],
  },
  {
    year: 2025,
    rows: [
      ['DeepSeek-R1', 'Jan 20', 'DeepSeek', '671B', U, 'MIT'],
      ['Qwen2.5', 'Jan 26', 'Alibaba', '72B', '18T', 'Various'],
      ['MiniMax-Text-01', 'Jan 14', 'MiniMax', '456B', '4.7T', 'MiniMax Model'],
      ['Gemini 2.0', 'Feb 5', 'Google DeepMind', U, U, P],
      ['Grok 3', 'Feb 19', 'xAI', U, U, P],
      ['Claude 3.7', 'Feb 24', 'Anthropic', U, U, P],
      ['YandexGPT 5 Lite Pretrain and Pro', 'Feb 25', 'Yandex', U, U, P],
      ['GPT-4.5', 'Feb 27', 'OpenAI', U, U, P],
      ['Gemini 2.5', 'Mar 25', 'Google DeepMind', U, U, P],
      ['YandexGPT 5 Lite Instruct', 'Mar 31', 'Yandex', U, U, P],
      ['Llama 4', 'Apr 5', 'Meta AI', '400B', '40T', 'Llama 4'],
      ['OpenAI o3 and o4-mini', 'Apr 16', 'OpenAI', U, U, P],
      ['Qwen3', 'Apr 28', 'Alibaba Cloud', '235B', '36T', 'Apache 2.0'],
      ['Claude 4', 'May 22', 'Anthropic', U, U, P],
      ['Sarvam-M', 'May 23', 'Sarvam AI', '24B', U, 'Apache 2.0'],
      ['Grok 4', 'Jul 9', 'xAI', U, U, P],
      ['Param-1', 'Jul 21', 'BharatGen', '2.9B', '5T', 'Apache 2.0'],
      ['GLM-4.5', 'Jul 29', 'Z.ai', '355B', '22T', 'MIT'],
      ['GPT-OSS', 'Aug 5', 'OpenAI', '117B', U, 'Apache 2.0'],
      ['Claude 4.1', 'Aug 5', 'Anthropic', U, U, P],
      ['GPT-5', 'Aug 7', 'OpenAI', U, U, P],
      ['DeepSeek-V3.1', 'Aug 21', 'DeepSeek', '671B', '15.639T', 'MIT'],
      ['YandexGPT 5.1 Pro', 'Aug 28', 'Yandex', U, U, P],
      ['Apertus', 'Sep 2', 'ETH Zurich and EPFL', '70B', '15T', 'Apache 2.0'],
      ['Claude Sonnet 4.5', 'Sep 29', 'Anthropic', U, U, P],
      ['GLM-4.6', 'Sep 30', 'Z.ai', '357B', U, 'Apache 2.0'],
      ['Alice AI LLM 1.0', 'Oct 28', 'Yandex', U, U, P],
      ['Gemini 3', 'Nov 18', 'Google DeepMind', U, U, P],
      ['Olmo 3', 'Nov 20', 'Allen Institute for AI', '32B', '5.9T', 'Apache 2.0'],
      ['Claude Opus 4.5', 'Nov 24', 'Anthropic', U, U, P],
      ['DeepSeek-V3.2', 'Dec 1', 'DeepSeek', '685B', U, 'MIT'],
      ['GPT 5.2', 'Dec 11', 'OpenAI', U, U, P],
      ['GLM-4.7', 'Dec 22', 'Z.ai', '355B', U, 'Apache 2.0'],
    ],
  },
  {
    year: 2026,
    rows: [
      ['Qwen3-Max-Thinking', 'Jan 26', 'Alibaba Cloud', U, U, P],
      ['K2 Think V2', 'Jan 27', 'MBZUAI / IFM', '70B', '12T', 'Apache 2.0'],
      ['Kimi K2.5', 'Jan 27', 'Moonshot AI', '1T', '15T', 'Modified MIT'],
      ['Step 3.5 Flash', 'Feb 12', 'StepFun', '196B', U, 'Apache 2.0'],
      ['Claude Opus 4.6', 'Feb 5', 'Anthropic', U, U, P],
      ['GPT-5.3-Codex', 'Feb 5', 'OpenAI', U, U, P],
      ['GLM-5', 'Feb 12', 'Z.ai', '744B', '28.5T', 'MIT'],
      ['Qwen3.5', 'Feb 15', 'Alibaba Cloud', '397B', U, 'Apache 2.0'],
      ['Qwen3.5-Plus', 'Feb 15', 'Alibaba Cloud', U, U, P],
      ['Claude Sonnet 4.6', 'Feb 17', 'Anthropic', U, U, P],
      ['Param-2', 'Feb 17', 'BharatGen', '17B', '22T', 'BharatGen Research'],
      ['Sarvam-105B', 'Feb 18', 'Sarvam AI', '105B', '12T', 'Apache 2.0'],
      ['Sarvam-30B', 'Feb 18', 'Sarvam AI', '30B', '16T', 'Apache 2.0'],
      ['GPT-5.4', 'Mar 5', 'OpenAI', U, U, P],
      ['Mistral Small 4', 'Mar 17', 'Mistral AI', '119B', U, 'Apache 2.0'],
      ['MiMo-V2-Pro', 'Mar 18', 'Xiaomi', '1T', U, P],
      ['Qwen3.6-Plus', 'Apr 1', 'Alibaba Cloud', U, U, P],
      ['Gemma 4', 'Apr 2', 'Google DeepMind', '31B', U, 'Apache 2.0'],
      ['GLM-5.1', 'Apr 7', 'Z.ai', '744B', '28.5T', 'MIT'],
      ['Muse Spark', 'Apr 8', 'Meta', U, U, P],
      ['Qwen3.6', 'Apr 15', 'Alibaba Cloud', '35B', U, 'Apache 2.0'],
      ['Claude Opus 4.7', 'Apr 16', 'Anthropic', U, U, P],
      ['Kimi K2.6', 'Apr 20', 'Moonshot AI', '1T', U, 'Modified MIT'],
      ['GPT-5.5', 'Apr 23', 'OpenAI', U, U, P],
      ['Hy3 preview', 'Apr 23', 'Tencent', '295B', U, 'Tencent Hy Community'],
      ['MiMo-V2.5-Pro', 'Apr 27', 'Xiaomi', '1.02T', '48T', 'MIT'],
      ['MiMo-V2.5', 'Apr 27', 'Xiaomi', '310B', '27T', 'MIT'],
      ['Mistral Medium 3.5', 'Apr 28', 'Mistral AI', '128B', U, 'Modified MIT'],
      ['Composer 2.5', 'May 18', 'Cursor', '1T', U, P],
      ['Gemini 3.5 Flash', 'May 19', 'Google DeepMind', U, U, P],
      ['Qwen3.7-Max', 'May 20', 'Alibaba Cloud', U, U, P],
      ['Claude Opus 4.8', 'May 28', 'Anthropic', U, U, P],
      ['Step 3.7 Flash', 'May 29', 'StepFun', '198B', U, 'Apache 2.0'],
      ['MiniMax-M3', 'Jun 1', 'MiniMax', '428B', U, 'MiniMax Community'],
      ['Nemotron 3 Ultra', 'Jun 4', 'Nvidia', '550B', '20T', 'OpenMDW 1.1'],
      ['Claude Fable 5', 'Jun 9', 'Anthropic', U, U, P],
      ['Kimi K2.7 Code', 'Jun 16', 'Moonshot AI', '1T', U, 'Modified MIT'],
      ['GLM-5.2', 'Jun 16', 'Z.ai', '744B', '28.5T', 'MIT'],
      ['LongCat-2.0', 'Jun 30', 'Meituan', '1.6T', '35T', 'MIT'],
      ['Hy3', 'Jul 6', 'Tencent', '295B', U, 'Apache 2.0'],
      ['Grok 4.5', 'Jul 8', 'SpaceXAI', U, U, P],
      ['SWE-1.7', 'Jul 8', 'Cognition AI', U, U, P],
      ['Muse Spark 1.1', 'Jul 9', 'Meta', U, U, P],
      ['GPT-5.6', 'Jul 9', 'OpenAI', U, U, P],
      ['Inkling', 'Jul 15', 'Thinking Machines Lab', '975B', '45T', 'Apache 2.0'],
      ['Kimi K3', 'Jul 16', 'Moonshot AI', '2.8T', U, 'Kimi K3'],
      ['Qwen3.8', 'Jul 19', 'Alibaba Cloud', '2.4T', U, 'Various'],
      ['Gemini 3.5 Flash Lite', 'Jul 21', 'Google DeepMind', U, U, P],
      ['Gemini 3.6 Flash', 'Jul 21', 'Google DeepMind', U, U, P],
      ['Laguna S 2.1', 'Jul 21', 'Poolside AI', '118B', U, 'OpenMDW 1.1'],
      ['Motif 3', 'Jul 21', 'Motif Technologies', '314B', '12.5T', 'MIT'],
      ['Solar Open 2', 'Jul 23', 'Upstage', '250B', '12T', 'Upstage Solar'],
      ['Fugu-Ultra v1.1', 'Jul 24', 'Sakana AI', U, U, P],
      ['Claude Opus 5', 'Jul 24', 'Anthropic', U, U, P],
      ['A.X K2', 'Jul 29', 'SK Telecom', '688B', '8.2T', 'Apache 2.0'],
      ['Inkling Small', 'Jul 31', 'Thinking Machines Lab', '276B', U, 'Apache 2.0'],
      ['K-Exaone 2.0', 'Jul 31', 'LG', '750B', U, 'Apache 2.0'],
      ['DeepSeek-V4-Flash', 'Jul 31', 'DeepSeek', '284B', '32T', 'MIT'],
      ['Muse Glimmer', 'Aug 10', 'Meta', '30B', U, 'Apache 2.0'],
      ['Gemini 3.7 Flash', 'Aug 13', 'Google DeepMind', U, U, P],
      ['DeepSeek-V4-Pro', 'Aug 13', 'DeepSeek', '1.6T', '32T', 'MIT'],
      ['GLM-5.3', 'Aug 14', 'Z.ai', '744B (40B active)', '30T', 'Various'],
      ['GLM-5.3-flash', 'Aug 28', 'Z.ai', '320B (18B active)', '30T', 'MIT'],
      ['Hy4 preview', 'Aug 28', 'Tencent', '770B', U, 'Apache 2.0'],
      ['Claude Mythos 5.1', 'Sep 1', 'Anthropic', U, U, P],
      ['Claude Fable 5.1', 'Sep 1', 'Anthropic', U, U, P],
      ['Gemini 3.8 Flash', 'Sep 2', 'Google DeepMind', U, U, P],
      ['GPT-6 Astra', 'Sep 3', 'OpenAI', U, U, P],
      ['K2 Horizon', 'Sep 3', 'MBZUAI / IFM', '0.9B to 375B', '20T', 'Apache 2.0'],
      ['DeepSeek-V4.1-Flash', 'Sep 10', 'DeepSeek', '552B', '45T', 'MIT'],
      ['Grok 4.7', 'Sep 21', 'SpaceXAI', U, U, P],
      ['GPT-6 Sol', 'Sep 22', 'OpenAI', U, U, P],
      ['MiMo-V2.6-Pro', 'Sep 22', 'Xiaomi', '1.02T', '30T', 'MIT'],
      ['MiMo-V2.6-Flash', 'Sep 22', 'Xiaomi', '310B', '48T', 'MIT'],
      ['Claude Opus 5.5', 'Sep 22', 'Anthropic', U, U, P],
      ['Claude Sonnet 5.5', 'Sep 28', 'Anthropic', U, U, P],
      ['GPT 6.1', 'Sep 29', 'OpenAI', U, U, P],
      ['Gemini 4 Argon', 'Sep 30', 'Google DeepMind', U, U, P],
      ['Mistral Large 4 Preview', 'Oct 7', 'Mistral AI', '1.05T', U, U],
    ],
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Month/day sort key so every year reads chronologically (the wiki table is only roughly ordered).
function sortKey(date) {
  const m = MONTHS.indexOf(date.slice(0, 3))
  const d = /^[A-Z][a-z]{2} (\d{1,2})\b/.exec(date)
  return m * 100 + (d ? Number(d[1]) : 0)
}

// "Jan 20" -> "Jan 20, 2025"; "Oct 2018" stays as is.
function displayDate(date, year) {
  return /^[A-Z][a-z]{2} \d{1,2}$/.test(date) ? `${date}, ${year}` : date
}

// License bucket drives the coloured dot in the table and the charts in Part 0.
//  open   = permissive weights (Apache 2.0, MIT, OpenMDW, CC-BY ...)
//  custom = downloadable weights under a custom / restricted / non-commercial licence
//  prop   = API / app only
//  unrel  = unreleased or unknown
export function licenseClass(license) {
  if (/proprietary/i.test(license)) return 'prop'
  if (/unreleased|^unknown$/i.test(license)) return 'unrel'
  if (/^(apache 2\.0|mit|openmdw 1\.1)$/i.test(license)) return 'open'
  return 'custom'
}

export function normalizeDeveloper(dev) {
  if (/^google/i.test(dev)) return 'Google / DeepMind'
  if (/^alibaba/i.test(dev)) return 'Alibaba'
  if (/^meta/i.test(dev)) return 'Meta'
  return dev
}

export const allModels = modelsByYear.flatMap(({ year, rows }) =>
  rows
    .map(([name, date, developer, params, corpus, license]) => ({
      name,
      date: displayDate(date, year),
      key: sortKey(date),
      year,
      developer,
      params,
      corpus,
      license,
      lic: licenseClass(license),
    }))
    .sort((a, b) => a.key - b.key),
)

export const modelYears = modelsByYear.map(({ year }) => ({
  year,
  models: allModels.filter((m) => m.year === year),
}))
