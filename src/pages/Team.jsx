import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"

export default function Team(){
  return (
    <>
      <Helmet>
        <title>Our Team - 3D Ops</title>
        <meta name="description" content="Meet the 3D Ops team. Expert leadership across operations, engineering, software, fulfillment, and business development." />
      </Helmet>
      <section className="container section">
        <h1>Our Team</h1>
        <p className="lead">Expert leadership across every aspect of product development and delivery.</p>
        <p>Our team brings together deep expertise in manufacturing, engineering, software development, and operations. From initial concept to market delivery, we work together to guide you through every step of bringing your product to life.</p>

        <div className="team-grid">
          <div className="team-member">
            <h3>Conor Souhrada</h3>
            <p className="role">Chief Executive Officer</p>
            <p>Conor ensures every project runs smoothly from start to finish. He oversees operations, keeps teams aligned, and maintains direct accountability to your timeline and budget.</p>
          </div>

          <div className="team-member">
            <h3>Jake Berryman</h3>
            <p className="role">Head of Strategy & Growth</p>
            <p>Jake helps you define your product strategy and go-to-market approach. He works with clients to build partnerships, refine positioning, and identify opportunities that accelerate growth.</p>
          </div>

          <div className="team-member">
            <h3>Rob Brown</h3>
            <p className="role">Head of R&D / Systems Engineering</p>
            <p>Rob turns ambitious technical concepts into working prototypes. He leads electronics design, sensor integration, and proof-of-concept development for complex hardware systems.</p>
          </div>

          <div className="team-member">
            <h3>Kaleb Hundersmarck</h3>
            <p className="role">Head of Software & Start-Up Development</p>
            <p>Kaleb builds the software that powers your product. From IoT platforms and dashboards to e-commerce systems, he delivers full-stack solutions designed for speed and scalability.</p>
          </div>

          <div className="team-member">
            <h3>Skip Curtis</h3>
            <p className="role">Head Technical Writer & Project Support Lead</p>
            <p>Skip transforms technical complexity into clear documentation. He manages proposals, technical writing, and project coordination to keep your team informed and aligned.</p>
          </div>

          <div className="team-member">
            <h3>Jared Berryman</h3>
            <p className="role">Head of Fulfillment & Operations</p>
            <p>Jared makes sure your product reaches customers on time. He handles quoting, logistics, warehousing, and fulfillment across all verticals with precision and reliability.</p>
          </div>

          <div className="team-member">
            <h3>Kaelyb Draper</h3>
            <p className="role">Head of Engineering & Fabrication</p>
            <p>Kaelyb brings your designs to life through expert mechanical engineering and fabrication. He manages manufacturing operations and serves as the primary technical lead for industrial clients.</p>
          </div>
        </div>

        <section className="section band" style={{marginTop: '48px'}}>
          <div className="container">
            <h2>Work With Us</h2>
            <p>Ready to bring your product to life? Our team is here to guide you through every step of the journey.</p>
            <p><Link to="/contact" className="btn">Get Started</Link></p>
          </div>
        </section>
      </section>
    </>
  )
}
