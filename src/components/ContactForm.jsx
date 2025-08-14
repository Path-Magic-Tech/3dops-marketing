import { useState } from "react"

export default function ContactForm(){
  const [state, setState] = useState({ name:"", email:"", message:"" })
  const [sent, setSent] = useState(false)

  function onChange(e){
    setState(s=>({...s,[e.target.name]:e.target.value}))
  }
  function onSubmit(e){
    e.preventDefault()
    // In production, POST to your backend or a form service like Formspark/Formspree.
    setSent(true)
  }

  if(sent){
    return <div className="notice">Thanks! We'll get back to you within one business day.</div>
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input name="name" required value={state.name} onChange={onChange} />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" required value={state.email} onChange={onChange} /> 
      </label>
      <label className="wide">
        <span>How can we help?</span>
        <textarea name="message" rows="6" required value={state.message} onChange={onChange} /> 
      </label>
      <button className="btn" type="submit">Send</button>
    </form>
  )
}
