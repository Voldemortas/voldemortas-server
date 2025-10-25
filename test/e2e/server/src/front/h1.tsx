import styles from './h1.module.scss'

export default function H1({ h1, text }: { h1: string; text: string }) {
  return (
    <main>
      <h1>{h1}</h1>
      <div className={styles('test')}>test css</div>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </main>
  )
}
