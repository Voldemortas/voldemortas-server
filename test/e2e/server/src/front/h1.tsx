import {useState} from 'react'
import styles from './h1.module.scss'

export default function H1({h1, text}: {h1: string; text: string}) {
  const [state, setState] = useState(1)
  return (
    <main>
      <h1>{h1}</h1>
      value: {state}
      <br />
      <button onClick={() => setState(state + 1)}>increase value</button>
      <br />
      <div className={styles('test')}>test css</div>
      <p dangerouslySetInnerHTML={{__html: text}} />
    </main>
  )
}
