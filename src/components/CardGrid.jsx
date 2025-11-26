export default function CardGrid({items=[]}){
  return (
    <div className="card-grid">
      {items.map((it, i)=>(
        <article className="card card-static" key={i}>
          <div className="card-icon">{it.icon}</div>
          <h3>{it.title}</h3>
          <p>{it.body}</p>
        </article>
      ))}
    </div>
  )
}