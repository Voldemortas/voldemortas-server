import {describe, it, expect} from 'bun:test'

const DATE = '2020-02-19T23:14:25.989Z'
const LABAS = 'labas'
const PONG = 'pong'

describe('backend test', () => {
  it(`returns date on /date`, async () => {
    const fetchedResult = await fetch('http://localhost:9900/date')
    const json = await fetchedResult.json()
    expect(fetchedResult.headers.get('content-type')).toContain('json')
    expect(json).toMatchObject({date: DATE})
  })
  it(`returns labas on /`, async () => {
    const value = await (await fetch('http://localhost:9900/')).text()
    expect(value).toBe(LABAS)
  })
  it(`returns pong on /ping`, async () => {
    const value = await (await fetch('http://localhost:9900/ping')).text()
    expect(value).toBe(PONG)
  })
  it('has the global css existing', async () => {
    const file = await fetch('http://localhost:9900/global.css')
    expect(file.ok).toBeTrue()
  })
  it('has the built global css', async () => {
    const text = await(await fetch('http://localhost:9900/global.css')).text()
    expect(text).toContain('font-size: 60px;')
  })
});