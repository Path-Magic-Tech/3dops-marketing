import { Helmet } from "react-helmet-async"

export default function Manufacturing(){
  return (
    <>
      <Helmet>
        <title>Manufacturing Services — 3D Ops</title>
        <meta name="description" content="High-quality additive manufacturing, post-processing, and finishing services. Metal, polymer, and composite 3D printing from prototypes to production." />
      </Helmet>
      <section className="container section">
        <h1>Manufacturing</h1>
        <p className="lead">High-quality additive manufacturing with comprehensive post-processing and finishing services.</p>

        <h2>Additive Manufacturing</h2>
        <p>High-quality 3D printing for prototypes and production components using a range of engineering-grade materials. We support flexible production volumes from one-off prototypes to small- and mid-volume manufacturing runs.</p>
        <ul className="checklist">
          <li>Metal AM using atomic diffusion/sintering processes</li>
          <li>Engineering‑grade polymers & composites for functional and aesthetic applications</li>
          <li>Flexible production from one-off prototypes to small- and mid-volume manufacturing runs</li>
          <li>DFM review, support generation, and design optimization</li>
          <li>Experience with a wide variety of materials suitable for functional and aesthetic applications</li>
        </ul>

        <h2>Post-Processing & Finishing</h2>
        <p>Comprehensive finishing services to achieve production-ready results with precision and consistency.</p>
        <ul className="checklist">
          <li>Surface smoothing, painting, and coating for production-ready results</li>
          <li>Laser engraving and marking for metals, polymers, and composites</li>
          <li>High-accuracy engraving and marking for traceability and branding</li>
          <li>Precision machining, routing, and fabrication for tight-tolerance components</li>
          <li>Assembly, integration, and verification for consistent fit and function</li>
        </ul>

        <h2>Quality & Traceability</h2>
        <p>Controlled processes ensuring repeatable, reliable results for every production run.</p>
        <ul className="checklist">
          <li>Dimensional verification and production traceability</li>
          <li>Quality control processes with documented verification</li>
          <li>Consistent fit, function, and reliability testing</li>
          <li>Tolerance verification: ±100μm typical for small features</li>
        </ul>

        <section className="section band">
          <div className="container">
            <h2>Industries Served</h2>
            <div className="pill-row">
              <span className="pill">Defense</span>
              <span className="pill">Industrial Equipment</span>
              <span className="pill">Robotics</span>
              <span className="pill">Aerospace</span>
              <span className="pill">Automotive</span>
              <span className="pill">Consumer Products</span>
              <span className="pill">R&D</span>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
