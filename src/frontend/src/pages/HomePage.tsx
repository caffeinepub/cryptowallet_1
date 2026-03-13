import type { AppPage } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Check,
  ChevronRight,
  Copy,
  Globe,
  Lock,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface HomePageProps {
  setPage: (p: AppPage) => void;
}

const TSLA_CONTRACT = "0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4";

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "#627EEA" },
  { symbol: "BNB", name: "Binance Coin", icon: "◈", color: "#F3BA2F" },
  { symbol: "SOL", name: "Solana", icon: "◎", color: "#9945FF" },
  { symbol: "USDT", name: "Tether", icon: "$", color: "#26A17B" },
  {
    symbol: "TSLA",
    name: "TSLA Coin",
    icon: "T",
    color: "oklch(0.76 0.12 78)",
  },
];

const AI_FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Financial Advisory",
    desc: "Intelligent recommendations powered by machine learning models that adapt to your portfolio and risk profile in real time.",
    color: "oklch(0.70 0.15 280)",
  },
  {
    icon: TrendingUp,
    title: "Predictive Market Analysis",
    desc: "Advanced predictive algorithms analyze on-chain data and market signals to surface insights before the crowd.",
    color: "oklch(0.68 0.15 145)",
  },
  {
    icon: Zap,
    title: "AI-Driven Portfolio Management",
    desc: "Automated rebalancing and yield optimization strategies execute seamlessly within your risk parameters.",
    color: "oklch(0.76 0.12 78)",
  },
];

const SECURITY_CARDS = [
  {
    icon: Shield,
    title: "On-Chain Authentication",
    desc: "Identity verification powered by Internet Computer cryptography. No passwords, no breaches.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "Every transaction and data point encrypted at rest and in transit using military-grade protocols.",
  },
  {
    icon: Globe,
    title: "Decentralized Custody",
    desc: "Your keys, your assets. Non-custodial architecture ensures you always maintain sovereign control.",
  },
];

