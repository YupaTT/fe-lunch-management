import { describe, expect, it } from 'vitest'
import { vigencia } from './format'

describe('vigencia', () => {
  it('muestra el inicio mientras sigue vigente', () => {
    expect(vigencia({ mesInicio: '2026-11-01', mesFin: null })).toBe(
      'Desde nov 2026'
    )
  })

  it('muestra el último mes cubierto, también si cubre un solo mes', () => {
    expect(vigencia({ mesInicio: '2026-09-01', mesFin: '2026-10-01' })).toBe(
      'Hasta oct 2026'
    )
    expect(vigencia({ mesInicio: '2026-10-01', mesFin: '2026-10-01' })).toBe(
      'Hasta oct 2026'
    )
  })

  it('no muestra vigencia si se canceló antes de empezar', () => {
    expect(vigencia({ mesInicio: '2026-11-01', mesFin: '2026-10-01' })).toBe(
      '—'
    )
  })
})
