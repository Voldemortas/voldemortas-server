# voldemortas-server

## About

The project lets you run a [bun](https://bun.sh/) powered server that several kinds of pages on the routes you define
yourself:

* simple `JSON` (or for that matter any kind) response (even html if you dare to write it on your own!)
* render react on a template
* redirect route to another file (I use it to serve `/favicon.ico` which actually can be `/static/icon.png`)
* serve static content (images, css, json, whatever you like)

## Requirements and installation

The project requires `bun` (v1.22.17 and above) and that's it, it installs `react` as a peer dependency

To add it to your bun project run
`bun add https://github.com/Voldemortas/voldemortas-server/releases/download/latest/latest.tgz`

Or you can browse former releases at [the release page](https://github.com/Voldemortas/voldemortas-server/releases).

## Documentation

For a quick example refer to the [test/e2e/](test/e2e) directory (ignore the `tests/` directory). You can also consult
[Voldemortas/kalbynas](https://github.com/Voldemortas/kalbynas) which uses this project.

-----

### Wrapper

Wrapper (`import {wrapper} from 'mortas-server'`) is used to `watch`, `build`, `serve` the server.

```ts
//index.ts
import {wrap} from 'voldemortas-server'
import routes from './routes.ts'

await wrap({
  rootDir, //the ABSOLUTE path to your project directory
  outDir, //the path to the directory where the built will reside 
  srcDir, //the paths to the source directory such as `src`
  entryPoint, //the path to the server.ts 
  staticDir, //the RELATIVE path within the source directory to the static files directory such as `static`
  frontDir, //the path where your frontend react is
  tempDir, //the for some react magic, gets created and deleted during build
  defaultHtml, //the path to the html template where the react code will be injected
  developmentHtml, //the path to the additional content for development only (like hot reloading)
  globalScssOptions, //optional, allows defining global.css built from a .scss file
  routes, //routes as in `routes.ts`
})
```

Then you are presented with 4 flags:

* `--build` - outputs the built project in the `outDir`.
* `--serve` - runs the build project from the `outDir`.
* `--prod` - used to build/serve the server for production mode.
* `--watch` - builds the dev mode and runs the server in dev mode with hot reloading.
  Cannot be combined with other flags.
* `--nocleanup` - doesn't delete `tempDir` upon failure

You can then run commands like `bun run path/to/index.ts --watch` or `bun run path/to/index.ts --build --serve --prod`.
Or define them as scripts in your `package.json`.

### Routes

Right now there are 3 kinds of routes:

#### BackRoute

Used to return a simple any kind of response, be it JSON, txt or even html if you dare to write it on your own!

```ts
import {BackRoute} from 'voldemortas-server/route'
import {jsonHeaders} from 'voldemortas-server/utils'

export const backRoute = new BackRoute('/url', (req: Request, params: any) => {
  return new Response(JSON.stringify(params), jsonHeaders)
}, ['I am a parameter'])
export const dateRoute = new BackRoute('/date', new Request({date: new Date().toISOString()}, jsonHeaders))
export const pingRoute = new BackRoute('/ping', 'pong')
```

Upon visiting `example.com/url` you'll see `["I am a parameter"]` with the content type being that of JSON. And visiting
`example.com/date` you'll see the current date printed in the ISO format. And `example.com/ping` will return a simple
`pong` back.

#### ReactRoute

```ts
import {ReactRoute} from 'voldemortas-server/route'

export const reactRoute = new ReactRoute('/react', 'front/reactPage.tsx', (req: Request, params: any) => ({
  h1: 'dis is h1',
  text: params,
}), ['arg'])
// export const reactRoute = new ReactRoute('/react', 'front/reactPage.tsx',  {
//   h1: 'dis is h1',
//   text: ['arg'],
// })
```

Upon visiting `example.com/react` you'll see react module from `srcDir/front/reactPage.ts` inserted into the
`defaultHtml` template. With the params being `{h1: 'dis is h1', text: params}` for the template. You can also write it
as shown below in the commented section - you ain't usin' the `request` there anyway.

#### RedirectRoute

```ts
import {RedirectRoute} from 'voldemortas-server/route'

export const redirectRoute = new RedirectRoute('/global.css', '/static/global.css', ['headers', '{"content-type": "text/css"}'])
```

Upon visiting `example.com/global.css` you'll see a file served from the `/static/global.css` with the css headers. The
third parameter is optional if you don't want to set the headers.

### Server

```ts
//server.ts
//too lazy to write documentation for this so just used this

import Server from 'voldemortas-server'
import routes from './routes'

const server = new Server({
  port: '9900',
  routes: routes,
  staticPaths: [/^\/static\//, /^\/front\//],
}).getServer()

console.log(`Listening on ${server.url}`)
```

-----

## Building

## Building details

The server building works in several steps:

0. Removes `$outDir` directory and creates an empty one
1. Copies content from `$srcDir/$staticDir` to `$outDir/$staticDir`
2. Creates `$tempDir` directory and copies content from `$frontDir` there
3. Runs _SASS_ compiler on `*.scss` files found in `$tempDir` and creates corresponding `[name].css` files
4. If the file was `*.module.scss` and it had `$uniqueId` then creates `[name].js` file used for unique-prefixed styles
5. Checks every `*.tsx` file and updates imports for original `*.module.scss` to include both new compiled `.css` and
   `.js` files
6. Checks `$routes` for _React_ entry points and based on them builds single `[name].js` and `[name].css` files into
   `/out/front/` directory
7. Compiles `$entryPoint` into bundled version within `$outDir` directory.

## Caveats

[Css Modules](https://github.com/css-modules/css-modules) are semi-supported now for `*.module.scss` files, to use them
follow this snippet:

```scss
.italic {
  font-style: italic;
}
```

```tsx
//MyComponent.tsx
import React from 'react'
import styles from 'myModule.module.scss'

export default function MyComponent() {
  return <div className={styles('italic')}>Hello world!</div>
}
```

Sass generated `$uniqueId` is required in order for custom css modules implementation to work.


---

This project was created using [Voldemortas/bun-react-server-2](https://github.com/Voldemortas/bun-react-server-2)
template
