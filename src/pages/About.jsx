import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import CardGrid from "../components/CardGrid.jsx"

export default function About(){
  return (
    <>
      <Helmet>
        <title>About - 3D Ops</title>
        <meta name="description" content="3D Ops makes advanced manufacturing accessible with end-to-end product development across hardware and software. From concept to scale." />
      </Helmet>
      <section className="container section">
        <h1>About 3D Ops</h1>
        <p className="lead">We make advanced manufacturing accessible and help teams ship real products.</p>
        <p>Our roots are in additive manufacturing, offering affordable metal 3D printing for mainstream manufacturing, and we've expanded to provide end‑to‑end product development across hardware and software. From concept to production, we partner with innovators across defense, industrial, robotics, and consumer sectors to bring ideas to market.</p>

        <section className="section band" style={{marginTop: '48px', marginBottom: '48px'}}>
          <div className="container">
            <div className="grid-2" style={{gap: '32px'}}>
              <div>
                <h2 style={{marginTop: 0}}>Our Mission</h2>
                <p>To transform bold ideas into real-world solutions through full-stack product design, rapid prototyping, and tactical-grade manufacturing, empowering innovators, industries, and defense partners to move from concept to deployment with precision and speed.</p>
              </div>
              <div>
                <h2 style={{marginTop: 0}}>Our Vision</h2>
                <p>To redefine how innovation gets done, faster, smarter, and tougher. Creating a world where every good idea has a path to reality.</p>
              </div>
            </div>
          </div>
        </section>

        <h2>Why Choose 3D Ops</h2>
        <CardGrid items={[
          { title: "Single Partner", body: "One point of contact from concept to scale. No more coordinating multiple vendors.", icon: "🤝" },
          { title: "Full-Stack Expertise", body: "Manufacturing, engineering, software, and fulfillment under one roof.", icon: "⚡" },
          { title: "Startup-Ready Speed", body: "Proven track record in fast-paced environments where iteration and pragmatism are critical.", icon: "🚀" },
          { title: "Industrial Quality", body: "Production-grade results with small-batch flexibility and ROI-driven approach.", icon: "✨" },
        ]} />

        <h2 style={{marginTop: '48px'}}>Complete Capabilities</h2>
        <div className="grid-2" style={{gap: '20px'}}>
          <Link to="/manufacturing" className="card">
            <div className="card-icon">🛠️</div>
            <h3>Manufacturing</h3>
            <p>Metal, polymer, and composite 3D printing with full post-processing and finishing.</p>
          </Link>
          <Link to="/engineering" className="card">
            <div className="card-icon">📐</div>
            <h3>Engineering</h3>
            <p>Mechanical design, electronics, and firmware development from concept to production.</p>
          </Link>
          <Link to="/software" className="card">
            <div className="card-icon">💻</div>
            <h3>Software</h3>
            <p>Full-stack apps, IoT platforms, e-commerce systems, and advanced visualization.</p>
          </Link>
          <Link to="/fulfillment" className="card">
            <div className="card-icon">📦</div>
            <h3>Fulfillment</h3>
            <p>Warehousing, packaging, logistics, and delivery management.</p>
          </Link>
        </div>

        <h2 style={{marginTop: '48px'}}>Our Approach</h2>
        <p>At 3D Ops, we combine technical excellence with practical business thinking. Whether you're developing a new product, scaling production, or building software to support your hardware, we bring the expertise and infrastructure to make it happen efficiently and cost-effectively.</p>
        <p>Our team has deep experience in startup environments where speed, iteration, and pragmatism are critical. We understand the challenges of bringing new products to market and have built our operations to support rapid development cycles without sacrificing quality or reliability.</p>

        <section className="section band" style={{marginTop: '48px'}}>
          <div className="container">
            <h2>Industries We Serve</h2>
            <p>We support innovators across defense, robotics, industrial equipment, aerospace, automotive, consumer products, biotech, e-commerce, and R&D, bringing specialized expertise to each sector.</p>
          </div>
        </section>
      </section>
    </>
  )
}
