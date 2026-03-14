import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";

const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (402) 627-0793",
    href: "tel:+14026270793",
    iconBg: "oklch(0.68 0.15 145 / 0.12)",
    iconBorder: "1px solid oklch(0.68 0.15 145 / 0.3)",
    iconShadow: "0 0 24px oklch(0.68 0.15 145 / 0.15)",
    iconColor: "oklch(0.68 0.15 145)",
  },
  {
    icon: Mail,
    label: "Email",
    value: "patrickjuventus82@gmail.com",
    href: "mailto:patrickjuventus82@gmail.com",
    iconBg: "oklch(0.76 0.12 78 / 0.12)",
    iconBorder: "1px solid oklch(0.76 0.12 78 / 0.3)",
    iconShadow: "0 0 24px oklch(0.76 0.12 78 / 0.15)",
    iconColor: "oklch(0.76 0.12 78)",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Omaha, Nebraska, USA",
    href: "https://maps.google.com/?q=Omaha,Nebraska,USA",
    iconBg: "oklch(0.68 0.14 220 / 0.12)",
    iconBorder: "1px solid oklch(0.68 0.14 220 / 0.3)",
    iconShadow: "0 0 24px oklch(0.68 0.14 220 / 0.15)",
    iconColor: "oklch(0.68 0.14 220)",
  },
];

export default function ContactPage() {
  return (
    <main
      className="min-h-screen px-4 py-16 max-w-4xl mx-auto"
      data-ocid="contact.page"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{
            background: "oklch(0.76 0.12 78 / 0.1)",
            border: "1px solid oklch(0.76 0.12 78 / 0.3)",
            color: "oklch(0.76 0.12 78)",
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Get in Touch
        </div>
        <h1
          className="font-display text-4xl sm:text-5xl font-bold mb-4"
          style={{ color: "oklch(0.92 0.008 260)" }}
        >
          Contact <span style={{ color: "oklch(0.76 0.12 78)" }}>Us</span>
        </h1>
        <p
          className="text-lg max-w-md mx-auto"
          style={{ color: "oklch(0.55 0.008 260)" }}
        >
          Have questions about TRUPTARWallet or TSLA Coin? We&apos;re here to
          help.
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactItems.map((item, i) => (
          <motion.a
            key={item.label}
            href={item.href}
            target={item.label === "Address" ? "_blank" : undefined}
            rel="noopener noreferrer"
            data-ocid="contact.card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="block no-underline"
          >
            <Card
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.17 0.012 260), oklch(0.14 0.008 260))",
                border: "1px solid oklch(0.26 0.015 260 / 0.8)",
                boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
              }}
              className="h-full transition-all duration-300"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: item.iconBg,
                    border: item.iconBorder,
                    boxShadow: item.iconShadow,
                  }}
                >
                  <item.icon
                    className="w-7 h-7"
                    style={{ color: item.iconColor }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.55 0.008 260)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="font-medium text-base break-all"
                    style={{ color: "oklch(0.92 0.008 260)" }}
                  >
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.a>
        ))}
      </div>

      {/* Support note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-16 text-center"
      >
        <div
          className="inline-block px-8 py-6 rounded-2xl"
          style={{
            background: "oklch(0.16 0.01 260)",
            border: "1px solid oklch(0.22 0.012 260)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.65 0.008 90)" }}>
            Support hours: Monday–Friday, 9:00 AM – 6:00 PM CT
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "oklch(0.45 0.008 260)" }}
          >
            For urgent issues outside business hours, use email for the fastest
            response.
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <footer
        className="mt-20 text-center text-xs"
        style={{ color: "oklch(0.40 0.008 260)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.76 0.12 78)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </main>
  );
}
