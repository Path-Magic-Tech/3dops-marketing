import { useState } from "react"
import emailjs from '@emailjs/browser';

export default function ContactForm(){
  const [state, setState] = useState({ name:"", email:"", phone:"", company:"", message:"" })
  const [sent, setSent] = useState(false)

  function onChange(e){
    setState(s=>({...s,[e.target.name]:e.target.value}))
  }
  function onSubmit(e){
    e.preventDefault()
    const templateParams = { ...state };
    emailjs
      .send('service_e5p2zw8', 'template_dfwdei7', templateParams, { publicKey: 'dEz55kIY-mricyQxF' })
      .then(
        () => {
          console.log('SUCCESS!');
          setSent(true);
        },
        (error) => {
          console.log('FAILED...', error.text);
        }
      );
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
      <label>
        <span>Phone (optional)</span>
        <input name="phone" type="tel" placeholder="(555) 123-4567" value={state.phone} onChange={onChange} pattern="[0-9()+\-\s]{7,}" />
      </label>
      <label>
        <span>Company (optional)</span>
        <input name="company" type="text" placeholder="Company" value={state.company} onChange={onChange} />
      </label>
      <label className="wide">
        <span>How can we help?</span>
        <textarea name="message" rows="6" required value={state.message} onChange={onChange} /> 
      </label>
      <button className="btn" type="submit">Send</button>
    </form>
  )
}
