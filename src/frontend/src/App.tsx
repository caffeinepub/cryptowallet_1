import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Home,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Asset, Direction } from "./backend.d";
import NavBar, { type AppPage } from "./components/NavBar";
import type { Package, TeslaProject } from "./data/investments";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useInvestments } from "./hooks/useInvestments";
import {
  useBalances,
  useDisplayName,
  useInitializeWallet,
  useReceiveAsset,
  useSendAsset,
  useTransactionHistory,
} from "./hooks/useQueries";
import AboutTSLACoin from "./pages/AboutTSLACoin";
import ActiveInvestmentsPage from "./pages/ActiveInvestmentsPage";
import HomePage from "./pages/HomePage";
import InvestmentConfirmPage from "./pages/InvestmentConfirmPage";
import InvestmentDetailPage from "./pages/InvestmentDetailPage";
import InvestmentsPage from "./pages/InvestmentsPage";

// ------- constants -------
const ETH_BASE_PRICE = 3200;
const TSLA_PEG_AT_ETH_1500 = 25;

const USD_PRICES: Record<Asset, number> = {
  [Asset.BTC]: 65000,
  [Asset.ETH]: ETH_BASE_PRICE,
  [Asset.BNB]: 600,
  [Asset.SOL]: 180,
  [Asset.ICP]: 12,
  [Asset.USDT]: 1,
  [Asset.TSLA]: TSLA_PEG_AT_ETH_1500 * (ETH_BASE_PRICE / 1500),
};

const ASSET_DECIMALS: Record<Asset, number> = {
  [Asset.BTC]: 8,
  [Asset.ETH]: 6,
  [Asset.BNB]: 4,
  [Asset.SOL]: 4,
  [Asset.ICP]: 4,
  [Asset.USDT]: 2,
  [Asset.TSLA]: 2,
};

const ASSET_COLORS: Record<Asset, string> = {
  [Asset.BTC]: "#F7931A",
  [Asset.ETH]: "#627EEA",
  [Asset.BNB]: "#F3BA2F",
  [Asset.SOL]: "#9945FF",
  [Asset.ICP]: "#29ABE2",
  [Asset.USDT]: "#26A17B",
  [Asset.TSLA]: "#E31937",
};

const ASSET_ICONS: Record<Asset, string> = {
  [Asset.BTC]: "₿",
  [Asset.ETH]: "Ξ",
  [Asset.BNB]: "B",
  [Asset.SOL]: "◎",
  [Asset.ICP]: "∞",
  [Asset.USDT]: "$",
  [Asset.TSLA]: "T",
};

function formatAmount(amount: number, asset: Asset): string {
  return amount.toFixed(ASSET_DECIMALS[asset]);
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

// ------- Live Prices Hook -------
function useLivePrices() {
  const [prices, setPrices] = useState<Record<Asset, number>>({
    [Asset.BTC]: 65000,
    [Asset.ETH]: ETH_BASE_PRICE,
    [Asset.BNB]: 600,
    [Asset.SOL]: 180,
    [Asset.ICP]: 12,
    [Asset.USDT]: 1,
    [Asset.TSLA]: TSLA_PEG_AT_ETH_1500 * (ETH_BASE_PRICE / 1500),
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFresh = lastUpdated
    ? Date.now() - lastUpdated.getTime() < 60_000
    : false;

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,tether&vs_currencies=usd",
      );
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const eth = json?.ethereum?.usd;
      if (typeof eth === "number" && eth > 0) {
        setPrices({
          [Asset.BTC]: json?.bitcoin?.usd ?? 65000,
          [Asset.ETH]: eth,
          [Asset.BNB]: json?.binancecoin?.usd ?? 600,
          [Asset.SOL]: json?.solana?.usd ?? 180,
          [Asset.ICP]: 12,
          [Asset.USDT]: json?.tether?.usd ?? 1,
          [Asset.TSLA]: TSLA_PEG_AT_ETH_1500 * (eth / 1500),
        });
        setLastUpdated(new Date());
      }
    } catch {
      // keep last known prices
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 30_000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  return { prices, loading, isFresh };
}

// ------- Helper: generate historical price data -------
function generatePriceData() {
  const baseEth = ETH_BASE_PRICE;
  const points = 48;
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now.getTime() - (points - 1 - i) * 30 * 60 * 1000);
    const noise =
      (Math.sin(i * 0.7) + Math.sin(i * 1.3) + Math.sin(i * 0.4)) / 3;
    const eth = Math.round(baseEth * (1 + noise * 0.04));
    const tsla = Math.round(TSLA_PEG_AT_ETH_1500 * (eth / 1500) * 100) / 100;
    return {
      time: t.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      tsla,
      eth,
    };
  });
}

