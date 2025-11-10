import { Link } from "react-router-dom"
import CardGrid from "../components/CardGrid.jsx"
import { Helmet } from "react-helmet-async"

export default function Services(){
  return (
    <>
      <Helmet>
        <title>Services - 3D Ops</title>
        <meta name="description" content="From CAD to code to commerce. Manufacturing, engineering, software development, and fulfillment services. One partner from concept to scale." />
      </Helmet>
      <section className="container section">
        <h1>Services</h1>
        <p className="lead">Everything you need to bring your product to market, under one roof, guided by one team.</p>
        <p>We partner with you through every phase of product development, eliminating the complexity of coordinating multiple vendors. From initial concept to customer delivery, our integrated approach ensures faster iteration, better communication, and a smoother path to market.</p>

        <h2>Our Capabilities</h2>
        <div className="card-grid">
          <Link to="/manufacturing" className="card">
            <div className="card-icon">🛠️</div>
            <h3>Manufacturing</h3>
            <p>Additive manufacturing, post-processing, finishing, and quality control. Metal, polymer, and composite 3D printing from prototypes to production.</p>
          </Link>
          <Link to="/engineering" className="card">
            <div className="card-icon">📐</div>
            <h3>Engineering</h3>
            <p>Mechanical design, electronics, and firmware development. Full-service product engineering from concept to production.</p>
          </Link>
          <Link to="/software" className="card">
            <div className="card-icon">💻</div>
            <h3>Software Development</h3>
            <p>Custom software solutions, IoT platforms, e-commerce systems, and advanced visualization. Full-stack development expertise.</p>
          </Link>
          <Link to="/fulfillment" className="card">
            <div className="card-icon">📦</div>
            <h3>Fulfillment</h3>
            <p>Warehousing, inventory management, packaging, and logistics. Flexible fulfillment from storage to doorstep delivery.</p>
          </Link>
        </div>

        <h2>How We Partner With You</h2>
        <p>Our process is designed to guide you from initial concept to successful market delivery, with expert support at every stage.</p>
        <CardGrid items={[
          { title:"1) Discover & Strategize", body:"We start by understanding your vision, market constraints, and success metrics, ensuring alignment before any work begins." , icon:"🔎"},
          { title:"2) Design & Validate", body:"Collaborative design with rapid prototyping to prove concepts. CAD, electronics, and UX/UI validated through real-world testing.", icon:"🧪"},
          { title:"3) Build & Integrate", body:"Manufacturing, PCBs, firmware, and software services come together under coordinated project management.", icon:"🏗️"},
          { title:"4) Launch & Support", body:"Pilot runs, fulfillment setup, e‑commerce deployment, and ongoing optimization to ensure market success.", icon:"🟢"},
        ]}/>
      </section>
    </>
  )
}