function SectionTag({ text }: { text: string }) {
  return (
    <div className="flex justify-center mb-4">
      <span
        className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full"
        style={{
          color: "oklch(0.76 0.12 78)",
          background: "oklch(0.76 0.12 78 / 0.1)",
          border: "1px solid oklch(0.76 0.12 78 / 0.25)",
        }}
      >
        {text}
      </span>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function HomePage({ setPage }: HomePageProps) {
  const [copied, setCopied] = useState(false);

  const copyContract = () => {
    navigator.clipboard.writeText(TSLA_CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-24">
        {/* Ambient glow layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 30%, oklch(0.22 0.04 78 / 0.18), transparent), radial-gradient(ellipse 50% 40% at 80% 70%, oklch(0.18 0.03 250 / 0.14), transparent), radial-gradient(ellipse 40% 30% at 10% 80%, oklch(0.20 0.05 280 / 0.10), transparent)",
          }}
        />

        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.76 0.12 78) 1px, transparent 1px), linear-gradient(90deg, oklch(0.76 0.12 78) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Badge
              className="text-xs font-mono px-3 py-1"
              style={{
                background: "oklch(0.76 0.12 78 / 0.12)",
                border: "1px solid oklch(0.76 0.12 78 / 0.3)",
                color: "oklch(0.76 0.12 78)",
              }}
            >
              Powered by JUVENTUS SOPS · Native TSLA Coin
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.1 }}
          >
            <span className="gold-shimmer">TRUPTARWallet</span>
            <br />
            <span className="text-foreground/90">Powering the Future of</span>
            <br />
            <span style={{ color: "oklch(0.76 0.12 78)" }}>
              AI-Driven Finance.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg font-light mb-10 max-w-2xl mx-auto"
            style={{ color: "oklch(0.65 0.01 90)" }}
          >
            Securely manage digital assets and participate in the TSLA Coin
            ecosystem — where intelligent systems and decentralized finance
            converge.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              data-ocid="hero.primary_button"
              onClick={() => setPage("dashboard")}
              className="h-12 px-8 text-sm font-semibold tracking-wide w-full sm:w-auto"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
                boxShadow: "0 4px 24px oklch(0.76 0.12 78 / 0.35)",
              }}
            >
              Create Wallet
            </Button>
            <Button
              data-ocid="hero.secondary_button"
              onClick={() => setPage("dashboard")}
              variant="outline"
              className="h-12 px-8 text-sm font-semibold w-full sm:w-auto"
              style={{
                borderColor: "oklch(0.76 0.12 78 / 0.4)",
                color: "oklch(0.76 0.12 78)",
                background: "oklch(0.76 0.12 78 / 0.05)",
              }}
            >
              Access Dashboard
            </Button>
            <Button
              data-ocid="hero.link"
              onClick={() => setPage("about-tsla")}
              variant="ghost"
              className="h-12 px-6 text-sm w-full sm:w-auto"
              style={{ color: "oklch(0.65 0.01 90)" }}
            >
              Learn About TSLA Coin
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: "6+", label: "Supported Assets" },
              { value: "100%", label: "Non-Custodial" },
              { value: "AI-First", label: "Architecture" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="font-display font-bold text-2xl"
                  style={{ color: "oklch(0.76 0.12 78)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About TRUPTARWallet ──────────────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <SectionTag text="About TRUPTARWallet" />
            <h2 className="text-center font-display font-bold text-3xl sm:text-4xl mb-6">
              The Secure Gateway to
              <br />
              <span style={{ color: "oklch(0.76 0.12 78)" }}>
                Intelligent Finance
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={1}
            className="relative rounded-2xl p-8 sm:p-12 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.025 78 / 0.5), oklch(0.16 0.012 260 / 0.8))",
              border: "1px solid oklch(0.76 0.12 78 / 0.18)",
              boxShadow:
                "0 0 60px oklch(0.76 0.12 78 / 0.05), 0 20px 60px oklch(0 0 0 / 0.3)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, oklch(0.76 0.12 78 / 0.07), transparent 70%)",
              }}
            />
            <div className="relative z-10 grid sm:grid-cols-2 gap-8">
              <div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "oklch(0.75 0.01 90)" }}
                >
                  TRUPTARWallet is the secure gateway to the TSLA Coin
                  ecosystem, built by{" "}
                  <strong style={{ color: "oklch(0.76 0.12 78)" }}>
                    JUVENTUS SOPS
                  </strong>{" "}
                  to bridge intelligent finance and digital asset management.
                </p>
                <p
                  className="text-base leading-relaxed mt-4"
                  style={{ color: "oklch(0.65 0.01 90)" }}
                >
                  Every feature is designed around the principle that financial
                  sovereignty and artificial intelligence should work in harmony
                  — giving you the tools to navigate tomorrow's economy today.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Non-Custodial Security", value: "100%" },
                  { label: "AI Model Integration", value: "Active" },
                  { label: "Ecosystem Assets", value: "6 Supported" },
                  { label: "Founded By", value: "JUVENTUS SOPS" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: "oklch(0.26 0.015 260 / 0.5)" }}
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-medium font-mono"
                      style={{ color: "oklch(0.76 0.12 78)" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TSLA Coin Ecosystem ──────────────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <SectionTag text="TSLA Coin Ecosystem" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              The Native Token of the
              <br />
              <span style={{ color: "oklch(0.76 0.12 78)" }}>
                TRUPTAR Ecosystem
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              TSLA Coin is the core economic engine powering decentralized AI
              services, value exchange, and ecosystem governance.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={1}
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "oklch(0.17 0.01 260)",
              border: "1px solid oklch(0.76 0.12 78 / 0.25)",
              boxShadow:
                "0 0 40px oklch(0.76 0.12 78 / 0.08), inset 0 1px 0 oklch(0.76 0.12 78 / 0.12)",
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{
                  background: "oklch(0.76 0.12 78 / 0.15)",
                  border: "1px solid oklch(0.76 0.12 78 / 0.35)",
                  color: "oklch(0.76 0.12 78)",
                }}
              >
                T
              </div>
              <div>
                <h3
                  className="font-display font-bold text-xl"
                  style={{ color: "oklch(0.76 0.12 78)" }}
                >
                  TSLA Coin
                </h3>
                <p className="text-sm text-muted-foreground">
                  Native token · Ethereum Network · ERC-20
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "oklch(0.72 0.01 90)" }}
            >
              Developed by JUVENTUS SOPS, TSLA Coin bridges financial technology
              and artificial intelligence — serving as the primary utility token
              for AI-powered tools, a reward mechanism for ecosystem
              participants, and the transactional currency for AI computation
              marketplaces.
            </p>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{
                background: "oklch(0.14 0.008 260)",
                border: "1px solid oklch(0.26 0.015 260)",
              }}
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono flex-shrink-0">
                Contract
              </span>
              <span
                className="font-mono text-xs flex-1 truncate"
                style={{ color: "oklch(0.76 0.12 78)" }}
              >
                {TSLA_CONTRACT}
              </span>
              <button
                type="button"
                onClick={copyContract}
                className="flex-shrink-0 p-1.5 rounded-md transition-colors"
                style={{
                  color: copied
                    ? "oklch(0.68 0.15 145)"
                    : "oklch(0.55 0.01 90)",
                  background: "oklch(0.20 0.01 260)",
                }}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Root Price", value: "$25.00" },
                { label: "Base ETH Price", value: "$1,500" },
                { label: "Correlation", value: "ETH-Pegged" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center py-3 rounded-lg"
                  style={{ background: "oklch(0.14 0.008 260)" }}
                >
                  <p
                    className="font-mono font-semibold text-base"
                    style={{ color: "oklch(0.76 0.12 78)" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setPage("about-tsla")}
                className="flex-1 text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                  color: "oklch(0.12 0.01 260)",
                  border: "none",
                }}
              >
                Learn More
              </Button>
              <Button
                onClick={() => setPage("dashboard")}
                variant="outline"
                className="flex-1 text-sm"
                style={{
                  borderColor: "oklch(0.76 0.12 78 / 0.3)",
                  color: "oklch(0.76 0.12 78)",
                }}
              >
                Trade Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI Innovation ────────────────────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <SectionTag text="AI Innovation" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Intelligence Built
              <span style={{ color: "oklch(0.76 0.12 78)" }}>
                {" "}
                Into Every Layer
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              TRUPTARWallet integrates AI at its core — not as a feature, but as
              the foundation of how financial decisions are made.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {AI_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i}
                className="card-glow rounded-2xl p-6 transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.012 260 / 0.95), oklch(0.16 0.008 260 / 0.98))",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: `${feat.color} / 0.12`,
                    backgroundColor: `color-mix(in oklch, ${feat.color} 15%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${feat.color} 35%, transparent)`,
                  }}
                >
                  <feat.icon
                    className="w-6 h-6"
                    style={{ color: feat.color }}
                  />
                </div>
                <h3 className="font-display font-semibold text-base mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Cryptocurrencies ───────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <SectionTag text="Supported Assets" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Your Entire Portfolio
              <span style={{ color: "oklch(0.76 0.12 78)" }}>, One Wallet</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ASSETS.map((asset, i) => (
              <motion.div
                key={asset.symbol}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i * 0.5}
                className="card-glow rounded-xl p-5 flex items-center gap-4 transition-all duration-300"
                style={{
                  background: "oklch(0.18 0.012 260 / 0.95)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${asset.color} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${asset.color} 35%, transparent)`,
                    color: asset.color,
                  }}
                >
                  {asset.icon}
                </div>
                <div>
                  <p
                    className="font-mono font-semibold text-sm"
                    style={{ color: asset.color }}
                  >
                    {asset.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Compliance ────────────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <SectionTag text="Security & Compliance" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Secured by
              <span style={{ color: "oklch(0.76 0.12 78)" }}>
                {" "}
                Architecture, Not Trust
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Security isn't a feature we bolt on — it's the foundation every
              component of TRUPTARWallet is built upon.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {SECURITY_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i}
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: "oklch(0.17 0.01 260)",
                  border: "1px solid oklch(0.28 0.015 260)",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at top right, oklch(0.76 0.12 78 / 0.05), transparent 70%)",
                  }}
                />
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{
                    background: "oklch(0.76 0.12 78 / 0.12)",
                    border: "1px solid oklch(0.76 0.12 78 / 0.25)",
                  }}
                >
                  <card.icon
                    className="w-5 h-5"
                    style={{ color: "oklch(0.76 0.12 78)" }}
                  />
                </div>
                <h3 className="font-display font-semibold text-base mb-3">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ────────────────────────────────────── */}
      <section className="px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{
                background: "oklch(0.76 0.12 78 / 0.12)",
                border: "1px solid oklch(0.76 0.12 78 / 0.25)",
              }}
            >
              <Users
                className="w-8 h-8"
                style={{ color: "oklch(0.76 0.12 78)" }}
              />
            </div>
            <SectionTag text="Community" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Join the Ecosystem.
              <br />
              <span style={{ color: "oklch(0.76 0.12 78)" }}>
                Shape the Future.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              TRUPTARWallet is more than a wallet — it's a growing community of
              builders, investors, and innovators driving the intersection of AI
              and decentralized finance forward.
            </p>
            <Button
              data-ocid="community.primary_button"
              onClick={() => setPage("dashboard")}
              className="h-12 px-10 text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
                boxShadow: "0 4px 24px oklch(0.76 0.12 78 / 0.35)",
              }}
            >
              Join the Ecosystem
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-8 text-center border-t"
        style={{ borderColor: "oklch(0.22 0.012 260 / 0.5)" }}
      >
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.76 0.12 78)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
