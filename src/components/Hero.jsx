export default function Hero({eyebrow, title, subtitle, ctaText, ctaHref}){
  return (
    <section className="hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {ctaText && <a className="btn" href={ctaHref || "/contact"}>{ctaText}</a>}
      </div>
      <div className="hero-bg" aria-hidden="true">
        <img src="/images/hero-industrial.svg" alt=""/>
      </div>
    </section>
  )
}