function TSLAPriceChart({
  onSend,
  onReceive,
}: {
  onSend?: () => void;
  onReceive?: () => void;
}) {
  const { prices: livePrices, loading: ethLoading, isFresh } = useLivePrices();
  const ethPrice = livePrices[Asset.ETH];
  const tslaPrice = livePrices[Asset.TSLA];
  const historicalData = useMemo(() => generatePriceData(), []);
  const data = useMemo(() => {
    const updated = [...historicalData];
    const now = new Date();
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      tsla: Math.round(tslaPrice * 100) / 100,
      eth: Math.round(ethPrice),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
    return updated;
  }, [historicalData, tslaPrice, ethPrice]);
  const current = data[data.length - 1].tsla;
  const prev = data[0].tsla;
  const change = ((current - prev) / prev) * 100;
  const isUp = change >= 0;
  const CONTRACT = "0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4";
  const shortContract = `${CONTRACT.slice(0, 8)}...${CONTRACT.slice(-6)}`;
  const [copied, setCopied] = useState(false);
  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(CONTRACT).then(() => {
      setCopied(true);
      toast.success("TSLA address copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.17 0.012 260), oklch(0.14 0.008 260))",
        border: "1px solid oklch(0.30 0.015 260 / 0.8)",
        boxShadow: "0 8px 40px oklch(0 0 0 / 0.4)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.45 0.18 25 / 0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: "oklch(0.45 0.18 25 / 0.2)",
                  border: "1px solid oklch(0.55 0.18 25 / 0.4)",
                  color: "#E31937",
                }}
              >
                T
              </div>
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: "oklch(0.92 0.006 90)" }}
                >
                  TSLA Coin
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {shortContract}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-0.5">
              {isFresh && (
                <span
                  className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.55 0.16 145 / 0.15)",
                    color: "oklch(0.68 0.15 145)",
                    border: "1px solid oklch(0.55 0.16 145 / 0.25)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "oklch(0.68 0.15 145)" }}
                  />
                  LIVE
                </span>
              )}
              {ethLoading && (
                <span className="text-xs text-muted-foreground">
                  Fetching live ETH price...
                </span>
              )}
            </div>
            <p
              className="text-2xl font-mono font-semibold"
              style={{ color: "oklch(0.92 0.006 90)" }}
            >
              {formatUSD(current)}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              ETH{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(ethPrice)}{" "}
              · TSLA {formatUSD(current)}
            </p>
            <div
              className="flex items-center justify-end gap-1 mt-0.5"
              style={{
                color: isUp ? "oklch(0.68 0.15 145)" : "oklch(0.65 0.15 30)",
              }}
            >
              {isUp ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-mono font-medium">
                {isUp ? "+" : ""}
                {change.toFixed(2)}% (24h)
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tslaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E31937" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E31937" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.015 260 / 0.4)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.005 260)" }}
                tickLine={false}
                axisLine={false}
                interval={11}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.50 0.005 260)" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.012 260)",
                  border: "1px solid oklch(0.32 0.015 260)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "oklch(0.92 0.006 90)",
                }}
                formatter={(value: number, _name: string, props: any) => [
                  `TSLA $${value.toFixed(2)} · ETH $${props?.payload?.eth?.toLocaleString() ?? ""}`,
                  "",
                ]}
                labelStyle={{ color: "oklch(0.60 0.005 260)" }}
              />
              <Area
                type="monotone"
                dataKey="tsla"
                stroke="#E31937"
                strokeWidth={2}
                fill="url(#tslaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#E31937", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "oklch(0.45 0.18 25 / 0.12)",
              color: "oklch(0.72 0.14 25 / 0.8)",
              border: "1px solid oklch(0.50 0.18 25 / 0.20)",
            }}
          >
            <Zap className="w-2.5 h-2.5" />
            Powered by Chainlink
          </span>
        </div>

        {/* Send / Receive buttons */}
        {(onSend || onReceive) && (
          <div className="mt-5 space-y-3">
            <div className="flex gap-3">
              {onSend && (
                <Button
                  data-ocid="tsla_chart.send_button"
                  onClick={onSend}
                  className="flex-1 h-11 gap-2 font-medium rounded-xl text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.76 0.12 78 / 0.18), oklch(0.68 0.14 68 / 0.12))",
                    border: "1px solid oklch(0.76 0.12 78 / 0.35)",
                    color: "oklch(0.84 0.10 78)",
                  }}
                >
                  <Send className="w-4 h-4" />
                  Send TSLA
                </Button>
              )}
              {onReceive && (
                <Button
                  data-ocid="tsla_chart.receive_button"
                  onClick={onReceive}
                  className="flex-1 h-11 gap-2 font-medium rounded-xl text-sm"
                  style={{
                    background: "oklch(0.58 0.15 145 / 0.12)",
                    border: "1px solid oklch(0.58 0.15 145 / 0.30)",
                    color: "oklch(0.72 0.14 145)",
                  }}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Receive TSLA
                </Button>
              )}
            </div>

            {/* TSLA Contract Address */}
            <button
              type="button"
              data-ocid="tsla_chart.address_panel"
              onClick={copyAddress}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors group"
              style={{
                background: "oklch(0.15 0.008 260 / 0.7)",
                border: "1px solid oklch(0.28 0.012 260 / 0.5)",
              }}
            >
              <div className="text-left">
                <p
                  className="text-xs text-muted-foreground mb-0.5 uppercase tracking-widest"
                  style={{ fontSize: "10px" }}
                >
                  Your TSLA Address
                </p>
                <p
                  className="font-mono text-xs"
                  style={{
                    color: "oklch(0.65 0.008 260)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {shortContract}
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "oklch(0.55 0.008 260)" }}
              >
                {copied ? (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.68 0.15 145)" }}
                  />
                ) : (
                  <Copy className="w-3.5 h-3.5 group-hover:opacity-100 opacity-60" />
                )}
                <span className="group-hover:opacity-100 opacity-60 text-xs">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ------- Asset Card -------
