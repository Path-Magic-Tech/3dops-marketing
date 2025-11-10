import { Helmet } from "react-helmet-async"

export default function Software(){
  return (
    <>
      <Helmet>
        <title>Software Development — 3D Ops</title>
        <meta name="description" content="Custom software solutions, IoT platforms, e-commerce systems, and advanced visualization. Full-stack development from concept to scale." />
      </Helmet>
      <section className="container section">
        <h1>Software Development</h1>
        <p className="lead">Custom software solutions that integrate seamlessly with hardware products — from cloud-connected IoT platforms to scalable e-commerce systems.</p>

        <h2>Our Team</h2>
        <p>Led by experienced engineers <strong>Kaleb Hundersmarck</strong> and <strong>Conor Souhrada</strong>, our software team partners with innovators to build powerful, modern platforms that integrate seamlessly with hardware products. With deep experience from the startup world—building, launching, and scaling software products from zero to market—we bring both technical expertise and product thinking to every project.</p>
        <p>From robotic construction management to e-commerce platforms, payment processing to IoT systems, our team has delivered mission-critical solutions across industries including biotech, robotics, and consumer tech. We specialize in sophisticated 2D/3D visualization tools, intelligent workflow automation, and scalable systems that drive real business results.</p>

        <h2>Core Software Engineering</h2>
        <p>Full-stack development expertise across modern web, mobile, and cloud platforms.</p>
        <ul className="checklist">
          <li>Full-stack development: React, Vue, Node.js, TypeScript, Ruby on Rails, Python</li>
          <li>Mobile applications: React Native, Swift, Flutter</li>
          <li>Backend systems: RESTful APIs, GraphQL, microservices architecture</li>
          <li>Cloud infrastructure: AWS, Google Cloud, Docker, CI/CD pipelines</li>
          <li>Database design: SQL, NoSQL, MongoDB, Firebase</li>
        </ul>

        <h2>IoT & Hardware Integration</h2>
        <p>Cloud-connected devices, real-time monitoring, and hardware-software integration.</p>
        <ul className="checklist">
          <li>IoT platforms: Cloud-connected devices, Things Stack, AWS IoT, Balena</li>
          <li>Embedded interfaces and sensor platform integration</li>
          <li>Real-time dashboards and monitoring systems</li>
          <li>Device management and fleet control systems</li>
          <li>Data pipelines and analytics platforms</li>
        </ul>

        <h2>Advanced Visualization & Automation</h2>
        <p>Sophisticated 2D/3D visualization and intelligent workflow automation for complex systems.</p>
        <ul className="checklist">
          <li>Advanced 2D/3D visualization: Three.js, Paper.js, Matter.js for robotics and manufacturing</li>
          <li>Intelligent workflow automation and orchestration</li>
          <li>Custom file parsing and system integration (XML, CAD, CSV)</li>
          <li>System optimization and performance engineering</li>
          <li>Automated resource delivery systems</li>
        </ul>

        <h2>E-commerce Solutions</h2>
        <p>Complete e-commerce architecture from checkout and payments to tax, shipping, and fulfillment automation.</p>
        <ul className="checklist">
          <li>Shopify themes & custom storefronts</li>
          <li>Secure payment processing: Stripe integrations and subscription billing</li>
          <li>Fulfillment automation: ShipStation, tax/shipping integrations, ERP systems</li>
          <li>Performance-focused marketing websites and conversion optimization</li>
          <li>SEO, analytics, and growth infrastructure</li>
        </ul>

        <h2>Technology Stack</h2>
        <div className="grid-2">
          <div>
            <h3>Frontend</h3>
            <p>React, Vue.js, Next.js, Tailwind, TypeScript, Three.js, Paper.js, Matter.js</p>
          </div>
          <div>
            <h3>Backend</h3>
            <p>Node.js, Ruby & Ruby on Rails, Python, C languages, SQL/NoSQL, MongoDB, Firebase</p>
          </div>
          <div>
            <h3>Mobile</h3>
            <p>React Native, Swift, Ionic</p>
          </div>
          <div>
            <h3>IoT & Cloud</h3>
            <p>Balena, Things Stack, Amazon IoT, AWS, Google Cloud, Docker</p>
          </div>
        </div>
        <p className="muted">This stack highlights key technologies we work with regularly—we're comfortable adapting to new tools or client-preferred platforms as needed.</p>

        <section className="section band">
          <div className="container">
            <h2>Industries Served</h2>
            <div className="pill-row">
              <span className="pill">Biotech</span>
              <span className="pill">Robotics</span>
              <span className="pill">E-commerce</span>
              <span className="pill">Payment Processing</span>
              <span className="pill">Consumer Tech</span>
              <span className="pill">Industrial Automation</span>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
