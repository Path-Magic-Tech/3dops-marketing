import { Helmet } from "react-helmet-async"

export default function Manufacturing(){
  return (
    <>
      <Helmet>
        <title>Manufacturing Services - 3D Ops</title>
        <meta name="description" content="Production-quality 3D printing across PLA, PETG, ABS, Nylon, Polycarbonate, TPU, and carbon/glass fiber reinforced materials. Prototypes to production runs." />
      </Helmet>
      <section className="container section">
        <h1>Manufacturing</h1>
        <p className="lead">Production-quality 3D printing across plastics, composites, and flexible materials - from prototypes to production runs.</p>

        <h2>Additive Manufacturing</h2>
        <p>We deliver production-quality 3D printing using modern additive manufacturing technologies across a broad range of engineering-grade materials. Whether you need a single prototype or a full production run, we have the capacity and expertise to deliver.</p>
        <ul className="checklist">
          <li>FDM / FFF printing with multi-material capabilities</li>
          <li>Carbon fiber and glass fiber reinforced composites</li>
          <li>DMLS (Direct Metal Laser Sintering)</li>
          <li>SLM (Selective Laser Melting)</li>
          <li>Bound metal processes (ADAM)</li>
          <li>Flexible production from one-off prototypes to mid-volume manufacturing</li>
          <li>Design for Additive Manufacturing (DfAM) optimization</li>
        </ul>

        <h2>Materials</h2>
        <p>We work with a comprehensive range of materials to match your application requirements - from general-purpose plastics to high-performance engineering polymers and metals.</p>
        <div className="pill-row" style={{marginBottom: '24px'}}>
          <span className="pill">PLA / PLA-CF</span>
          <span className="pill">PETG / PETG-CF</span>
          <span className="pill">ABS / ASA</span>
          <span className="pill">Nylon (PA-CF)</span>
          <span className="pill">Polycarbonate</span>
          <span className="pill">TPU Flexible</span>
          <span className="pill">Carbon Fiber</span>
          <span className="pill">Glass Fiber</span>
          <span className="pill">Stainless Steel</span>
          <span className="pill">Tool Steel</span>
          <span className="pill">Titanium</span>
        </div>

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
              <span className="pill">Infrastructure</span>
              <span className="pill">Consumer Products</span>
              <span className="pill">R&D</span>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
