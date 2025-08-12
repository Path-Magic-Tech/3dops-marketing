const ASSET = (p) => `${import.meta.env.BASE_URL}${p}`

export default function Work(){
  return (
    <section className="container section">
      <h1>Selected Work</h1>
      <p className="lead">A mix of fixtures, housings, and application software. (Representative examples.)</p>
      <div className="gallery">
        <img src={ASSET("images/sample-part-1.svg")} alt="Lattice demo part"/>
        <img src={ASSET("images/sample-part-2.svg")} alt="Bracket demo part"/>
        <img src={ASSET("images/sample-part-3.svg")} alt="Enclosure demo part"/>
      </div>
    </section>
  )
}
