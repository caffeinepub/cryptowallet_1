import type { AppPage } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cpu,
  ExternalLink,
  Gift,
  Target,
  Vote,
} from "lucide-react";
import { motion } from "motion/react";

interface AboutTSLACoinProps {
  setPage: (p: AppPage) => void;
}

const SECTIONS = [
  {
    id: "purpose",
    icon: Target,
    tag: "Token Purpose",
    title: "The Economic Engine of AI Finance",
    color: "oklch(0.76 0.12 78)",
    content: [
      "TSLA Coin is the core economic engine of the TRUPTAR ecosystem, developed by JUVENTUS SOPS. It was architected not merely as a speculative asset, but as the foundational currency that powers a new category of financial infrastructure — one where artificial intelligence and decentralized technology operate in seamless concert.",
      "As the primary utility token within TRUPTARWallet, TSLA Coin enables users to access AI-powered tools and services including automated financial advisory systems, predictive market analysis engines, and AI-driven portfolio management platforms. Every interaction with an intelligent service is transacted in TSLA Coin, creating a self-sustaining economic loop that rewards participation and drives ecosystem growth.",
      "The root price of TSLA Coin is anchored at $25.00 USD when Ethereum trades at approximately $1,500 — with price appreciation correlating to ETH market movements, establishing a dynamic yet predictable pricing model for ecosystem participants.",
    ],
  },
  {
    id: "marketplace",
    icon: Cpu,
    tag: "AI Marketplace Integration",
    title: "Decentralizing the AI Economy",
    color: "oklch(0.70 0.15 280)",
    content: [
      "TSLA Coin serves as the transactional currency for AI computation marketplaces built on the TRUPTAR infrastructure. In this marketplace paradigm, developers and organizations can deploy AI models — from language models to predictive analytics engines — and charge for their usage in TSLA Coin.",
      "This creates a permission-less, decentralized market where artificial intelligence capabilities are no longer gated behind corporate APIs or subscription paywalls. Any developer can monetize an AI model; any user can access those capabilities. The marketplace handles settlement, escrow, and dispute resolution — all enforced by smart contract logic, eliminating the need for intermediaries.",
      "For enterprises, the AI marketplace enables procurement of specialized models for financial forecasting, fraud detection, and portfolio optimization — paid in TSLA Coin and executed with the full transparency of on-chain accounting. The contract address `0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4` anchors every transaction to verifiable on-chain records.",
    ],
  },
  {
    id: "governance",
    icon: Vote,
    tag: "Governance Participation",
    title: "Token Holders Shape the Protocol",
    color: "oklch(0.68 0.15 145)",
    content: [
      "TSLA Coin holders are not merely users — they are stakeholders in the governance of the TRUPTAR ecosystem. Through a decentralized governance model, token holders participate in protocol decisions that determine the direction of the platform.",
      "Governance participation includes voting on protocol parameter changes, approving new AI model integrations into the marketplace, selecting infrastructure upgrades, and allocating community treasury resources to research and development initiatives. Each TSLA Coin held represents proportional voting power, ensuring that governance influence scales with genuine economic investment in the ecosystem.",
      "Governance proposals are submitted on-chain, debated in community forums, and ratified through transparent voting periods. This model ensures that no single entity — including JUVENTUS SOPS — can unilaterally alter the protocol. The ecosystem belongs to its participants.",
    ],
  },
  {
    id: "community",
    icon: Gift,
    tag: "Community Growth",
    title: "Rewarding Ecosystem Contribution",
    color: "oklch(0.65 0.15 30)",
    content: [
      "The TRUPTAR ecosystem thrives on active participation. To align incentives between users, developers, and the network, TSLA Coin functions as a reward and incentive mechanism for contributions that drive genuine value.",
      "Users who engage meaningfully with AI models — providing feedback, improving outputs, or contributing labeled training data — earn TSLA Coin rewards. Participants who take active governance roles, assist with network validation, or contribute to community development efforts are recognized and compensated in kind.",
      "This creates a regenerative economic cycle: rewarded participants reinvest in the ecosystem through AI service consumption and governance engagement, which strengthens the network, attracts new participants, and increases the utility and value of TSLA Coin. Growth is organic, sustainable, and community-owned.",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function AboutTSLACoin({ setPage }: AboutTSLACoinProps) {
  return (
    <main className="overflow-x-hidden">
      {/* ── Page Hero ───────────────────────────────────── */}
      <section className="relative px-4 py-24 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 20%, oklch(0.22 0.04 78 / 0.20), transparent), radial-gradient(ellipse 40% 30% at 80% 60%, oklch(0.18 0.04 280 / 0.12), transparent)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.76 0.12 78) 1px, transparent 1px), linear-gradient(90deg, oklch(0.76 0.12 78) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.04 78 / 0.8), oklch(0.18 0.02 260 / 0.9))",
                border: "1px solid oklch(0.76 0.12 78 / 0.35)",
                boxShadow:
                  "0 0 40px oklch(0.76 0.12 78 / 0.2), inset 0 1px 0 oklch(0.76 0.12 78 / 0.3)",
                color: "oklch(0.76 0.12 78)",
              }}
            >
              T
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
          >
            <span className="gold-shimmer">TSLA Coin</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg font-light mb-3"
            style={{ color: "oklch(0.65 0.01 90)" }}
          >
            The native token of the TRUPTAR ecosystem.
            <br />
            Developed by{" "}
            <strong style={{ color: "oklch(0.76 0.12 78)" }}>
              JUVENTUS SOPS
            </strong>{" "}
            for AI-driven decentralized finance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <span
              className="font-mono text-xs px-3 py-1.5 rounded-full"
              style={{
                background: "oklch(0.14 0.008 260)",
                border: "1px solid oklch(0.28 0.015 260)",
                color: "oklch(0.55 0.01 90)",
              }}
            >
              0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4
            </span>
            <a
              href="https://etherscan.io/token/0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "oklch(0.55 0.01 90)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Narrative Sections ───────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">
          {SECTIONS.map((section, i) => (
            <motion.article
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              custom={i * 0.5}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.17 0.01 260)",
                border: `1px solid color-mix(in oklch, ${section.color} 20%, oklch(0.26 0.015 260))`,
              }}
            >
              {/* Gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${section.color}, transparent)`,
                }}
              />
              <div
                className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, color-mix(in oklch, ${section.color} 8%, transparent), transparent 70%)`,
                }}
              />

              <div className="relative p-7 sm:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `color-mix(in oklch, ${section.color} 12%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${section.color} 30%, transparent)`,
                    }}
                  >
                    <section.icon
                      className="w-6 h-6"
                      style={{ color: section.color }}
                    />
                  </div>
                  <div>
                    <span
                      className="text-xs font-mono uppercase tracking-widest"
                      style={{ color: section.color, opacity: 0.8 }}
                    >
                      {section.tag}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl mt-0.5">
                      {section.title}
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {section.content.map((para, pi) => (
                    <p
                      key={`section-${section.id}-para-${pi}`}
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "oklch(0.72 0.01 90)" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="relative rounded-2xl p-10 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.025 78 / 0.5), oklch(0.16 0.012 260 / 0.8))",
              border: "1px solid oklch(0.76 0.12 78 / 0.2)",
              boxShadow:
                "0 0 60px oklch(0.76 0.12 78 / 0.06), 0 20px 60px oklch(0 0 0 / 0.3)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.76 0.12 78 / 0.08), transparent)",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-2xl sm:text-3xl mb-4">
                Ready to Join the
                <span style={{ color: "oklch(0.76 0.12 78)" }}>
                  {" "}
                  TRUPTAR Ecosystem
                </span>
                ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Open your TRUPTARWallet today and start participating in the
                future of AI-driven decentralized finance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setPage("dashboard")}
                  className="h-11 px-8 text-sm font-semibold w-full sm:w-auto"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                    color: "oklch(0.12 0.01 260)",
                    border: "none",
                    boxShadow: "0 4px 20px oklch(0.76 0.12 78 / 0.3)",
                  }}
                >
                  Launch TRUPTARWallet
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setPage("home")}
                  variant="ghost"
                  className="h-11 px-6 text-sm w-full sm:w-auto"
                  style={{ color: "oklch(0.65 0.01 90)" }}
                >
                  Back to Home
                </Button>
              </div>
            </div>
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
