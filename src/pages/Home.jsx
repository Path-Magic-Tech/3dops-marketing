import Hero from "../components/Hero.jsx"
import CardGrid from "../components/CardGrid.jsx"
import Stat from "../components/Stat.jsx"

export default function Home(){
  return (
    <>
      <Hero
        eyebrow="Additive Manufacturing"
        title="Metal 3D printing for mainstream manufacturing"
        subtitle="We offer affordable, production-grade metal parts using ADAM-like diffusion processes—alongside plastics and composites—plus end‑to‑end product development from prototype to scale."
        ctaText="Get a Quote"
      />

      <section className="container section">
        <div className="grid-3">
          <Stat label="Lead time" value="5–10 days" />
          <Stat label="Min. batch" value="1+" />
          <Stat label="Tolerances" value="±100μm*" />
        </div>
        <p className="muted tiny">*Typical for small features; tolerances depend on geometry and material.</p>
      </section>

      <section className="container section">
        <h2>What we build</h2>
        <CardGrid items={[
          { title: "Metal & Polymer AM", body: "Affordable sintered metal parts and precise polymer prints for fixtures, jigs, prototypes, and end-use components.", icon: "🛠️" },
          { title: "Hardware & Enclosures", body: "CNC finishing, post‑processing, and rugged housings built for the field.", icon: "🧩" },
          { title: "Electronics & Firmware", body: "Embedded systems, sensors, and firmware development for connected products.", icon: "📡" },
          { title: "Cloud & Apps", body: "Web/mobile software, internal tools, and data dashboards to run your product.", icon: "☁️" },
          { title: "E‑commerce", body: "Shopify themes & custom storefronts, fulfillment integrations, and subscription billing.", icon: "🛒" },
          { title: "Prototyping to Production", body: "One partner from CAD → DFM → pilot runs → production ramp and ongoing ops.", icon: "🚀" },
        ]} />
      </section>

      <section className="section band">
        <div className="container">
          <h2>Industries</h2>
          <div className="pill-row">
            <span className="pill">Robotics</span>
            <span className="pill">Aerospace</span>
            <span className="pill">Medical & Dental Models</span>
            <span className="pill">Automotive</span>
            <span className="pill">Industrial</span>
            <span className="pill">Consumer</span>
          </div>
        </div>
      </section>
    </>
  )
}
