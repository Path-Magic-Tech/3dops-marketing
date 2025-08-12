import ContactForm from "../components/ContactForm.jsx"

export default function Contact(){
  return (
    <section className="container section">
      <h1>Get a Quote</h1>
      <p className="lead">Tell us about your part or project. We typically reply within one business day.</p>
      <ContactForm/>
      <div className="muted tiny">You can also email <a href="mailto:hello@3dops.com">hello@3dops.com</a>.</div>
    </section>
  )
}
