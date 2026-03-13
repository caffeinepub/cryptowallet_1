import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Asset } from "../backend.d";
import { TESLA_INVESTMENTS } from "../data/investments";
import { useBalances } from "../hooks/useQueries";

interface InvestmentsPageProps {
  tslaBalance: number;
  onSelectInvestment: (id: string) => void;
  onViewActive: () => void;
  onSendTSLA: () => void;
  onReceiveTSLA: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Energy: "oklch(0.76 0.12 78)",
  AI: "oklch(0.70 0.15 280)",
  Manufacturing: "oklch(0.72 0.18 150)",
  Infrastructure: "oklch(0.68 0.15 200)",
  "AI & Robotics": "oklch(0.72 0.16 320)",
};

export default function InvestmentsPage({
  tslaBalance,
  onSelectInvestment,
  onViewActive,
  onSendTSLA,
  onReceiveTSLA,
}: InvestmentsPageProps) {
  const { data: balances } = useBalances();
  const walletTslaBalance =
    balances?.find((b) => b.asset === Asset.TSLA)?.balance ?? 0;

  return (
    <div
      data-ocid="investments.page"
      className="min-h-screen px-4 sm:px-6 py-10 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1
          className="text-4xl sm:text-5xl font-display font-semibold tracking-tight mb-3"
          style={{ color: "oklch(0.76 0.12 78)" }}
        >
          Tesla Investment Pools
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Deploy your TSLA Coin into high-impact Tesla ventures. Choose a
          project and tier to start earning interest.
        </p>
      </motion.div>

      {/* TSLA Balance Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl p-6 mb-5 flex items-center justify-between relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.95), oklch(0.17 0.008 260))",
          border: "1px solid oklch(0.76 0.12 78 / 0.25)",
          boxShadow: "0 4px 30px oklch(0.76 0.12 78 / 0.08)",
        }}
      >
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.12 78 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Available TSLA Balance
          </p>
          <p
            className="text-3xl font-mono font-semibold"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            {tslaBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
            <span className="text-lg">TSLA</span>
          </p>
        </div>
        <Button
          data-ocid="investments.active_button"
          onClick={onViewActive}
          className="flex items-center gap-2"
          style={{
            background: "oklch(0.76 0.12 78 / 0.15)",
            border: "1px solid oklch(0.76 0.12 78 / 0.35)",
            color: "oklch(0.76 0.12 78)",
          }}
        >
          <TrendingUp className="w-4 h-4" />
          View Active Investments
        </Button>
      </motion.div>

      {/* TSLA Wallet Mini-Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.45 }}
        className="rounded-xl p-4 mb-8 flex items-center justify-between gap-4"
        style={{
          background: "oklch(0.16 0.01 260)",
          border: "1px solid oklch(0.45 0.18 25 / 0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{
              background: "oklch(0.45 0.18 25 / 0.18)",
              border: "1px solid oklch(0.55 0.18 25 / 0.4)",
              color: "#E31937",
            }}
          >
            T
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              TSLA Wallet
            </p>
            <p
              className="font-mono font-semibold text-sm"
              style={{ color: "oklch(0.92 0.006 90)" }}
            >
              {walletTslaBalance.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-xs text-muted-foreground">TSLA</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="investments.tsla.send_button"
            size="sm"
            onClick={onSendTSLA}
            className="h-8 px-3 text-xs gap-1.5"
            style={{
              background: "oklch(0.76 0.12 78 / 0.12)",
              border: "1px solid oklch(0.76 0.12 78 / 0.3)",
              color: "oklch(0.76 0.12 78)",
            }}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Send TSLA
          </Button>
          <Button
            data-ocid="investments.tsla.receive_button"
            size="sm"
            onClick={onReceiveTSLA}
            className="h-8 px-3 text-xs gap-1.5"
            style={{
              background: "oklch(0.58 0.15 145 / 0.12)",
              border: "1px solid oklch(0.58 0.15 145 / 0.3)",
              color: "oklch(0.68 0.15 145)",
            }}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Receive TSLA
          </Button>
        </div>
      </motion.div>

      {/* Investment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESLA_INVESTMENTS.map((project, i) => {
          const catColor =
            CATEGORY_COLORS[project.category] ?? "oklch(0.76 0.12 78)";
          return (
            <motion.div
              key={project.id}
              data-ocid={`investments.item.${i + 1}` as any}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.07, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -3 }}
              onClick={() => onSelectInvestment(project.id)}
              className="rounded-2xl p-6 cursor-pointer group transition-all duration-300 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.95), oklch(0.17 0.008 260))",
                border: "1px solid oklch(0.30 0.015 260 / 0.6)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 1px ${catColor.replace(")", " / 0.35)")}`,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{project.icon}</span>
                  <Badge
                    className="text-xs font-medium"
                    style={{
                      background: `${catColor.replace(")", " / 0.12)")}`,
                      color: catColor,
                      border: `1px solid ${catColor.replace(")", " / 0.25)")}`,
                    }}
                  >
                    {project.category}
                  </Badge>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                <div
                  className="mt-5 pt-4 border-t flex items-center justify-between"
                  style={{ borderColor: "oklch(0.28 0.015 260 / 0.5)" }}
                >
                  <span className="text-xs text-muted-foreground">
                    3 investment packages
                  </span>
                  <span
                    className="text-xs font-medium group-hover:translate-x-1 transition-transform inline-block"
                    style={{ color: catColor }}
                  >
                    Explore →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
