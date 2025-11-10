import { Link } from "react-router-dom"
import Hero from "../components/Hero.jsx"
import Stat from "../components/Stat.jsx"

export default function Home(){
  return (
    <>
      <Hero
        eyebrow="Your Complete Product Development Partner"
        title="One Partner for Your Entire Journey — Design, Build, Launch"
        subtitle="Building a new product shouldn't mean coordinating multiple vendors. From manufacturing and engineering to software and fulfillment, we guide you through every step—so you can focus on growing your business, not managing suppliers."
        ctaText="Get Started"
      />

      <section className="container section">
        <h2>Why Work With 3D Ops?</h2>
        <p className="lead">Launching a product or company means juggling manufacturers, engineers, developers, and logistics providers. We eliminate that complexity.</p>
        <p>With 3D Ops, you get a single partner who guides you through every phase—from initial design to customer delivery. Whether you're a startup founder, product innovator, or enterprise team, we provide the complete infrastructure to bring your vision to market without the overhead of coordinating multiple vendors.</p>

        <div className="grid-3" style={{marginTop: '32px'}}>
          <Stat label="Lead time" value="5–10 days" />
          <Stat label="Min. batch" value="1+" />
          <Stat label="Tolerances" value="±100μm*" />
        </div>
        <p className="muted tiny">*Typical for small features; tolerances depend on geometry and material.</p>
      </section>

      <section className="container section">
        <h2>Complete Capabilities Under One Roof</h2>
        <div className="card-grid">
          <Link to="/manufacturing" className="card">
            <div className="card-icon">🛠️</div>
            <h3>Manufacturing</h3>
            <p>High-quality 3D printing with metal, polymer, and composite materials—from prototypes to production runs with full post-processing and finishing.</p>
          </Link>
          <Link to="/engineering" className="card">
            <div className="card-icon">📐</div>
            <h3>Engineering</h3>
            <p>Full-service development from CAD modeling to design optimization—mechanical, electronics, firmware, and quality control.</p>
          </Link>
          <Link to="/software" className="card">
            <div className="card-icon">💻</div>
            <h3>Software Development</h3>
            <p>Full-stack web/mobile apps, IoT platforms, real-time dashboards, and advanced 2D/3D visualization systems.</p>
          </Link>
          <Link to="/fulfillment" className="card">
            <div className="card-icon">📦</div>
            <h3>Fulfillment</h3>
            <p>Warehousing, inventory management, packaging, and logistics—from storage to doorstep delivery.</p>
          </Link>
        </div>
      </section>
    </>
  )
}
