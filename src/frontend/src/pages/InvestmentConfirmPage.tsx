import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CalendarDays, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Package, TeslaProject } from "../data/investments";

interface InvestmentConfirmPageProps {
  project: TeslaProject;
  pkg: Package;
  tslaBalance: number;
  onBack: () => void;
  onConfirm: (amount: number) => void;
}

export default function InvestmentConfirmPage({
  project,
  pkg,
  tslaBalance,
  onBack,
  onConfirm,
}: InvestmentConfirmPageProps) {
  const [amountStr, setAmountStr] = useState(String(pkg.minAmount));
  const amount = Number(amountStr);
  const isValidRange =
    amount >= pkg.minAmount &&
    (pkg.maxAmount === Number.POSITIVE_INFINITY || amount <= pkg.maxAmount);
  const hasBalance = amount <= tslaBalance;
  const isValid = isValidRange && hasBalance && amount > 0;

  const expectedInterest = amount * pkg.interestRate;
  const endDate = new Date(Date.now() + pkg.durationDays * 24 * 60 * 60 * 1000);

  let errorMsg = "";
  if (amount > 0 && !isValidRange) {
    if (amount < pkg.minAmount)
      errorMsg = `Minimum is ${pkg.minAmount.toLocaleString()} TSLA`;
    else errorMsg = `Maximum is ${pkg.maxAmount.toLocaleString()} TSLA`;
  } else if (amount > 0 && !hasBalance) {
    errorMsg = `Insufficient balance (you have ${tslaBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} TSLA)`;
  }

  return (
    <div
      data-ocid="invest_confirm.page"
      className="min-h-screen px-4 sm:px-6 py-10 max-w-xl mx-auto"
    >
      {/* Back */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Packages
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className="text-3xl font-display font-semibold mb-2"
          style={{ color: "oklch(0.76 0.12 78)" }}
        >
          Confirm Investment
        </h1>
        <p className="text-muted-foreground mb-8">
          You are investing in{" "}
          <span className="text-foreground font-medium">{project.name}</span>{" "}
          using the{" "}
          <span style={{ color: pkg.color }} className="font-semibold">
            {pkg.name}
          </span>{" "}
          package.
        </p>

        {/* Amount Input */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "oklch(0.19 0.012 260 / 0.95)",
            border: "1px solid oklch(0.30 0.015 260 / 0.6)",
          }}
        >
          <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">
            Amount to Invest (TSLA)
          </Label>
          <Input
            data-ocid="invest_confirm.amount_input"
            type="number"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            min={pkg.minAmount}
            max={
              pkg.maxAmount === Number.POSITIVE_INFINITY
                ? undefined
                : pkg.maxAmount
            }
            className="font-mono text-lg h-12 bg-secondary border-border"
            style={{ color: "oklch(0.92 0.006 90)" }}
          />
          {errorMsg && (
            <p
              className="text-xs mt-2"
              style={{ color: "oklch(0.65 0.18 30)" }}
            >
              {errorMsg}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Range: {pkg.minAmount.toLocaleString()} –{" "}
            {pkg.maxAmount === Number.POSITIVE_INFINITY
              ? "Unlimited"
              : pkg.maxAmount.toLocaleString()}{" "}
            TSLA
          </p>
        </div>

        {/* Summary Card */}
        <div
          className="rounded-2xl p-6 mb-6 space-y-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.19 0.015 260), oklch(0.16 0.01 260))",
            border: `1px solid ${pkg.color.replace(")", " / 0.25)")}`,
          }}
        >
          <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Investment Summary
          </h3>
          {[
            {
              icon: Wallet,
              label: "Project",
              value: `${project.icon} ${project.name}`,
            },
            {
              icon: TrendingUp,
              label: "Package",
              value: pkg.name,
              color: pkg.color,
            },
            {
              icon: TrendingUp,
              label: "Expected Return",
              value: isValid
                ? `+${expectedInterest.toFixed(2)} TSLA (${(pkg.interestRate * 100).toFixed(0)}%)`
                : "—",
              color: "oklch(0.72 0.18 150)",
            },
            {
              icon: CalendarDays,
              label: "Matures On",
              value: endDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: color ?? "oklch(0.50 0.01 260)" }}
              />
              <span className="text-sm text-muted-foreground">{label}</span>
              <span
                className="ml-auto text-sm font-medium"
                style={color ? { color } : {}}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            data-ocid="invest_confirm.cancel_button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            data-ocid="invest_confirm.confirm_button"
            disabled={!isValid}
            onClick={() => onConfirm(amount)}
            className="flex-1 font-semibold"
            style={{
              background: isValid
                ? `linear-gradient(135deg, ${pkg.color}, ${pkg.color.replace(")", " / 0.7)")})`
                : "oklch(0.22 0.01 260)",
              color: isValid ? "oklch(0.12 0.01 260)" : "oklch(0.45 0.01 260)",
              border: "none",
            }}
          >
            Confirm Investment
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
