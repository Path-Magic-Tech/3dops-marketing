import { Helmet } from "react-helmet-async"

export default function Fulfillment(){
  return (
    <>
      <Helmet>
        <title>Fulfillment Services - 3D Ops</title>
        <meta name="description" content="Flexible fulfillment solutions: warehousing, inventory management, packaging, and logistics. From storage to doorstep delivery." />
      </Helmet>
      <section className="container section">
        <h1>Fulfillment Services</h1>
        <p className="lead">Flexible, technology-driven fulfillment solutions that bridge the gap between production and delivery.</p>

        <p>At 3D Ops, we provide fulfillment operations built to scale with your business, whether you need on-demand order processing, scheduled batch shipments, or a hybrid model that balances both. We manage warehousing, inventory, packaging, and logistics with precision, ensuring every product is stored, handled, and shipped exactly as intended.</p>

        <h2>Warehousing & Inventory Management</h2>
        <p>Secure warehouse with real-time tracking and serialized control for complete visibility and accountability.</p>
        <ul className="checklist">
          <li>Secure warehouse with climate-controlled storage options</li>
          <li>Real-time inventory tracking and management systems</li>
          <li>Serialized control and lot tracking for traceability</li>
          <li>Efficient pick–pack–ship operations</li>
          <li>On-demand and scheduled batch fulfillment</li>
        </ul>

        <h2>Packaging & Branding</h2>
        <p>Complete customization in packaging and labeling for a polished, professional finish.</p>
        <ul className="checklist">
          <li>Custom packaging design and implementation</li>
          <li>Branding integration and co-packing services</li>
          <li>Laser marking and engraving for professional finishing</li>
          <li>Kitting and light assembly services</li>
          <li>Product protection and presentation optimization</li>
        </ul>

        <h2>Shipping & Logistics</h2>
        <p>Domestic and international shipping with full visibility from our facility to your customer.</p>
        <ul className="checklist">
          <li>Partnerships with major carriers and freight services</li>
          <li>Domestic and international shipping options</li>
          <li>Full shipment tracking and visibility</li>
          <li>Expedited and economy shipping tiers</li>
          <li>White-label shipping for branded customer experience</li>
        </ul>

        <h2>Returns & Reverse Logistics</h2>
        <p>Seamless end-to-end experience including returns management and restocking.</p>
        <ul className="checklist">
          <li>Returns processing and inspection</li>
          <li>Reverse logistics management</li>
          <li>Restocking and inventory reconciliation</li>
          <li>Product evaluation and quality reporting</li>
        </ul>

        <h2>Flexible Solutions</h2>
        <p>Whether we're handling products we manufacture or managing your external product lines, 3D Ops delivers a fulfillment solution that prioritizes quality, reliability, and speed. You can focus on growing your business while we handle everything from storage to doorstep.</p>

        <section className="section band">
          <div className="container">
            <h2>Fulfillment Models</h2>
            <div className="pill-row">
              <span className="pill">On-Demand Processing</span>
              <span className="pill">Batch Shipments</span>
              <span className="pill">Hybrid Fulfillment</span>
              <span className="pill">Subscription Management</span>
              <span className="pill">Dropshipping</span>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
