import { describe, expect, it } from 'vitest'
import { diasSemanaSiguiente } from './fechas'

describe('diasSemanaSiguiente', () => {
  it('desde un viernes devuelve el lunes a jueves de la semana siguiente', () => {
    // 2026-10-30 es viernes
    expect(diasSemanaSiguiente('2026-10-30')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
    ])
  })

  it('desde un lunes no devuelve el mismo lunes, sino el de la semana siguiente', () => {
    // 2026-10-26 es lunes
    expect(diasSemanaSiguiente('2026-10-26')[0]).toBe('2026-11-02')
  })

  it('desde un domingo empieza el lunes siguiente', () => {
    // 2026-11-01 es domingo
    expect(diasSemanaSiguiente('2026-11-01')[0]).toBe('2026-11-02')
  })
})
