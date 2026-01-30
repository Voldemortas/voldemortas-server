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
    const text = await (await fetch('http://localhost:9900/global.css')).text()
    expect(text).toContain('font-size: 60px;')
  })
  it('has correct headers for global css', async () => {
    const headers = (await fetch('http://localhost:9900/global.css')).headers

    expect(headers.get('content-type')).toStrictEqual('text/css')
    expect(headers.get('Cross-Origin-Opener-Policy')).toStrictEqual(
      'same-origin'
    )
    expect(headers.get('Cross-Origin-Resource-Policy')).toStrictEqual(
      'same-origin'
    )
    expect(headers.get('Cross-Origin-Embedder-Policy')).toStrictEqual(
      'unsafe-none'
    )
  })
  it('has correct headers for reactPage', async () => {
    const headers = (await fetch('http://localhost:9900/h1')).headers

    expect(headers.get('content-type')).toStrictEqual('text/html')
    expect(headers.get('test')).toStrictEqual('whatever')
  })
  it('has correct css for reactPage', async () => {
    const css = await (await fetch(`http://localhost:9900/front/h1.css`)).text()
    expect(css).toContain(`_test {
  color: light-dark(#ff0102, #01ff02);
}
`)
  })
})
