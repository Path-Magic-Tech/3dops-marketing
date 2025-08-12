import CardGrid from "../components/CardGrid.jsx"

export default function Services(){
  return (
    <section className="container section">
      <h1>Services</h1>
      <p className="lead">From CAD to code to commerce — we’re a one‑stop shop for hardware and software.</p>

      <h2>Additive Manufacturing</h2>
      <ul className="checklist">
        <li>Metal AM using atomic diffusion/sintering processes</li>
        <li>Engineering‑grade polymers & composites</li>
        <li>DFM review, support generation, post‑processing, QA</li>
      </ul>

      <h2>Product Engineering</h2>
      <ul className="checklist">
        <li>Mechanical design: enclosures, mechanisms, and fixtures</li>
        <li>Electronics: microcontrollers, sensor integration, PCB bring‑up</li>
        <li>Firmware: real‑time control, connectivity, device health</li>
      </ul>

      <h2>Software & Cloud</h2>
      <ul className="checklist">
        <li>Web & mobile apps (React, React Native, Node, Python, Ruby)</li>
        <li>APIs, data pipelines, dashboards, and automation</li>
        <li>CI/CD, DevOps, monitoring, and security</li>
      </ul>

      <h2>E‑commerce</h2>
      <ul className="checklist">
        <li>Shopify themes & custom storefronts</li>
        <li>Payments, subscription billing, fulfillment, and ERP integrations</li>
        <li>SEO, analytics, and conversion optimization</li>
      </ul>

      <h2>How we work</h2>
      <CardGrid items={[
        { title:"1) Discover", body:"Define requirements, constraints, and success metrics." , icon:"🔎"},
        { title:"2) Design", body:"CAD, electronics, and UX/UI — validated with rapid prototypes.", icon:"🧪"},
        { title:"3) Build", body:"AM parts, PCBs, firmware, and software services come together.", icon:"🏗️"},
        { title:"4) Launch", body:"Pilot runs, e‑commerce, and operational readiness for scale.", icon:"🟢"},
      ]}/>
    </section>
  )
}
