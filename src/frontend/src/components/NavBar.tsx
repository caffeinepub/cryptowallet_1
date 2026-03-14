import { Button } from "@/components/ui/button";
import { Menu, Phone, Shield, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export type AppPage =
  | "home"
  | "about-tsla"
  | "investments"
  | "dashboard"
  | "admin"
  | "contact";

interface NavBarProps {
  page: AppPage;
  setPage: (p: AppPage) => void;
  isLoggedIn?: boolean;
}

export default function NavBar({ page, setPage, isLoggedIn }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: { label: string; page: AppPage; ocid: string }[] = [
    { label: "Home", page: "home", ocid: "nav.home_link" },
    { label: "About TSLA Coin", page: "about-tsla", ocid: "nav.about_link" },
    { label: "Invest", page: "investments", ocid: "nav.investments_link" },
    { label: "Dashboard", page: "dashboard", ocid: "nav.dashboard_link" },
    { label: "Contact", page: "contact", ocid: "nav.contact_link" },
    ...(isLoggedIn
      ? [{ label: "Admin", page: "admin" as AppPage, ocid: "nav.admin_link" }]
      : []),
  ];

  const handleNav = (p: AppPage) => {
    setPage(p);
    setMobileOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        borderColor: "oklch(0.26 0.015 260 / 0.5)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.13 0.008 260 / 0.92)" }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleNav("home")}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
            style={{
              background: "oklch(0.76 0.12 78 / 0.15)",
              border: "1px solid oklch(0.76 0.12 78 / 0.3)",
              boxShadow: "0 0 12px oklch(0.76 0.12 78 / 0.15)",
            }}
          >
            <Wallet
              className="w-4 h-4"
              style={{ color: "oklch(0.76 0.12 78)" }}
            />
          </div>
          <span
            className="font-display font-semibold text-sm tracking-wide"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            TRUPTARWallet
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              type="button"
              key={link.page}
              data-ocid={link.ocid}
              onClick={() => handleNav(link.page)}
              className="relative px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5"
              style={{
                color:
                  page === link.page
                    ? "oklch(0.76 0.12 78)"
                    : "oklch(0.65 0.008 90)",
              }}
            >
              {page === link.page && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "oklch(0.76 0.12 78 / 0.1)",
                    border: "1px solid oklch(0.76 0.12 78 / 0.2)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {link.page === "admin" && (
                <Shield className="w-3.5 h-3.5 relative" />
              )}
              {link.page === "contact" && (
                <Phone className="w-3.5 h-3.5 relative" />
              )}
              <span className="relative">{link.label}</span>
              {link.page === "dashboard" && isLoggedIn && (
                <span
                  className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle"
                  style={{ background: "oklch(0.68 0.15 145)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Button
            data-ocid="nav.dashboard_link"
            onClick={() => handleNav("dashboard")}
            className="hidden sm:flex h-8 text-xs font-medium"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
              color: "oklch(0.12 0.01 260)",
              border: "none",
            }}
          >
            {isLoggedIn ? "My Dashboard" : "Launch App"}
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "oklch(0.65 0.008 90)" }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden border-t md:hidden"
            style={{ borderColor: "oklch(0.26 0.015 260 / 0.4)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "oklch(0.13 0.008 260 / 0.96)" }}
            />
            <nav className="relative flex flex-col px-4 py-3 gap-1">
              {links.map((link) => (
                <button
                  type="button"
                  key={link.page}
                  data-ocid={link.ocid}
                  onClick={() => handleNav(link.page)}
                  className="text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    color:
                      page === link.page
                        ? "oklch(0.76 0.12 78)"
                        : "oklch(0.65 0.008 90)",
                    background:
                      page === link.page
                        ? "oklch(0.76 0.12 78 / 0.08)"
                        : "transparent",
                  }}
                >
                  {link.page === "admin" && <Shield className="w-4 h-4" />}
                  {link.page === "contact" && <Phone className="w-4 h-4" />}
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
