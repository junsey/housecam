export default function ProductLoading() {
  return <main className="product-detail-main product-loading" aria-label="Cargando producto">
    <div className="container">
      <div className="product-loading-breadcrumb" />
      <div className="product-detail-layout">
        <div className="product-loading-gallery" />
        <div className="product-loading-panel" />
      </div>
    </div>
  </main>;
}
