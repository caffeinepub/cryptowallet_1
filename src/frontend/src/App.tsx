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
  Download,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Send,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Asset, Direction } from "./backend.d";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddMockBalance,
  useBalances,
  useDisplayName,
  useInitializeWallet,
  useReceiveAsset,
  useSendAsset,
  useTransactionHistory,
} from "./hooks/useQueries";

// ------- constants -------
const USD_PRICES: Record<Asset, number> = {
  [Asset.BTC]: 65000,
  [Asset.ETH]: 3200,
  [Asset.ICP]: 12,
  [Asset.USDT]: 1,
};

const ASSET_DECIMALS: Record<Asset, number> = {
  [Asset.BTC]: 8,
  [Asset.ETH]: 6,
  [Asset.ICP]: 4,
  [Asset.USDT]: 2,
};

const ASSET_COLORS: Record<Asset, string> = {
  [Asset.BTC]: "#F7931A",
  [Asset.ETH]: "#627EEA",
  [Asset.ICP]: "#29ABE2",
  [Asset.USDT]: "#26A17B",
};

const ASSET_ICONS: Record<Asset, string> = {
  [Asset.BTC]: "₿",
  [Asset.ETH]: "Ξ",
  [Asset.ICP]: "∞",
  [Asset.USDT]: "$",
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

// ------- Login Screen -------
function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
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
        {/* Logo */}
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
          <span className="gold-shimmer">CryptoVault</span>
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
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          Powered by on-chain authentication. No passwords.
        </motion.p>
      </motion.div>
    </div>
  );
}

