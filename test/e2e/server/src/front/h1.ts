import {createRoot} from 'react-dom/client'
import H1 from './h1.tsx'

const root = createRoot(document.getElementById('root') as Element)
//@ts-ignore
root.render(H1(globalParams))
