import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Coins, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  PACKAGES,
  type Package,
  TESLA_INVESTMENTS,
  type TeslaProject,
} from "../data/investments";

interface InvestmentDetailPageProps {
  projectId: string;
  tslaBalance: number;
  onBack: () => void;
  onSelectPackage: (pkg: Package, project: TeslaProject) => void;
}

const PKG_ICONS = ["🥈", "👑", "💎"];

export default function InvestmentDetailPage({
  projectId,
  tslaBalance,
  onBack,
  onSelectPackage,
}: InvestmentDetailPageProps) {
  const project = TESLA_INVESTMENTS.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <div
      data-ocid="investment_detail.page"
      className="min-h-screen px-4 sm:px-6 py-10 max-w-5xl mx-auto"
    >
      {/* Back Button */}
      <motion.button
        type="button"
        data-ocid="investment_detail.back_button"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Investments
      </motion.button>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.95), oklch(0.17 0.008 260))",
          border: "1px solid oklch(0.76 0.12 78 / 0.2)",
        }}
      >
        <div
          className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.12 78 / 0.06) 0%, transparent 70%)",
          }}
        />
        <div className="flex items-start gap-5 relative z-10">
          <span className="text-5xl">{project.icon}</span>
          <div className="flex-1">
            <h1
              className="text-3xl font-display font-semibold tracking-tight mb-2"
              style={{ color: "oklch(0.76 0.12 78)" }}
            >
              {project.name}
            </h1>
            <Badge
              className="mb-3"
              style={{
                background: "oklch(0.76 0.12 78 / 0.12)",
                color: "oklch(0.76 0.12 78)",
                border: "1px solid oklch(0.76 0.12 78 / 0.25)",
              }}
            >
              {project.category}
            </Badge>
            <p className="text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
        {/* TSLA Balance */}
        <div
          className="mt-6 pt-5 border-t flex items-center gap-3"
          style={{ borderColor: "oklch(0.28 0.015 260 / 0.6)" }}
        >
          <Coins className="w-4 h-4" style={{ color: "oklch(0.76 0.12 78)" }} />
          <span className="text-sm text-muted-foreground">
            Your TSLA Balance:
          </span>
          <span
            className="font-mono font-semibold"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            {tslaBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
            TSLA
          </span>
        </div>
      </motion.div>

      {/* Packages */}
      <h2 className="text-xl font-display font-semibold mb-5">
        Choose Your Package
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PACKAGES.map((pkg, i) => {
          const ocid = [
            "investment_detail.signature_button",
            "investment_detail.prestige_button",
            "investment_detail.elite_button",
          ][i];
          const canAfford = tslaBalance >= pkg.minAmount;
          return (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
              className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(160deg, oklch(0.20 0.015 260), oklch(0.16 0.01 260))",
                border: `1px solid ${pkg.color.replace(")", " / 0.3)")}`,
                boxShadow: `0 4px 24px ${pkg.color.replace(")", " / 0.08)")}`,
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${pkg.color.replace(")", " / 0.1)")} 0%, transparent 70%)`,
                }}
              />
              <div className="relative z-10 flex items-center gap-3 mb-1">
                <span className="text-2xl">{PKG_ICONS[i]}</span>
                <div>
                  <h3
                    className="font-display font-bold text-xl"
                    style={{ color: pkg.color }}
                  >
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {pkg.minAmount.toLocaleString()} –{" "}
                    {pkg.maxAmount === Number.POSITIVE_INFINITY
                      ? "Unlimited"
                      : pkg.maxAmount.toLocaleString()}{" "}
                    TSLA
                  </p>
                </div>
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: pkg.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Interest Rate
                  </span>
                  <span
                    className="ml-auto font-mono font-semibold"
                    style={{ color: pkg.color }}
                  >
                    {(pkg.interestRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: pkg.color }} />
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="ml-auto font-mono font-semibold text-foreground">
                    {pkg.durationDays} days
                  </span>
                </div>
                <div
                  className="text-xs text-muted-foreground pt-2 border-t"
                  style={{
                    borderColor: `${pkg.color.replace(")", " / 0.15)")}`,
                  }}
                >
                  Max return:{" "}
                  <span style={{ color: pkg.color }}>
                    {(pkg.interestRate * 100).toFixed(0)}% of invested amount
                  </span>
                </div>
              </div>
              <Button
                data-ocid={ocid as any}
                onClick={() => onSelectPackage(pkg, project)}
                disabled={!canAfford}
                className="relative z-10 w-full mt-auto"
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${pkg.color}, ${pkg.color.replace(")", " / 0.7)")})`
                    : "oklch(0.22 0.01 260)",
                  color: canAfford
                    ? "oklch(0.12 0.01 260)"
                    : "oklch(0.45 0.01 260)",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                {canAfford
                  ? "Select Package"
                  : `Need ${pkg.minAmount.toLocaleString()} TSLA min`}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
