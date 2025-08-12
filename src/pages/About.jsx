export default function About(){
  return (
    <section className="container section">
      <h1>About 3D Ops</h1>
      <p className="lead">We make advanced manufacturing accessible and help teams ship real products.</p>
      <p>Our roots are in additive manufacturing — offering affordable metal 3D printing for mainstream manufacturing — and we’ve expanded to provide end‑to‑end product development across hardware and software.</p>
      <div className="grid-2">
        <div>
          <h3>Why 3D Ops</h3>
          <ul className="checklist">
            <li>Industrial quality with small‑batch flexibility</li>
            <li>Full‑stack expertise: mechanical, electrical, firmware, and software</li>
            <li>Pragmatic, ROI‑driven approach</li>
          </ul>
        </div>
        <div>
          <h3>Capabilities</h3>
          <ul className="checklist">
            <li>Metal & polymer AM, post‑processing, and finishing</li>
            <li>Embedded systems, sensors, and connectivity</li>
            <li>Cloud apps, APIs, and dashboards</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
