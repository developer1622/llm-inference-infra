import React from 'react'
import { Page } from '../components/ui.jsx'
import { modelYears } from '../data/models.js'

// Rows that fit on one A4 sheet (verified by the overflow check in the layout tests).
const FIRST_PAGE_ROWS = 36
const OTHER_PAGE_ROWS = 42

const licenseLabel = {
  open: 'Open licence',
  custom: 'Custom / restricted weights',
  prop: 'Proprietary (API / app)',
  unrel: 'Unreleased / unknown',
}

// Greedy pagination: a year heading is never left alone at the bottom of a sheet,
// and a year that continues on the next sheet gets a "(cont.)" heading.
function paginate() {
  const pages = [[]]
  let used = 0
  let cap = FIRST_PAGE_ROWS
  const push = (row) => {
    pages[pages.length - 1].push(row)
    used += 1
  }
  const nextPage = () => {
    pages.push([])
    used = 0
    cap = OTHER_PAGE_ROWS
  }
  modelYears.forEach(({ year, models }) => {
    if (cap - used < 3) nextPage()
    push({ type: 'year', year, count: models.length })
    models.forEach((m, i) => {
      if (used >= cap) {
        nextPage()
        push({ type: 'year', year, cont: true, count: models.length })
      }
      push({ type: 'model', m, i })
    })
  })
  return pages
}

function Row({ row }) {
  if (row.type === 'year') {
    return (
      <tr className="yr">
        <td colSpan={6}>
          <b>{row.year}</b>
          {row.cont ? <em> (continued)</em> : <em> · {row.count} models</em>}
        </td>
      </tr>
    )
  }
  const { m } = row
  return (
    <tr>
      <td className="nm" title={m.name}>{m.name}</td>
      <td>{m.date}</td>
      <td title={m.developer}>{m.developer}</td>
      <td>{m.params}</td>
      <td title={m.corpus}>{m.corpus}</td>
      <td title={m.license}>
        <i className={`ld s-${m.lic}`} />
        {m.license}
      </td>
    </tr>
  )
}

export default function ModelsAppendix() {
  const pages = paginate()
  return (
    <>
      {pages.map((rows, pi) => (
        <Page key={pi} tone="multi" running={`Appendix · The model zoo (${pi + 1}/${pages.length})`} part="Appendix">
          {pi === 0 ? (
            <div className="app-intro">
              <div className="kicker">Appendix · List of large language models</div>
              <h1 className="big">The model zoo, 2018 → October 2026</h1>
              <p className="fine left">
                Parameters are for the largest listed variant. &ldquo;Unknown&rdquo; means not disclosed. Licence applies
                to the pre-trained weights only. Source: Wikipedia, <i>List of large language models</i>, CC BY-SA 4.0.
              </p>
              <div className="legend">
                {Object.entries(licenseLabel).map(([k, v]) => (
                  <span key={k}><i className={`s-${k}`} />{v}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="app-intro" style={{ marginBottom: '2.5mm' }}>
              <div className="kicker">Appendix · List of large language models ({pi + 1} of {pages.length})</div>
              <h1 className="big" style={{ fontSize: '15pt', margin: '0 0 1mm' }}>The Model Zoo (2018 &rarr; October 2026 &bull; Cont.)</h1>
              <p className="fine left" style={{ margin: 0 }}>
                Chronological index of milestone transformer architectures, open-weights releases, and foundation models.
              </p>
            </div>
          )}
          <table className="mtable">
            <colgroup>
              <col style={{ width: '24%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '17%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Model</th>
                <th>Released</th>
                <th>Developer</th>
                <th>Params</th>
                <th>Corpus</th>
                <th>Licence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <Row key={i} row={r} />
              ))}
            </tbody>
          </table>
        </Page>
      ))}
    </>
  )
}
