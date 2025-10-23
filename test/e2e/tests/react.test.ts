import {describe, it, expect, beforeEach} from 'bun:test'

const GLOBAL_PARAMS = '{"h1":"dis is h1","text":"ik ben een tekst"}'

describe('react test', () => {
  let pagerContent: string;
  beforeEach(async () => {
    pagerContent = await (await fetch('http://localhost:9900/h1')).text()
  })
  it(`has a good title`, async () => {
    expect(pagerContent).toContain('<title>e2e test</title>')
  })
  it(`has hash and global params`, async () => {
    const hash = /const hash = '(\d+)'/.exec(pagerContent)!.flat()[1]
    const globalParams = /const globalParams = (\{.+\})/.exec(pagerContent)!.flat()[1]
    expect(globalParams).toStrictEqual(GLOBAL_PARAMS)
    expect(pagerContent).toContain(`<script type="module" src="/front/h1.js?hash=${hash}">`)
    expect(pagerContent).toContain(`<link rel="stylesheet" href="/front/h1.css?hash=${hash}" />`)
  })
  it('has the react js module existing', async () => {
    const file = await fetch('http://localhost:9900/front/h1.js')
    expect(file.ok).toBeTrue()
  })
});