// ------- Asset Card -------
function AssetCard({
  asset,
  balance,
  index,
}: {
  asset: Asset;
  balance: number;
  index: number;
}) {
  const usdValue = balance * USD_PRICES[asset];
  const color = ASSET_COLORS[asset];
  const icon = ASSET_ICONS[asset];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      data-ocid={`asset.card.${index + 1}` as any}
      className="card-glow rounded-xl p-5 transition-all duration-300 cursor-default group"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.19 0.012 260 / 0.95), oklch(0.17 0.008 260 / 0.98))",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
          style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-mono px-2 py-1 rounded-md font-medium"
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}25`,
          }}
        >
          {asset}
        </span>
      </div>
      <div>
        <p className="text-2xl font-mono font-medium text-foreground">
          {formatAmount(balance, asset)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {formatUSD(usdValue)}
        </p>
      </div>
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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [asset, setAsset] = useState<Asset>(Asset.BTC);
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [note, setNote] = useState("");
  const sendAsset = useSendAsset();

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
              placeholder={`0.${"0".repeat(ASSET_DECIMALS[asset])}`}
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

// ------- Receive Modal -------
function ReceiveModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [asset, setAsset] = useState<Asset>(Asset.BTC);
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [note, setNote] = useState("");
  const receiveAsset = useReceiveAsset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !counterparty) return;
    try {
      await receiveAsset.mutateAsync({
        asset,
        amount: Number.parseFloat(amount),
        counterparty,
        note,
      });
      toast.success(`Received ${amount} ${asset} successfully`);
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
              Amount
            </Label>
            <Input
              data-ocid="receive.input"
              type="number"
              placeholder={`0.${"0".repeat(ASSET_DECIMALS[asset])}`}
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
              Sender Address
            </Label>
            <Input
              data-ocid="receive.counterparty.input"
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
              data-ocid="receive.note.input"
              placeholder="Add a memo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="receive.cancel_button"
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="receive.submit_button"
              type="submit"
              className="flex-1"
              disabled={receiveAsset.isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.15 145), oklch(0.52 0.14 145))",
                color: "oklch(0.97 0.003 90)",
                border: "none",
              }}
            >
              {receiveAsset.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {receiveAsset.isPending ? "Recording..." : "Record Receipt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------- Add Demo Funds Modal -------
function DemoFundsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [asset, setAsset] = useState<Asset>(Asset.BTC);
  const [amount, setAmount] = useState("");
  const addMockBalance = useAddMockBalance();

  const PRESETS: Record<Asset, number[]> = {
    [Asset.BTC]: [0.01, 0.1, 0.5],
    [Asset.ETH]: [0.1, 1, 5],
    [Asset.ICP]: [10, 100, 1000],
    [Asset.USDT]: [100, 1000, 10000],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    try {
      await addMockBalance.mutateAsync({
        asset,
        amount: Number.parseFloat(amount),
      });
      toast.success(`Added ${amount} ${asset} to your vault`);
      onClose();
      setAmount("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add funds");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="demo.dialog"
        className="max-w-md"
        style={{
          background: "oklch(0.17 0.01 260)",
          border: "1px solid oklch(0.76 0.12 78 / 0.2)",
          boxShadow: "0 20px 60px oklch(0 0 0 / 0.7)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Plus
              className="w-5 h-5"
              style={{ color: "oklch(0.76 0.12 78)" }}
            />
            Add Demo Funds
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Asset
            </Label>
            <Select
              value={asset}
              onValueChange={(v) => {
                setAsset(v as Asset);
                setAmount("");
              }}
            >
              <SelectTrigger
                data-ocid="demo.select"
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

          {/* Quick presets */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Quick amounts
            </Label>
            <div className="flex gap-2">
              {PRESETS[asset].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className="flex-1 py-2 text-xs font-mono rounded-md transition-all"
                  style={{
                    background:
                      amount === String(p)
                        ? "oklch(0.76 0.12 78 / 0.2)"
                        : "oklch(0.22 0.015 260)",
                    border:
                      amount === String(p)
                        ? "1px solid oklch(0.76 0.12 78 / 0.5)"
                        : "1px solid oklch(0.28 0.015 260)",
                    color:
                      amount === String(p)
                        ? "oklch(0.76 0.12 78)"
                        : "oklch(0.70 0.008 90)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
              Custom Amount
            </Label>
            <Input
              data-ocid="demo.input"
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border font-mono"
              step="any"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="demo.cancel_button"
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="demo.submit_button"
              type="submit"
              className="flex-1"
              disabled={addMockBalance.isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                color: "oklch(0.12 0.01 260)",
                border: "none",
              }}
            >
              {addMockBalance.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {addMockBalance.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------- Dashboard -------
function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const { data: balances, isLoading: balancesLoading } = useBalances();
  const { data: transactions, isLoading: txLoading } = useTransactionHistory();
  const { data: displayName } = useDisplayName();
  const initWallet = useInitializeWallet();

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize wallet on first load
  useEffect(() => {
    if (actor && !actorLoading && !initialized) {
      setInitialized(true);
      initWallet.mutate();
    }
  }, [actor, actorLoading, initialized, initWallet]);

  const totalUSD =
    balances?.reduce((sum, b) => sum + b.balance * USD_PRICES[b.asset], 0) ?? 0;

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "";

  const recentTx = [...(transactions ?? [])]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50">
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.14 0.008 260 / 0.85)" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <div>
              <p
                className="text-sm font-display font-semibold"
                style={{ color: "oklch(0.76 0.12 78)" }}
              >
                {displayName || "CryptoVault"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
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
        {/* Portfolio Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          data-ocid="portfolio.card"
          className="portfolio-card noise-bg rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Decorative background rings */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
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
            {
              label: "Add Funds",
              icon: Plus,
              ocid: "wallet.demo_button",
              onClick: () => setDemoOpen(true),
              style: {
                background:
                  "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                border: "none",
                color: "oklch(0.12 0.01 260)",
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

        {/* Asset Grid */}
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

        {/* Transaction History */}
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

      {/* Footer */}
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

      {/* Modals */}
      <SendModal open={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveModal open={receiveOpen} onClose={() => setReceiveOpen(false)} />
      <DemoFundsModal open={demoOpen} onClose={() => setDemoOpen(false)} />

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

// ------- App Root -------
export default function App() {
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
          <Dashboard />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
