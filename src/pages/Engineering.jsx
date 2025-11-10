import { Helmet } from "react-helmet-async"

export default function Engineering(){
  return (
    <>
      <Helmet>
        <title>Engineering Services - 3D Ops</title>
        <meta name="description" content="Full-service product engineering: mechanical design, electronics, firmware development, and integration from concept to production." />
      </Helmet>
      <section className="container section">
        <h1>Engineering</h1>
        <p className="lead">Full-service product development from concept to production. Mechanical design, electronics, and firmware engineering.</p>

        <h2>Mechanical Design & Engineering</h2>
        <p>Full-service product development from concept to production. Collaborative design exploration, detailed CAD modeling, and design optimization for manufacturability.</p>
        <ul className="checklist">
          <li>Concept development: Functional requirements, aesthetic goals, and manufacturability assessment</li>
          <li>3D modeling & drafting: Detailed CAD modeling, assemblies, and technical drawings</li>
          <li>Design for Manufacturing (DFM): Optimization across additive, subtractive, and molded processes</li>
          <li>Prototyping & validation: Rapid prototyping and functional testing to refine performance</li>
          <li>Material selection: Guidance on strength, durability, cost, and environmental factors</li>
          <li>Simulation & analysis: Structural and thermal evaluation before production</li>
          <li>Documentation & revision control: Complete design documentation and version tracking</li>
          <li>Lifecycle support: Continuous improvement and redesign services to extend product life and performance</li>
        </ul>

        <h2>Electronics Design</h2>
        <p>Custom electronics solutions for connected products, from sensor integration to complete PCB design and bring-up.</p>
        <ul className="checklist">
          <li>Electronics design: Microcontrollers, sensor integration, and PCB design</li>
          <li>PCB bring-up and validation</li>
          <li>Power management and circuit optimization</li>
          <li>Integration support: Mechanical design integration for electronics, sensors, and enclosures</li>
        </ul>

        <h2>Firmware Development</h2>
        <p>Embedded software for real-time control, connectivity, and device management.</p>
        <ul className="checklist">
          <li>Real-time control systems and embedded software</li>
          <li>Connectivity protocols and network integration</li>
          <li>Device health monitoring and diagnostics</li>
          <li>IoT firmware for cloud-connected devices</li>
          <li>Over-the-air (OTA) update systems</li>
        </ul>

        <h2>Integration & Testing</h2>
        <p>Comprehensive integration services ensuring mechanical, electrical, and firmware components work seamlessly together.</p>
        <ul className="checklist">
          <li>Mechanical assembly and integration</li>
          <li>Functional testing and validation</li>
          <li>Quality control: Dimensional verification and production traceability</li>
          <li>Performance optimization and troubleshooting</li>
        </ul>

        <section className="section band">
          <div className="container">
            <h2>Industries Served</h2>
            <div className="pill-row">
              <span className="pill">Defense</span>
              <span className="pill">Robotics</span>
              <span className="pill">Industrial Equipment</span>
              <span className="pill">Consumer Products</span>
              <span className="pill">R&D</span>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
