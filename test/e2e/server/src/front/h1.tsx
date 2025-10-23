export default function H1({ h1, text }: { h1: string; text: string }) {
  return (
    <main>
      <h1>{h1}</h1>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </main>
  )
}
