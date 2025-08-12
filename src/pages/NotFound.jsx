import { Link } from "react-router-dom"

export default function NotFound(){
  return (
    <section className="container section">
      <h1>Not Found</h1>
      <p>We couldn’t find that page.</p>
      <Link className="btn" to="/">Back home</Link>
    </section>
  )
}