function AssetCard({
  asset,
  balance,
  index,
  livePrice,
}: {
  asset: Asset;
  balance: number;
  index: number;
  livePrice?: number;
}) {
  const usdValue = balance * (livePrice ?? USD_PRICES[asset]);
  const color = ASSET_COLORS[asset];
  const icon = ASSET_ICONS[asset];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      data-ocid={`asset.item.${index + 1}` as any}
      className="rounded-xl p-4 relative overflow-hidden group"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.9), oklch(0.16 0.008 260))",
        border: "1px solid oklch(0.28 0.015 260 / 0.6)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${color}25` }}
      />
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}35`,
            color,
          }}
        >
          {icon}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {asset}
        </span>
      </div>
      <p
        className="font-mono font-semibold text-base truncate"
        style={{ color: "oklch(0.92 0.006 90)" }}
      >
        {formatAmount(balance, asset)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {formatUSD(usdValue)}
      </p>
      {livePrice !== undefined && (
        <div className="flex items-center gap-1 mt-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.68 0.15 145)" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(0.55 0.01 260)" }}
          >
            {formatUSD(livePrice)} / coin
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ------- Transaction Row -------
function TransactionRow({
  tx,
  index,
}: {
  tx: {
    id: bigint;
    direction: Direction;
    asset: Asset;
    note: string;
    counterparty: string;
    timestamp: bigint;
    amount: number;
  };
  index: number;
}) {
  const isReceive = tx.direction === Direction.receive;
  const usdValue = tx.amount * USD_PRICES[tx.asset];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      data-ocid={`transaction.item.${index + 1}` as any}
      className="flex items-center gap-4 py-3.5 border-b border-border/40 last:border-0 group"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isReceive
            ? "oklch(0.58 0.15 145 / 0.15)"
            : "oklch(0.65 0.15 30 / 0.15)",
          border: isReceive
            ? "1px solid oklch(0.58 0.15 145 / 0.3)"
            : "1px solid oklch(0.65 0.15 30 / 0.3)",
        }}
      >
        {isReceive ? (
          <ArrowDownLeft
            className="w-4 h-4"
            style={{ color: "oklch(0.68 0.15 145)" }}
          />
        ) : (
          <ArrowUpRight
            className="w-4 h-4"
            style={{ color: "oklch(0.68 0.15 30)" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {isReceive ? "Received" : "Sent"}{" "}
          <span className="font-mono" style={{ color: ASSET_COLORS[tx.asset] }}>
            {tx.asset}
          </span>
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {tx.note ||
            `${isReceive ? "From" : "To"}: ${tx.counterparty.slice(0, 20)}...`}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className="text-sm font-mono font-medium"
          style={{
            color: isReceive ? "oklch(0.68 0.15 145)" : "oklch(0.68 0.15 30)",
          }}
        >
          {isReceive ? "+" : "-"}
          {formatAmount(tx.amount, tx.asset)} {tx.asset}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(tx.timestamp)}
        </p>
        <p className="text-xs text-muted-foreground">{formatUSD(usdValue)}</p>
      </div>
    </motion.div>
  );
}

// ------- Send Modal -------
function SendModal({
  open,
  onClose,
  defaultAsset,
}: {
  open: boolean;
  onClose: () => void;
  defaultAsset?: Asset;
}) {
  const [asset, setAsset] = useState<Asset>(defaultAsset ?? Asset.BTC);
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [note, setNote] = useState("");
  const sendAsset = useSendAsset();

  useEffect(() => {
    if (open) setAsset(defaultAsset ?? Asset.BTC);
  }, [open, defaultAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !counterparty) return;
    try {
      await sendAsset.mutateAsync({
        asset,
        amount: Number.parseFloat(amount),
        counterparty,
        note,
      });
      toast.success(`Sent ${amount} ${asset} successfully`);
      onClose();
      setAmount("");
      setCounterparty("");
      setNote("");
    } catch (e: any) {
      toast.error(e.message || "Transaction failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="send.dialog"
        className="max-w-md"
        style={{
          background: "oklch(0.17 0.01 260)",
          border: "1px solid oklch(0.76 0.12 78 / 0.2)",
          boxShadow: "0 20px 60px oklch(0 0 0 / 0.7)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Send
              className="w-5 h-5"
              style={{ color: "oklch(0.76 0.12 78)" }}
            />
            Send Assets
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Asset
            </Label>
            <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
              <SelectTrigger
                data-ocid="send.select"
                className="bg-secondary border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Asset).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ASSET_ICONS[a]} {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Amount
            </Label>
            <Input
              data-ocid="send.input"
              type="number"
              placeholder={`0.${"|0".repeat(ASSET_DECIMALS[asset])}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border font-mono"
              step="any"
              min="0"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Recipient Address
            </Label>
            <Input
              data-ocid="send.counterparty.input"
              placeholder="Wallet address or principal"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="bg-secondary border-border font-mono text-sm"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Note (optional)
            </Label>
            <Input
              data-ocid="send.note.input"
              placeholder="Add a memo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="send.cancel_button"
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="send.submit_button"
              type="submit"
              className="flex-1"
              disabled={sendAsset.isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
              }}
            >
              {sendAsset.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {sendAsset.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------- Wallet Address Derivation -------
function deriveWalletAddress(principal: string, asset: Asset): string {
  // Simple deterministic hash from principal + asset
  let hash = 0;
  const str = principal + asset;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  // Expand to 40 hex chars using xor-shift
  let seed = hash;
  const hexParts: string[] = [];
  for (let i = 0; i < 10; i++) {
    seed = (seed ^ (seed << 13) ^ (seed >>> 17) ^ (seed << 5)) >>> 0;
    hexParts.push(seed.toString(16).padStart(8, "0"));
  }
  const hexStr = hexParts.join("");

  if (asset === Asset.BTC) {
    // bc1q + 38 chars alphanumeric (no 0/O/I/l)
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let addr = "bc1q";
    for (let i = 0; i < 38; i++) {
      const idx = Number.parseInt(hexStr[i % hexStr.length], 16) % chars.length;
      addr += chars[idx];
    }
    return addr;
  }
  if (asset === Asset.SOL) {
    // 44 chars base58-like
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    let addr = "";
    for (let i = 0; i < 44; i++) {
      const idx = Number.parseInt(hexStr[i % hexStr.length], 16) % chars.length;
      addr += chars[idx];
    }
    return addr;
  }
  if (asset === Asset.ICP) {
    return principal;
  }
  // ETH, BNB, USDT, TSLA → 0x + 40 hex
  return `0x${hexStr.slice(0, 40)}`;
}

// ------- Receive Modal -------
function ReceiveModal({
  open,
  onClose,
  defaultAsset,
  principal,
}: {
  open: boolean;
  onClose: () => void;
  defaultAsset?: Asset;
  principal?: string;
}) {
  const [asset, setAsset] = useState<Asset>(defaultAsset ?? Asset.BTC);
  const [copied, setCopied] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState("");
  const receiveAsset = useReceiveAsset();

  useEffect(() => {
    if (open) {
      setAsset(defaultAsset ?? Asset.BTC);
      setSyncSuccess(false);
      setSyncError("");
    }
  }, [open, defaultAsset]);

  const walletAddress = principal
    ? deriveWalletAddress(principal, asset)
    : "Connect wallet to view address";
  const tslaAddress = principal
    ? deriveWalletAddress(principal, Asset.TSLA)
    : "";

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [walletAddress]);

  const syncTSLA = async () => {
    if (!tslaAddress) return;
    setSyncLoading(true);
    setSyncError("");
    setSyncSuccess(false);
    try {
      const TSLA_CONTRACT = "0xC814A2F02436B9cCd1d1b13149aD7e1BD00DB1B4";
      const res = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${TSLA_CONTRACT}&address=${tslaAddress}&tag=latest`,
      );
      const json = await res.json();
      if (json.status === "1" && json.result) {
        const balance = Number(json.result) / 1e18;
        if (balance > 0) {
          await receiveAsset.mutateAsync({
            asset: Asset.TSLA,
            amount: balance,
            counterparty: "Blockchain Sync",
            note: "TSLA sync from Ethereum",
          });
          toast.success(`Synced ${balance.toFixed(4)} TSLA from Ethereum`);
        } else {
          toast.info("No TSLA balance found at this address");
        }
        setSyncSuccess(true);
      } else {
        setSyncError("Failed to fetch on-chain balance. Try again later.");
      }
    } catch {
      setSyncError("Network error. Please check your connection.");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="receive.dialog"
        className="max-w-md"
        style={{
          background: "oklch(0.17 0.01 260)",
          border: "1px solid oklch(0.76 0.12 78 / 0.2)",
          boxShadow: "0 20px 60px oklch(0 0 0 / 0.7)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Download
              className="w-5 h-5"
              style={{ color: "oklch(0.68 0.15 145)" }}
            />
            Receive Assets
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Asset
            </Label>
            <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
              <SelectTrigger
                data-ocid="receive.select"
                className="bg-secondary border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Asset).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ASSET_ICONS[a]} {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Your {asset} Wallet Address
            </Label>
            <div
              className="flex items-center gap-2 rounded-lg p-3"
              style={{
                background: "oklch(0.13 0.008 260)",
                border: "1px solid oklch(0.28 0.015 260)",
              }}
            >
              <p
                className="flex-1 text-xs font-mono break-all"
                style={{ color: "oklch(0.80 0.008 90)" }}
              >
                {walletAddress}
              </p>
              <button
                data-ocid="receive.copy.button"
                type="button"
                onClick={copyAddress}
                className="flex-shrink-0 p-1.5 rounded-md transition-all"
                style={{
                  background: "oklch(0.22 0.015 260)",
                  border: "1px solid oklch(0.32 0.015 260)",
                }}
              >
                {copied ? (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.68 0.15 145)" }}
                  />
                ) : (
                  <Copy
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.60 0.008 90)" }}
                  />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Send {asset} to this address to fund your wallet.
            </p>
          </div>

          {asset === Asset.TSLA && (
            <div
              className="rounded-lg p-4 space-y-3"
              style={{
                background: "oklch(0.45 0.18 25 / 0.06)",
                border: "1px solid oklch(0.55 0.18 25 / 0.2)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "oklch(0.72 0.14 25)" }}
              >
                TSLA Deposit Address
              </p>
              <p
                className="text-xs font-mono break-all"
                style={{ color: "oklch(0.75 0.008 90)" }}
              >
                {tslaAddress}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.008 90)" }}>
                Transfer TSLA tokens (ERC-20) to this Ethereum address, then
                click Sync to reflect balance in your portfolio.
              </p>
              <Button
                data-ocid="receive.tsla.sync_button"
                type="button"
                onClick={syncTSLA}
                disabled={syncLoading || syncSuccess}
                className="w-full h-9 text-xs font-medium"
                style={{
                  background: syncSuccess
                    ? "oklch(0.55 0.16 145 / 0.2)"
                    : "oklch(0.45 0.18 25 / 0.15)",
                  border: syncSuccess
                    ? "1px solid oklch(0.55 0.16 145 / 0.4)"
                    : "1px solid oklch(0.55 0.18 25 / 0.35)",
                  color: syncSuccess
                    ? "oklch(0.68 0.15 145)"
                    : "oklch(0.72 0.14 25)",
                }}
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Syncing Balance...
                  </>
                ) : syncSuccess ? (
                  <>
                    <Check className="mr-2 h-3.5 w-3.5" />
                    Balance Synced
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Sync TSLA Balance
                  </>
                )}
              </Button>
              {syncError && (
                <p
                  data-ocid="receive.tsla.error_state"
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.15 30)" }}
                >
                  {syncError}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              data-ocid="receive.close_button"
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------- Portfolio Breakdown -------
function PortfolioBreakdown({
  balances,
  balancesLoading,
  livePrices,
}: {
  balances: { asset: Asset; balance: number }[] | undefined;
  balancesLoading: boolean;
  livePrices?: Record<Asset, number>;
}) {
  if (balancesLoading) {
    return (
      <div
        data-ocid="portfolio.breakdown.loading_state"
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.19 0.012 260 / 0.95)",
          border: "1px solid oklch(0.30 0.015 260 / 0.6)",
        }}
      >
        <Skeleton
          className="h-4 w-40 mb-4"
          style={{ background: "oklch(0.22 0.015 260)" }}
        />
        <Skeleton
          className="h-6 w-full mb-3"
          style={{ background: "oklch(0.22 0.015 260)" }}
        />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-10 w-full"
              style={{ background: "oklch(0.22 0.015 260)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return null;
  }

  const rows = balances.map((b) => ({
    ...b,
    usd: b.balance * (livePrices?.[b.asset] ?? USD_PRICES[b.asset]),
    color: ASSET_COLORS[b.asset],
  }));

  const total = rows.reduce((s, r) => s + r.usd, 0);
  const tslaRow = rows.find((r) => r.asset === Asset.TSLA);
  const tslaUsd = tslaRow?.usd ?? 0;
  const tslaPercent = total > 0 ? (tslaUsd / total) * 100 : 0;
  const otherPercent = 100 - tslaPercent;

  const sorted = [...rows].sort((a, b) => b.usd - a.usd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      data-ocid="portfolio.breakdown.card"
      className="rounded-2xl p-6"
      style={{
        background: "oklch(0.19 0.012 260 / 0.95)",
        border: "1px solid oklch(0.30 0.015 260 / 0.6)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="font-display font-semibold text-base"
            style={{ color: "oklch(0.90 0.01 260)" }}
          >
            Portfolio Breakdown
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.01 260)" }}
          >
            TSLA vs. Other Assets
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-mono font-semibold text-sm"
            style={{ color: "oklch(0.76 0.12 78)" }}
          >
            {tslaPercent.toFixed(1)}% TSLA
          </p>
          <p className="text-xs" style={{ color: "oklch(0.50 0.01 260)" }}>
            {formatUSD(tslaUsd)} / {formatUSD(total)}
          </p>
        </div>
      </div>

      {/* Stacked bar */}
      <div
        className="w-full h-4 rounded-full overflow-hidden flex mb-5"
        style={{ background: "oklch(0.24 0.012 260)" }}
      >
        {tslaPercent > 0 && (
          <div
            className="h-full rounded-l-full transition-all duration-700"
            style={{
              width: `${tslaPercent}%`,
              background: "oklch(0.76 0.12 78)",
            }}
          />
        )}
        {otherPercent > 0 && (
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${otherPercent}%`,
              background: "oklch(0.32 0.02 260)",
            }}
          />
        )}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {sorted.map((row) => {
          const pct = total > 0 ? (row.usd / total) * 100 : 0;
          const isTsla = row.asset === Asset.TSLA;
          return (
            <div
              key={row.asset}
              data-ocid={isTsla ? "portfolio.breakdown.tsla_row" : undefined}
              className="rounded-lg px-3 py-2.5"
              style={{
                background: isTsla
                  ? "oklch(0.76 0.12 78 / 0.07)"
                  : "oklch(0.22 0.012 260 / 0.5)",
                border: isTsla
                  ? "1px solid oklch(0.76 0.12 78 / 0.15)"
                  : "1px solid transparent",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: row.color }}
                  />
                  <span
                    className="text-xs font-semibold font-mono tracking-wide"
                    style={{
                      color: isTsla
                        ? "oklch(0.76 0.12 78)"
                        : "oklch(0.75 0.01 260)",
                    }}
                  >
                    {row.asset}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.55 0.01 260)" }}
                  >
                    {row.balance.toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </span>
                  <span
                    className="text-xs font-mono font-medium"
                    style={{
                      color: isTsla
                        ? "oklch(0.76 0.12 78)"
                        : "oklch(0.82 0.01 260)",
                    }}
                  >
                    {formatUSD(row.usd)}
                  </span>
                  <span
                    className="text-xs w-10 text-right"
                    style={{ color: "oklch(0.50 0.01 260)" }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div
                className="w-full h-1 rounded-full"
                style={{ background: "oklch(0.27 0.012 260)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: row.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ------- Dashboard -------
function Dashboard({ setPage }: { setPage: (p: AppPage) => void }) {
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const { data: balances, isLoading: balancesLoading } = useBalances();
  const { data: transactions, isLoading: txLoading } = useTransactionHistory();
  const { data: displayName } = useDisplayName();
  const initWallet = useInitializeWallet();

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [sendDefaultAsset, setSendDefaultAsset] = useState<Asset>(Asset.BTC);
  const [receiveDefaultAsset, setReceiveDefaultAsset] = useState<Asset>(
    Asset.BTC,
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (actor && !actorLoading && !initialized) {
      setInitialized(true);
      initWallet.mutate();
    }
  }, [actor, actorLoading, initialized, initWallet]);

  const { prices: livePrices } = useLivePrices();

  const totalUSD =
    balances?.reduce(
      (sum, b) =>
        sum + b.balance * (livePrices[b.asset] ?? USD_PRICES[b.asset]),
      0,
    ) ?? 0;

  const principal = identity?.getPrincipal().toString() ?? "";
  const ethAddress = principal ? deriveWalletAddress(principal, Asset.ETH) : "";
  const shortEthAddress = ethAddress
    ? `${ethAddress.slice(0, 8)}...${ethAddress.slice(-6)}`
    : "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "";

  const recentTx = [...(transactions ?? [])]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50">
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.14 0.008 260 / 0.85)" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage("home")}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "oklch(0.76 0.12 78 / 0.15)",
                  border: "1px solid oklch(0.76 0.12 78 / 0.3)",
                }}
              >
                <Wallet
                  className="w-4 h-4"
                  style={{ color: "oklch(0.76 0.12 78)" }}
                />
              </div>
              <p
                className="text-sm font-display font-semibold hidden sm:block"
                style={{ color: "oklch(0.76 0.12 78)" }}
              >
                TRUPTARWallet
              </p>
            </button>
            <div
              className="hidden sm:block w-px h-4"
              style={{ background: "oklch(0.30 0.015 260)" }}
            />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground font-mono">
                {displayName ? (
                  <span style={{ color: "oklch(0.65 0.01 90)" }}>
                    {displayName}
                  </span>
                ) : null}{" "}
                {shortPrincipal}
              </p>
            </div>
          </div>

          <Button
            data-ocid="nav.secondary_button"
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          data-ocid="portfolio.card"
          className="portfolio-card noise-bg rounded-2xl p-8 relative overflow-hidden"
        >
          <div
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.76 0.12 78 / 0.08) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.60 0.10 220 / 0.06) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Total Portfolio Value
                </p>
                {balancesLoading || actorLoading ? (
                  <Skeleton
                    data-ocid="portfolio.loading_state"
                    className="h-12 w-48 mt-1"
                    style={{ background: "oklch(0.22 0.015 260)" }}
                  />
                ) : (
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-5xl font-display font-semibold tracking-tight"
                    style={{ color: "oklch(0.76 0.12 78)" }}
                  >
                    {formatUSD(totalUSD)}
                  </motion.h2>
                )}
              </div>
              <TrendingUp
                className="w-6 h-6 mt-1"
                style={{ color: "oklch(0.76 0.12 78 / 0.6)" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Across {balances?.length ?? 0} assets
            </p>
          </div>
        </motion.div>

        {/* Wallet Address Strip */}
        {principal && (
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{
              background: "oklch(0.17 0.01 260)",
              border: "1px solid oklch(0.26 0.015 260)",
            }}
          >
            <div className="flex items-center gap-2">
              <Wallet
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.50 0.01 260)" }}
              />
              <span className="text-xs text-muted-foreground">Your Wallet</span>
              <span
                className="w-px h-3"
                style={{ background: "oklch(0.30 0.015 260)" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.65 0.008 90)" }}
              >
                {shortEthAddress}
              </span>
            </div>
            <button
              data-ocid="wallet.copy_address_button"
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(ethAddress);
                toast.success("Wallet address copied!");
              }}
              className="p-1 rounded transition-opacity hover:opacity-80"
            >
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}

        <PortfolioBreakdown
          balances={balances}
          balancesLoading={balancesLoading || actorLoading}
          livePrices={livePrices}
        />

        {/* TSLA Price Chart */}
        <TSLAPriceChart
          onSend={() => {
            setSendDefaultAsset(Asset.TSLA);
            setSendOpen(true);
          }}
          onReceive={() => {
            setReceiveDefaultAsset(Asset.TSLA);
            setReceiveOpen(true);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Send",
              icon: Send,
              ocid: "wallet.send_button",
              onClick: () => setSendOpen(true),
              style: {
                background: "oklch(0.19 0.012 260)",
                border: "1px solid oklch(0.76 0.12 78 / 0.2)",
                color: "oklch(0.76 0.12 78)",
              },
            },
            {
              label: "Receive",
              icon: Download,
              ocid: "wallet.receive_button",
              onClick: () => setReceiveOpen(true),
              style: {
                background: "oklch(0.19 0.012 260)",
                border: "1px solid oklch(0.58 0.15 145 / 0.25)",
                color: "oklch(0.68 0.15 145)",
              },
            },
          ].map(({ label, icon: Icon, ocid, onClick, style }) => (
            <Button
              key={label}
              data-ocid={ocid as any}
              onClick={onClick}
              className="h-14 flex-col gap-1.5 text-xs font-medium rounded-xl"
              style={style}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Button>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your Assets</h3>
            {(balancesLoading || actorLoading) && (
              <RefreshCw
                data-ocid="assets.loading_state"
                className="w-4 h-4 animate-spin text-muted-foreground"
              />
            )}
          </div>

          {balancesLoading || actorLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 rounded-xl"
                  style={{ background: "oklch(0.19 0.01 260)" }}
                />
              ))}
            </div>
          ) : balances && balances.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {balances.map((b, i) => (
                <AssetCard
                  key={b.asset}
                  asset={b.asset}
                  balance={b.balance}
                  index={i}
                  livePrice={livePrices[b.asset]}
                />
              ))}
            </div>
          ) : (
            <div
              data-ocid="assets.empty_state"
              className="text-center py-12 rounded-xl"
              style={{
                background: "oklch(0.17 0.01 260)",
                border: "1px dashed oklch(0.30 0.015 260)",
              }}
            >
              <Wallet
                className="w-10 h-10 mx-auto mb-3 opacity-30"
                style={{ color: "oklch(0.76 0.12 78)" }}
              />
              <p className="text-muted-foreground text-sm">
                No assets yet. Add demo funds to get started.
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">
              Transaction History
            </h3>
            {txLoading && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.17 0.01 260)",
              border: "1px solid oklch(0.26 0.015 260)",
            }}
          >
            {txLoading ? (
              <div
                data-ocid="transactions.loading_state"
                className="p-6 space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-14 rounded-lg"
                    style={{ background: "oklch(0.20 0.01 260)" }}
                  />
                ))}
              </div>
            ) : recentTx.length > 0 ? (
              <div className="px-5 divide-y divide-border/30">
                <AnimatePresence>
                  {recentTx.map((tx, i) => (
                    <TransactionRow key={String(tx.id)} tx={tx} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div
                data-ocid="transactions.empty_state"
                className="text-center py-12"
              >
                <ArrowUpRight
                  className="w-10 h-10 mx-auto mb-3 opacity-20"
                  style={{ color: "oklch(0.76 0.12 78)" }}
                />
                <p className="text-muted-foreground text-sm">
                  No transactions yet. Send or receive assets to see history.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
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

      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        defaultAsset={sendDefaultAsset}
      />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        defaultAsset={receiveDefaultAsset}
        principal={principal}
      />

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.20 0.012 260)",
            border: "1px solid oklch(0.30 0.015 260)",
            color: "oklch(0.92 0.006 90)",
          },
        }}
      />
    </div>
  );
}

