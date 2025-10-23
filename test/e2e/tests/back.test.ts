import {describe, it, expect} from 'bun:test'

const DATE = '2020-02-19T23:14:25.989Z'
const LABAS = 'labas'

describe('backend test', () => {
  it(`returns date on /date`, async () => {
    const value = await (await fetch('http://localhost:9900/date')).text()
    expect(value).toBe(DATE)
  })
  it(`returns labas on /`, async () => {
    const value = await (await fetch('http://localhost:9900/')).text()
    expect(value).toBe(LABAS)
  })
});