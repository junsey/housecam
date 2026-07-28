import type { Metadata, Route } from "next";
import Link from "next/link";

import { getMonthlySalesHistory } from "@/features/sales/sales-admin.data";

export const metadata: Metadata = { title: "Histórico de ventas" };
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const monthLabel = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const query = await searchParams;
  const data = await getMonthlySalesHistory(query.mes);
  const selectedLabel = formatMonth(data.selectedMonth);
  const selectedYear = data.selectedMonth.slice(0, 4);
  const calendarYears = Array.from(new Set([selectedYear, ...data.months.map((month) => month.month.slice(0, 4))]))
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left));

  return (
    <main className="shell py-10">
      <Link className="admin-back-link" href={"/admin/ventas" as Route}>← Volver a ventas</Link>

      <header className="admin-sales-history-header">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Histórico</p>
          <h1>Ventas por mes</h1>
          <p>Consultá facturación, productos vendidos y ganancia real usando la fecha de confirmación de cada transacción.</p>
        </div>
        <form className="admin-month-picker">
          <label htmlFor="sales-history-month">Ir a un mes</label>
          <div>
            <input id="sales-history-month" name="mes" type="month" defaultValue={data.selectedMonth} />
            <button type="submit">Ver período</button>
          </div>
        </form>
      </header>

      {!data.configured ? (
        <p className="card mt-8 p-6 text-[var(--muted)]">Conectá la base para consultar el histórico de ventas.</p>
      ) : (
        <>
          <section className="admin-sales-calendar" aria-label="Meses con ventas">
            <div className="admin-sales-calendar-heading">
              <div>
                <p>Calendario de actividad</p>
                <h2>Meses registrados</h2>
              </div>
              <span>{data.months.length} {data.months.length === 1 ? "mes" : "meses"} con ventas</span>
            </div>
            {calendarYears.map((year) => (
              <div className="admin-sales-calendar-year" key={year}>
                <h3>{year}</h3>
                <div className="admin-sales-month-grid">
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
                    const month = data.months.find((item) => item.month === monthKey);
                    const active = monthKey === data.selectedMonth;
                    return (
                      <Link
                        className={`admin-sales-month ${active ? "is-active" : ""} ${month ? "has-activity" : "is-empty"}`}
                        href={`/admin/ventas/historico?mes=${monthKey}` as Route}
                        key={monthKey}
                        aria-current={active ? "date" : undefined}
                      >
                        <span>{formatMonth(monthKey)}</span>
                        <strong>{money.format((month?.revenueCents ?? 0) / 100)}</strong>
                        <small>{month?.saleCount ?? 0} {(month?.saleCount ?? 0) === 1 ? "venta" : "ventas"} · {money.format((month?.profitCents ?? 0) / 100)} de ganancia</small>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="admin-sales-period-heading">
            <div>
              <p>Período seleccionado</p>
              <h2>{selectedLabel}</h2>
            </div>
            <span>{data.summary?.saleCount ?? 0} ventas confirmadas</span>
          </section>

          <section className="admin-sales-history-metrics">
            <HistoryMetric label="Facturación" value={money.format((data.summary?.revenueCents ?? 0) / 100)} />
            <HistoryMetric label="Ganancia total" value={money.format((data.summary?.profitCents ?? 0) / 100)} highlight />
            <HistoryMetric label="Costo de productos" value={money.format((data.summary?.productCostCents ?? 0) / 100)} />
            <HistoryMetric label="Gastos" value={money.format((data.summary?.expenseCents ?? 0) / 100)} />
            <HistoryMetric label="Descuentos" value={money.format((data.summary?.discountCents ?? 0) / 100)} />
          </section>

          <section className="card admin-sales-history-section">
            <div className="admin-sales-history-section-heading">
              <div><p>Detalle comercial</p><h2>Productos vendidos</h2></div>
              <span>{data.products.reduce((total, product) => total + product.physicalUnits, 0)} unidades físicas</span>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-sales-history-table">
                <thead><tr><th>Producto</th><th>Marca</th><th>Cantidad</th><th>Unidades</th><th>Facturación</th><th>Costo histórico</th></tr></thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={`${product.storefront}-${product.sku}`}>
                      <td><strong>{product.productName}</strong><small>{product.sku}</small></td>
                      <td>{product.storefront === "housepet" ? "HousePet" : "HouseCam"}</td>
                      <td>{product.quantity}</td>
                      <td>{product.physicalUnits}</td>
                      <td>{money.format(product.revenueCents / 100)}</td>
                      <td>{money.format(product.historicalCostCents / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.products.length && <p className="admin-sales-history-empty">No hay productos vendidos en este mes.</p>}
            </div>
          </section>

          <section className="card admin-sales-history-section">
            <div className="admin-sales-history-section-heading">
              <div><p>Transacciones</p><h2>Ventas del período</h2></div>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-sales-history-table">
                <thead><tr><th>Venta</th><th>Cliente</th><th>Canal</th><th>Facturación</th><th>Ganancia</th><th>Confirmada</th></tr></thead>
                <tbody>
                  {data.sales.map((sale) => (
                    <tr key={sale.id}>
                      <td><Link href={`/admin/ventas/${sale.id}` as Route}>{sale.code ?? `#${sale.saleNumber}`}</Link></td>
                      <td>{sale.customerLabel || "Sin identificar"}</td>
                      <td>{sale.channel}</td>
                      <td>{money.format(sale.finalTotalCents / 100)}</td>
                      <td>{money.format(sale.profitCents / 100)}</td>
                      <td>{sale.confirmedAt?.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.sales.length && <p className="admin-sales-history-empty">No hay transacciones confirmadas en este mes.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function HistoryMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <article className={`card admin-sales-history-metric ${highlight ? "is-highlighted" : ""}`}><p>{label}</p><strong>{value}</strong></article>;
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return "Sin período";
  const label = monthLabel.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
