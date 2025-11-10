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
            <p>Operations, accountability, and CRM oversight.</p>
          </div>

          <div className="team-member">
            <h3>Jake Berryman</h3>
            <p className="role">Head of Strategy & Growth</p>
            <p>Vision, brand direction, partnerships, and business development.</p>
          </div>

          <div className="team-member">
            <h3>Rob Brown</h3>
            <p className="role">Head of R&D / Systems Engineering</p>
            <p>Electronics, sensor development, and proof-of-concepts.</p>
          </div>

          <div className="team-member">
            <h3>Kaleb Hundersmarck</h3>
            <p className="role">Head of Software & Start-Up Development</p>
            <p>Software products, startup verticals, and site architecture.</p>
          </div>

          <div className="team-member">
            <h3>Skip Curtis</h3>
            <p className="role">Head Technical Writer & Project Support Lead</p>
            <p>Proposals and administrative support.</p>
          </div>

          <div className="team-member">
            <h3>Jared Berryman</h3>
            <p className="role">Head of Fulfillment & Operations</p>
            <p>Quoting, logistics, client handoffs, and support for all verticals.</p>
          </div>

          <div className="team-member">
            <h3>Kaelyb Draper</h3>
            <p className="role">Head of Engineering & Fabrication</p>
            <p>Mechanical design, industrial clients, and shop management.</p>
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