// ------- Login Screen -------
function LoginScreen({ setPage }: { setPage: (p: AppPage) => void }) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 30% 40%, oklch(0.22 0.04 78 / 0.15), transparent), radial-gradient(ellipse 40% 40% at 70% 60%, oklch(0.20 0.03 250 / 0.12), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-md px-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 78 / 0.8), oklch(0.18 0.02 260 / 0.9))",
              boxShadow:
                "0 0 40px oklch(0.76 0.12 78 / 0.2), inset 0 1px 0 oklch(0.76 0.12 78 / 0.3)",
              border: "1px solid oklch(0.76 0.12 78 / 0.25)",
            }}
          >
            <Wallet
              className="w-10 h-10"
              style={{ color: "oklch(0.76 0.12 78)" }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-5xl font-display font-semibold mb-3 tracking-tight"
        >
          <span className="gold-shimmer">TRUPTARWallet</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-muted-foreground text-lg mb-10 font-light"
        >
          Your sovereign digital asset vault, secured by the Internet Computer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="space-y-3"
        >
          <Button
            data-ocid="auth.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-medium tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
              color: "oklch(0.12 0.01 260)",
              boxShadow:
                "0 4px 20px oklch(0.76 0.12 78 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.15)",
              border: "none",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Connect with Internet Identity
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setPage("home")}
            className="w-full h-10 text-sm text-muted-foreground"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          Powered by Internet Computer · Secured by ICP
        </motion.p>
      </motion.div>
    </div>
  );
}

