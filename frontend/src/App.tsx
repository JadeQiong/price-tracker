import { useEffect, useState } from "react";
import type { PriceRecord } from "./types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA_URL = "/price-tracker/data/price_history.json";

type Tab = "history" | "how-it-works";

function App() {
  const [history, setHistory] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("history");

  useEffect(() => {
    async function loadPriceHistory() {
      try {
        const response = await fetch(DATA_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load price history: ${response.status}`
          );
        }

        const data: PriceRecord[] = await response.json();

        setHistory(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load price history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPriceHistory();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading price history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>No price history available.</div>
      </div>
    );
  }

  const latest = history[history.length - 1];

  const lowestPrice = Math.min(...history.map((record) => record.price));
  const highestPrice = Math.max(...history.map((record) => record.price));

  const chartData = history.map((record) => ({
    date: new Date(record.timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    fullDate: new Date(record.timestamp).toLocaleString(),
    price: record.price,
  }));

  const priceRanges = groupPriceRanges(history);

  interface PriceRange {
    start: string;
    end: string;
    price: number;
  }
  
  function formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  
  function groupPriceRanges(history: PriceRecord[]): PriceRange[] {
    if (history.length === 0) {
      return [];
    }
  
    const ranges: PriceRange[] = [];
  
    let start = history[0];
    let end = history[0];
  
    for (let i = 1; i < history.length; i++) {
      const current = history[i];
  
      if (current.price === end.price) {
        end = current;
      } else {
        ranges.push({
          start: start.timestamp,
          end: end.timestamp,
          price: end.price,
        });
  
        start = current;
        end = current;
      }
    }
  
    ranges.push({
      start: start.timestamp,
      end: end.timestamp,
      price: end.price,
    });
  
    return ranges.reverse();
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.logo}>Price Tracker</div>
            <div style={styles.subtitle}>
              Costco product price monitoring
            </div>
          </div>

          <nav style={styles.nav}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "history" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("history")}
            >
              Price History
            </button>

            <button
              style={{
                ...styles.tab,
                ...(activeTab === "how-it-works"
                  ? styles.activeTab
                  : {}),
              }}
              onClick={() => setActiveTab("how-it-works")}
            >
              How It Works
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.container}>
        {activeTab === "history" ? (
          <>
            <section style={styles.productSection}>
              <div>
                <p style={styles.eyebrow}>COSTCO PRODUCT</p>

                <h1 style={styles.title}>
                  Callaway Edge 10-Piece
                  <br />
                  Golf Club Set
                </h1>

                <p style={styles.description}>
                  Right-handed · Graphite shafts
                </p>
              </div>

              <div style={styles.priceCard}>
                <div style={styles.priceLabel}>Current Price</div>

                <div style={styles.currentPrice}>
                  ${latest.price.toFixed(2)}
                </div>

                <div style={styles.lastChecked}>
                  Checked{" "}
                  {new Date(latest.timestamp).toLocaleString()}
                </div>
              </div>
            </section>

            <section style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Price Checks</div>
                <div style={styles.statValue}>{history.length}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Lowest Price</div>
                <div style={styles.statValue}>
                  ${lowestPrice.toFixed(2)}
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Highest Price</div>
                <div style={styles.statValue}>
                  ${highestPrice.toFixed(2)}
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Price Trend</h2>
                  <p style={styles.sectionDescription}>
                    Historical Costco price over time
                  </p>
                </div>
              </div>

              <div style={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        boxShadow:
                          "0 4px 12px rgba(0, 0, 0, 0.08)",
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullDate ?? ""
                      }
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Price",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#111827"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        fill: "#111827",
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Price History</h2>
                  <p style={styles.sectionDescription}>
                    Every automated price check
                  </p>
                </div>

                <div style={styles.recordCount}>
                  {priceRanges.length} price periods
                </div>
              </div>

              <div style={styles.historyList}>
              {priceRanges.map((range, index) => (
                <div
                  key={`${range.start}-${range.end}`}
                  style={{
                    ...styles.historyRow,
                    ...(index === 0 ? styles.latestHistoryRow : {}),
                  }}
                >
                  <div style={styles.historyDate}>
                    <div style={styles.date}>
                      {formatDateTime(range.start)}
                      {" → "}
                      {formatDateTime(range.end)}
                    </div>

                    {index === 0 && (
                      <div style={styles.currentBadge}>
                        Current
                      </div>
                    )}
                  </div>

                  <div style={styles.historyPrice}>
                    ${range.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            </section>
          </>
        ) : (
          <HowItWorks />
        )}
      </main>

      <footer style={styles.footer}>
        <span>Costco Price Tracker</span>
        <span>·</span>
        <span>Updated automatically every 12 hours</span>
      </footer>
    </div>
  );
}

function HowItWorks() {
  return (
    <>
      <section style={styles.intro}>
        <p style={styles.eyebrow}>UNDER THE HOOD</p>

        <h1 style={styles.title}>
          How this price tracker works
        </h1>

        <p style={styles.introText}>
          This small project automatically checks the Costco product
          price, stores the result, and publishes the history on this
          website. No personal computer or dedicated server needs to
          stay online.
        </p>
      </section>

      <section style={styles.steps}>
        <Step
          number="01"
          title="Fetch the product page"
          description="Every 12 hours, GitHub Actions starts a Python job. The job asks Anakin's URL Scraper to retrieve the Costco product page."
        />

        <Step
          number="02"
          title="Extract the price"
          description="The Python script reads the returned HTML and extracts the current Costco price from the product page."
        />

        <Step
          number="03"
          title="Save the history"
          description="The new price and timestamp are appended to a JSON file in the GitHub repository. Each check becomes a new historical record."
        />

        <Step
          number="04"
          title="Build & publish"
          description="After the price update, GitHub automatically builds the React website and deploys the latest data to GitHub Pages."
        />
      </section>

      <section style={styles.architectureCard}>
        <h2 style={styles.sectionTitle}>System Architecture</h2>

        <div style={styles.flow}>
          <FlowBox
            title="Costco"
            subtitle="Product page"
          />

          <FlowArrow />

          <FlowBox
            title="Anakin"
            subtitle="URL Scraper"
          />

          <FlowArrow />

          <FlowBox
            title="GitHub Actions"
            subtitle="Python + automation"
          />

          <FlowArrow />

          <FlowBox
            title="GitHub"
            subtitle="JSON history"
          />

          <FlowArrow />

          <FlowBox
            title="GitHub Pages"
            subtitle="React website"
          />
        </div>
      </section>

      <section style={styles.techCard}>
        <h2 style={styles.sectionTitle}>Technology</h2>

        <div style={styles.techGrid}>
          <TechItem
            name="Python"
            description="Fetches and processes price data"
          />

          <TechItem
            name="Anakin URL Scraper"
            description="Retrieves the Costco webpage"
          />

          <TechItem
            name="GitHub Actions"
            description="Runs the tracker every 12 hours"
          />

          <TechItem
            name="React + TypeScript"
            description="Powers this dashboard"
          />

          <TechItem
            name="Recharts"
            description="Visualizes price history"
          />

          <TechItem
            name="GitHub Pages"
            description="Hosts the website"
          />
        </div>
      </section>

      <section style={styles.simpleNote}>
        <div style={styles.noteIcon}>✓</div>

        <div>
          <h3 style={styles.noteTitle}>
            No server required
          </h3>

          <p style={styles.noteText}>
            The entire system runs using GitHub Actions and GitHub
            Pages. The project does not require a VPS, a custom
            domain, or a computer running continuously at home.
          </p>

          <p style={styles.footerNote}>
            💕
          </p>
        </div>
      </section>
    </>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.step}>
      <div style={styles.stepNumber}>{number}</div>

      <div>
        <h3 style={styles.stepTitle}>{title}</h3>
        <p style={styles.stepDescription}>{description}</p>
      </div>
    </div>
  );
}

function FlowBox({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={styles.flowBox}>
      <div style={styles.flowTitle}>{title}</div>
      <div style={styles.flowSubtitle}>{subtitle}</div>
    </div>
  );
}

function FlowArrow() {
  return <div style={styles.arrow}>→</div>;
}

function TechItem({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div style={styles.techItem}>
      <div style={styles.techName}>{name}</div>
      <div style={styles.techDescription}>{description}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7f9",
    color: "#111827",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },

  headerContent: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "22px 24px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
  },

  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 13,
    color: "#6b7280",
  },

  nav: {
    display: "flex",
    gap: 4,
  },

  tab: {
    border: "none",
    background: "transparent",
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },

  activeTab: {
    color: "#111827",
    borderBottom: "2px solid #111827",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 24px 60px",
  },

  productSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 40,
    marginBottom: 28,
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "1.2px",
    color: "#6b7280",
  },

  title: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.2,
    letterSpacing: "-0.8px",
    color: "#111827",
  },

  description: {
    marginTop: 12,
    marginBottom: 0,
    color: "#6b7280",
    fontSize: 15,
  },

  priceCard: {
    minWidth: 220,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
  },

  priceLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },

  currentPrice: {
    fontSize: 34,
    fontWeight: 750,
    letterSpacing: "-1px",
  },

  lastChecked: {
    marginTop: 8,
    fontSize: 11,
    color: "#9ca3af",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 20,
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "18px 20px",
  },

  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },

  statValue: {
    fontSize: 21,
    fontWeight: 700,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.025)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },

  sectionDescription: {
    margin: "5px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },

  chart: {
    width: "100%",
    height: 360,
  },

  recordCount: {
    fontSize: 12,
    color: "#6b7280",
    background: "#f3f4f6",
    borderRadius: 999,
    padding: "6px 10px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
  },

  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 12px",
    borderTop: "1px solid #f0f1f3",
    borderRadius: 8,
  },

  latestHistoryRow: {
    background: "#f8fafc",
  },

  historyDate: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },

  date: {
    fontSize: 14,
    fontWeight: 600,
  },

  time: {
    fontSize: 13,
    color: "#9ca3af",
  },

  historyPrice: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },

  intro: {
    maxWidth: 760,
    marginBottom: 42,
  },

  introText: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 1.7,
    color: "#6b7280",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  step: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 24,
    display: "flex",
    gap: 18,
  },

  stepNumber: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "#9ca3af",
    paddingTop: 2,
  },

  stepTitle: {
    margin: 0,
    fontSize: 17,
  },

  stepDescription: {
    margin: "8px 0 0",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#6b7280",
  },

  architectureCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 28,
    marginBottom: 20,
  },

  flow: {
    marginTop: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  flowBox: {
    minWidth: 125,
    textAlign: "center",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "14px 12px",
  },

  flowTitle: {
    fontSize: 14,
    fontWeight: 700,
  },

  flowSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#6b7280",
  },

  arrow: {
    fontSize: 20,
    color: "#9ca3af",
  },

  techCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 28,
    marginBottom: 20,
  },

  techGrid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },

  techItem: {
    background: "#f8fafc",
    borderRadius: 10,
    padding: 16,
  },

  techName: {
    fontSize: 14,
    fontWeight: 700,
  },

  techDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#6b7280",
  },

  simpleNote: {
    display: "flex",
    gap: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 22,
  },

  noteIcon: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },

  noteTitle: {
    margin: 0,
    fontSize: 15,
  },

  noteText: {
    margin: "6px 0 0",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#6b7280",
  },

  footer: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px 30px",
    display: "flex",
    justifyContent: "center",
    gap: 8,
    fontSize: 12,
    color: "#9ca3af",
  },

  loading: {
    padding: 80,
    textAlign: "center",
    color: "#6b7280",
  },

  error: {
    maxWidth: 600,
    margin: "80px auto",
    padding: 20,
    color: "#991b1b",
    background: "#fef2f2",
    borderRadius: 10,
  },

  footerNote: {
    marginTop: 32,
    paddingBottom: 24,
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
};

export default App;