import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Clock, Coins, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Investment } from "../hooks/useInvestments";

interface ActiveInvestmentsPageProps {
  tslaBalance: number;
  investments: Investment[];
  computeInterest: (inv: Investment) => number;
  onWithdraw: (id: string) => void;
  onBack: () => void;
  syncMatured: () => void;
}

const PKG_COLORS: Record<string, string> = {
  Signature: "oklch(0.76 0.12 78)",
  Prestige: "oklch(0.70 0.15 280)",
  Elite: "oklch(0.72 0.18 150)",
};

function formatDuration(ms: number): string {
  if (ms <= 0) return "Matured";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
}

function InvestmentCard({
  inv,
  index,
  computeInterest,
  onWithdraw,
}: {
  inv: Investment;
  index: number;
  computeInterest: (i: Investment) => number;
  onWithdraw: (id: string) => void;
}) {
  const [interest, setInterest] = useState(() => computeInterest(inv));
  const endTime = inv.startTime + inv.durationDays * 24 * 60 * 60 * 1000;
  const [remaining, setRemaining] = useState(() => endTime - Date.now());
  const color = PKG_COLORS[inv.packageName] ?? "oklch(0.76 0.12 78)";
  const isActive = inv.status === "active";
  const isMatured = inv.status === "matured";

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setInterest(computeInterest(inv));
      setRemaining(endTime - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, computeInterest, inv, endTime]);

  return (
    <motion.div
      data-ocid={`active_investments.item.${index + 1}` as any}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.95), oklch(0.17 0.008 260))",
        border: `1px solid ${color.replace(")", " / 0.25)")}`,
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color.replace(")", " / 0.08)")} 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg">
              {inv.projectName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                style={{
                  background: `${color.replace(")", " / 0.12)")}`,
                  color,
                  border: `1px solid ${color.replace(")", " / 0.25)")}`,
                  fontSize: "0.7rem",
                }}
              >
                {inv.packageName}
              </Badge>
              <Badge
                style={{
                  background: isActive
                    ? "oklch(0.72 0.18 150 / 0.12)"
                    : isMatured
                      ? "oklch(0.76 0.12 78 / 0.12)"
                      : "oklch(0.40 0.01 260 / 0.3)",
                  color: isActive
                    ? "oklch(0.72 0.18 150)"
                    : isMatured
                      ? "oklch(0.76 0.12 78)"
                      : "oklch(0.55 0.01 260)",
                  border: "none",
                  fontSize: "0.7rem",
                }}
              >
                {isActive ? "● Active" : isMatured ? "✓ Matured" : "Withdrawn"}
              </Badge>
            </div>
          </div>
          {isMatured && (
            <Button
              data-ocid={
                `active_investments.withdraw_button.${index + 1}` as any
              }
              onClick={() => onWithdraw(inv.id)}
              size="sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
                fontWeight: 600,
              }}
            >
              Withdraw to Wallet
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Invested</p>
            <p className="font-mono font-semibold" style={{ color }}>
              {inv.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
              TSLA
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Interest
            </p>
            <p
              className="font-mono font-semibold"
              style={{ color: "oklch(0.72 0.18 150)" }}
            >
              +{interest.toFixed(4)} TSLA
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Duration
            </p>
            <p className="text-xs font-medium text-foreground">
              {isActive
                ? formatDuration(remaining)
                : isMatured
                  ? "Ready to withdraw"
                  : "Completed"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ActiveInvestmentsPage({
  tslaBalance,
  investments,
  computeInterest,
  onWithdraw,
  onBack,
  syncMatured,
}: ActiveInvestmentsPageProps) {
  useEffect(() => {
    const interval = setInterval(syncMatured, 5000);
    syncMatured();
    return () => clearInterval(interval);
  }, [syncMatured]);

  // Maturity detection
  const prevMaturedIds = useRef<Set<string>>(new Set());
  const [justMaturedInv, setJustMaturedInv] = useState<Investment | null>(null);

  useEffect(() => {
    const newlyMatured = investments.filter(
      (inv) => inv.status === "matured" && !prevMaturedIds.current.has(inv.id),
    );
    // Update ref with all currently matured IDs
    const maturedNow = investments
      .filter((inv) => inv.status === "matured")
      .map((inv) => inv.id);
    prevMaturedIds.current = new Set(maturedNow);
    if (newlyMatured.length > 0) {
      setJustMaturedInv(newlyMatured[0]);
    }
  }, [investments]);

  const active = investments.filter(
    (i) => i.status === "active" || i.status === "matured",
  );
  const history = investments.filter((i) => i.status === "withdrawn");

  const maturedInterest = justMaturedInv
    ? justMaturedInv.amount * justMaturedInv.interestRate
    : 0;

  return (
    <div
      data-ocid="active_investments.page"
      className="min-h-screen px-4 sm:px-6 py-10 max-w-4xl mx-auto"
    >
      {/* Maturity Dialog */}
      <Dialog
        open={!!justMaturedInv}
        onOpenChange={(open) => !open && setJustMaturedInv(null)}
      >
        <DialogContent
          data-ocid="maturity.dialog"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.98), oklch(0.16 0.008 260))",
            border: "1px solid oklch(0.76 0.12 78 / 0.3)",
            color: "oklch(0.90 0.01 260)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-2xl font-display font-semibold"
              style={{ color: "oklch(0.76 0.12 78)" }}
            >
              Investment Matured! 🎉
            </DialogTitle>
            <DialogDescription style={{ color: "oklch(0.60 0.01 260)" }}>
              Your investment has reached maturity and is ready to withdraw.
            </DialogDescription>
          </DialogHeader>

          {justMaturedInv && (
            <div className="py-2 space-y-4">
              <div
                className="rounded-xl p-4"
                style={{
                  background: "oklch(0.22 0.015 260 / 0.8)",
                  border: "1px solid oklch(0.76 0.12 78 / 0.15)",
                }}
              >
                <p
                  className="font-display font-semibold text-lg mb-0.5"
                  style={{ color: "oklch(0.76 0.12 78)" }}
                >
                  {justMaturedInv.projectName}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.55 0.01 260)" }}
                >
                  {justMaturedInv.packageName} Package
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: "oklch(0.21 0.012 260)" }}
                >
                  <p
                    className="text-xs text-muted-foreground mb-1"
                    style={{ color: "oklch(0.50 0.01 260)" }}
                  >
                    Invested
                  </p>
                  <p
                    className="font-mono font-semibold text-sm"
                    style={{ color: "oklch(0.85 0.01 260)" }}
                  >
                    {justMaturedInv.amount.toLocaleString()} TSLA
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: "oklch(0.21 0.012 260)" }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: "oklch(0.50 0.01 260)" }}
                  >
                    Interest Earned
                  </p>
                  <p
                    className="font-mono font-semibold text-sm"
                    style={{ color: "oklch(0.72 0.18 150)" }}
                  >
                    +{maturedInterest.toFixed(2)} TSLA
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "oklch(0.76 0.12 78 / 0.08)",
                    border: "1px solid oklch(0.76 0.12 78 / 0.2)",
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: "oklch(0.60 0.10 78)" }}
                  >
                    Total Back
                  </p>
                  <p
                    className="font-mono font-semibold text-sm"
                    style={{ color: "oklch(0.76 0.12 78)" }}
                  >
                    {(justMaturedInv.amount + maturedInterest).toFixed(2)} TSLA
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              data-ocid="maturity.later_button"
              variant="ghost"
              onClick={() => setJustMaturedInv(null)}
              style={{ color: "oklch(0.60 0.01 260)" }}
            >
              Later
            </Button>
            <Button
              data-ocid="maturity.withdraw_button"
              onClick={() => {
                if (justMaturedInv) onWithdraw(justMaturedInv.id);
                setJustMaturedInv(null);
              }}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
                fontWeight: 700,
              }}
            >
              Withdraw to Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Investments
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <h1
          className="text-4xl font-display font-semibold mb-2"
          style={{ color: "oklch(0.76 0.12 78)" }}
        >
          Active Investments
        </h1>
        <p className="text-muted-foreground">
          Track your TSLA Coin investments and growing interest in real time.
        </p>
      </motion.div>

      {/* Balance Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl p-5 mb-8 flex items-center gap-4"
        style={{
          background: "oklch(0.19 0.012 260 / 0.95)",
          border: "1px solid oklch(0.76 0.12 78 / 0.2)",
        }}
      >
        <Coins
          className="w-6 h-6 flex-shrink-0"
          style={{ color: "oklch(0.76 0.12 78)" }}
        />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Available TSLA Balance
          </p>
          <p
            className="font-mono font-semibold text-xl"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            {tslaBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
            TSLA
          </p>
        </div>
      </motion.div>

      {/* Active List */}
      <section className="mb-10">
        <h2 className="font-display font-semibold text-lg mb-4">
          Current Investments
        </h2>
        {active.length === 0 ? (
          <div
            data-ocid="active_investments.empty_state"
            className="rounded-2xl p-10 text-center"
            style={{
              background: "oklch(0.17 0.01 260)",
              border: "1px dashed oklch(0.30 0.015 260)",
            }}
          >
            <TrendingUp
              className="w-10 h-10 mx-auto mb-3 opacity-25"
              style={{ color: "oklch(0.76 0.12 78)" }}
            />
            <p className="text-muted-foreground">No active investments yet.</p>
            <Button
              onClick={onBack}
              className="mt-4"
              style={{
                background: "oklch(0.76 0.12 78 / 0.15)",
                border: "1px solid oklch(0.76 0.12 78 / 0.3)",
                color: "oklch(0.76 0.12 78)",
              }}
            >
              Browse Investment Pools
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {active.map((inv, i) => (
                <InvestmentCard
                  key={inv.id}
                  inv={inv}
                  index={i}
                  computeInterest={computeInterest}
                  onWithdraw={onWithdraw}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-lg mb-4">
            Investment History
          </h2>
          <div className="space-y-3">
            {history.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{
                  background: "oklch(0.17 0.01 260)",
                  border: "1px solid oklch(0.26 0.015 260 / 0.5)",
                }}
              >
                <div>
                  <p className="font-medium text-sm">{inv.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.packageName} · {inv.amount.toLocaleString()} TSLA
                    invested
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-mono text-sm"
                    style={{ color: "oklch(0.72 0.18 150)" }}
                  >
                    +{(inv.amount * inv.interestRate).toFixed(2)} TSLA
                  </p>
                  <p className="text-xs text-muted-foreground">Withdrawn</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