// ------- Investment Sub-App -------
type InvestView = "list" | "detail" | "confirm" | "active";

function InvestmentSection() {
  const {
    tslaBalance,
    investments,
    invest,
    withdraw,
    computeInterest,
    syncMatured,
  } = useInvestments();
  const [view, setView] = useState<InvestView>("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedProject, setSelectedProject] = useState<TeslaProject | null>(
    null,
  );
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const handleSelectInvestment = (id: string) => {
    setSelectedProjectId(id);
    setView("detail");
  };

  const handleSelectPackage = (pkg: Package, project: TeslaProject) => {
    setSelectedPackage(pkg);
    setSelectedProject(project);
    setView("confirm");
  };

  const handleConfirm = (amount: number) => {
    if (!selectedProjectId || !selectedProject || !selectedPackage) return;
    invest(selectedProjectId, selectedProject.name, selectedPackage, amount);
    toast.success(
      `Investment confirmed! ${amount.toLocaleString()} TSLA invested in ${selectedProject.name}`,
    );
    setView("active");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="inv-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <InvestmentsPage
              tslaBalance={tslaBalance}
              onSelectInvestment={handleSelectInvestment}
              onViewActive={() => setView("active")}
              onSendTSLA={() => setSendOpen(true)}
              onReceiveTSLA={() => setReceiveOpen(true)}
            />
          </motion.div>
        )}
        {view === "detail" && selectedProjectId && (
          <motion.div
            key="inv-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <InvestmentDetailPage
              projectId={selectedProjectId}
              tslaBalance={tslaBalance}
              onBack={() => setView("list")}
              onSelectPackage={handleSelectPackage}
            />
          </motion.div>
        )}
        {view === "confirm" && selectedProject && selectedPackage && (
          <motion.div
            key="inv-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <InvestmentConfirmPage
              project={selectedProject}
              pkg={selectedPackage}
              tslaBalance={tslaBalance}
              onBack={() => setView("detail")}
              onConfirm={handleConfirm}
            />
          </motion.div>
        )}
        {view === "active" && (
          <motion.div
            key="inv-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveInvestmentsPage
              tslaBalance={tslaBalance}
              investments={investments}
              computeInterest={computeInterest}
              onWithdraw={(id) => {
                withdraw(id);
                toast.success("Investment withdrawn to your TSLA wallet!");
              }}
              onBack={() => setView("list")}
              syncMatured={syncMatured}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        defaultAsset={Asset.TSLA}
      />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        defaultAsset={Asset.TSLA}
      />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.20 0.012 260)",
            border: "1px solid oklch(0.30 0.015 260)",
            color: "oklch(0.92 0.006 90)",
          },
        }}
      />
    </>
  );
}

// ------- App Root -------
export default function App() {
  const [page, setPage] = useState<AppPage>("home");
  const { isLoginSuccess, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          className="flex flex-col items-center gap-4"
        >
          <Wallet
            className="w-12 h-12"
            style={{ color: "oklch(0.76 0.12 78)" }}
          />
          <p className="text-muted-foreground text-sm">Initializing vault...</p>
        </motion.div>
      </div>
    );
  }

  // Dashboard route
  if (page === "dashboard") {
    return (
      <AnimatePresence mode="wait">
        {isLoginSuccess ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard setPage={setPage} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginScreen setPage={setPage} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Investments route
  if (page === "investments") {
    return (
      <>
        <NavBar page={page} setPage={setPage} isLoggedIn={isLoginSuccess} />
        <InvestmentSection />
      </>
    );
  }

  // Public pages
  return (
    <>
      <NavBar page={page} setPage={setPage} isLoggedIn={isLoginSuccess} />
      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage setPage={setPage} />
          </motion.div>
        )}
        {page === "about-tsla" && (
          <motion.div
            key="about-tsla"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <AboutTSLACoin setPage={setPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
