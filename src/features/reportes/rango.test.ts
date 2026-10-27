import { describe, expect, it } from 'vitest'
import { errorRango } from './rango'

describe('errorRango', () => {
  it('acepta un mes completo y un solo día', () => {
    expect(errorRango({ desde: '2026-10-01', hasta: '2026-10-31' })).toBeNull()
    expect(errorRango({ desde: '2026-10-01', hasta: '2026-10-01' })).toBeNull()
  })

  it('rechaza un rango invertido', () => {
    expect(errorRango({ desde: '2026-10-31', hasta: '2026-10-01' })).toMatch(
      /anterior/
    )
  })

  it('rechaza más de 366 días, igual que el backend', () => {
    expect(errorRango({ desde: '2026-01-01', hasta: '2027-01-01' })).toBeNull()
    expect(errorRango({ desde: '2026-01-01', hasta: '2027-01-02' })).toMatch(
      /366/
    )
  })

  it('exige ambas fechas', () => {
    expect(errorRango({ desde: '', hasta: '2026-10-01' })).toMatch(/ambas/)
  })
})
