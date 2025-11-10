import { Link } from "react-router-dom"

const ASSET = (p) => `${import.meta.env.BASE_URL}${p}`

export default function Hero({eyebrow, title, subtitle, ctaText, ctaHref}){
  return (
    <section className="hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {ctaText && <Link className="btn" to={ctaHref || "/contact"}>{ctaText}</Link>}
      </div>
    </section>
  )
}
