export interface TeslaProject {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export interface Package {
  name: "Signature" | "Prestige" | "Elite";
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationDays: number;
  color: string;
}

export const TESLA_INVESTMENTS: TeslaProject[] = [
  {
    id: "solarcity",
    name: "SolarCity",
    icon: "☀️",
    description:
      "Tesla acquired SolarCity in 2016 for ~$2.6B to expand into solar energy generation and energy services. Now forms the foundation of Tesla Energy, selling solar panels and solar roofs.",
    category: "Energy",
  },
  {
    id: "xai",
    name: "xAI",
    icon: "🤖",
    description:
      "Tesla invested ~$2B into Elon Musk's AI company xAI. This investment integrates advanced AI into Tesla's robotics, vehicles, and future technologies.",
    category: "AI",
  },
  {
    id: "battery",
    name: "Battery Manufacturing Partnerships",
    icon: "🔋",
    description:
      "Tesla invested heavily in battery production through partnerships with Panasonic Corporation, collaborating on lithium-ion battery technology and Gigafactory production.",
    category: "Manufacturing",
  },
  {
    id: "gigafactories",
    name: "Gigafactories",
    icon: "🏭",
    description:
      "Tesla invests billions into Gigafactories in the U.S., Europe, and China to produce batteries and electric vehicles at large scale, supporting global EV adoption.",
    category: "Infrastructure",
  },
  {
    id: "ai-robotics",
    name: "AI & Robotics Development",
    icon: "⚡",
    description:
      "Tesla invests heavily in AI infrastructure including AI chips and robotics systems like Optimus, expanding beyond cars into AI-powered technologies.",
    category: "AI & Robotics",
  },
];

export const PACKAGES: Package[] = [
  {
    name: "Signature",
    minAmount: 100,
    maxAmount: 500,
    interestRate: 0.1,
    durationDays: 30,
    color: "oklch(0.76 0.12 78)",
  },
  {
    name: "Prestige",
    minAmount: 500,
    maxAmount: 1000,
    interestRate: 0.08,
    durationDays: 90,
    color: "oklch(0.70 0.15 280)",
  },
  {
    name: "Elite",
    minAmount: 1000,
    maxAmount: Number.POSITIVE_INFINITY,
    interestRate: 0.05,
    durationDays: 180,
    color: "oklch(0.72 0.18 150)",
  },
];
