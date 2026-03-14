import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  DollarSign,
  Loader2,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Asset, Direction, UserRole } from "../backend";
import type { Transaction } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ---------- Pending Payment types ----------
interface PendingItem {
  id: string;
  userPrincipal: string;
  asset: Asset;
  amount: number;
  note: string;
  submittedAt: number;
  status: "pending" | "approved" | "rejected";
}

const PENDING_PAYMENTS_KEY = "truptar_pending_payments";
const PENDING_WITHDRAWALS_KEY = "truptar_pending_withdrawals";

function loadItems(key: string): PendingItem[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveItems(key: string, items: PendingItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- Pending Payment Form ----------
function PendingItemForm({
  onAdd,
}: {
  onAdd: (item: Omit<PendingItem, "id" | "submittedAt" | "status">) => void;
}) {
  const [principal, setPrincipal] = useState("");
  const [asset, setAsset] = useState<Asset>(Asset.BTC);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!principal.trim() || !amount || Number.isNaN(Number(amount))) {
      toast.error("Fill in all required fields with valid values");
      return;
    }
    onAdd({
      userPrincipal: principal.trim(),
      asset,
      amount: Number(amount),
      note,
    });
    setPrincipal("");
    setAmount("");
    setNote("");
    toast.success("Entry added");
  };

  return (
    <div
      className="p-5 rounded-xl mb-6 space-y-4"
      style={{
        background: "oklch(0.13 0.008 260)",
        border: "1px solid oklch(0.26 0.015 260)",
      }}
    >
      <h3
        className="text-sm font-semibold"
        style={{ color: "oklch(0.76 0.12 78)" }}
      >
        Add New Entry
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs" style={{ color: "oklch(0.65 0.008 90)" }}>
            Principal ID *
          </Label>
          <Input
            data-ocid="admin.input"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. rdmx6-jaaaa-…"
            style={{
              background: "oklch(0.16 0.01 260)",
              borderColor: "oklch(0.26 0.015 260)",
              color: "oklch(0.92 0.008 260)",
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs" style={{ color: "oklch(0.65 0.008 90)" }}>
            Asset *
          </Label>
          <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
            <SelectTrigger
              data-ocid="admin.select"
              style={{
                background: "oklch(0.16 0.01 260)",
                borderColor: "oklch(0.26 0.015 260)",
                color: "oklch(0.92 0.008 260)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(0.16 0.01 260)",
                borderColor: "oklch(0.26 0.015 260)",
              }}
            >
              {Object.values(Asset).map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs" style={{ color: "oklch(0.65 0.008 90)" }}>
            Amount *
          </Label>
          <Input
            data-ocid="admin.input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="number"
            min="0"
            style={{
              background: "oklch(0.16 0.01 260)",
              borderColor: "oklch(0.26 0.015 260)",
              color: "oklch(0.92 0.008 260)",
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs" style={{ color: "oklch(0.65 0.008 90)" }}>
            Note
          </Label>
          <Textarea
            data-ocid="admin.textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note…"
            rows={1}
            style={{
              background: "oklch(0.16 0.01 260)",
              borderColor: "oklch(0.26 0.015 260)",
              color: "oklch(0.92 0.008 260)",
            }}
          />
        </div>
      </div>
      <Button
        data-ocid="admin.primary_button"
        onClick={handleSubmit}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
          color: "oklch(0.12 0.01 260)",
          border: "none",
        }}
      >
        Add Entry
      </Button>
    </div>
  );
}

// ---------- Pending Items Table ----------
function PendingItemsTable({
  items,
  showAll,
  onApprove,
  onReject,
  processing,
}: {
  items: PendingItem[];
  showAll: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processing: Set<string>;
}) {
  const filtered = showAll
    ? items
    : items.filter((i) => i.status === "pending");
  const truncate = (s: string) =>
    s.length > 16 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12" data-ocid="admin.empty_state">
        <p style={{ color: "oklch(0.55 0.008 260)" }}>No entries found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="admin.table">
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "oklch(0.22 0.012 260)" }}>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Principal
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Asset
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Amount
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Note
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Submitted
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Status
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, idx) => (
            <TableRow
              key={item.id}
              data-ocid={`admin.row.${idx + 1}`}
              style={{ borderColor: "oklch(0.22 0.012 260)" }}
            >
              <TableCell
                className="font-mono text-xs"
                style={{ color: "oklch(0.65 0.008 90)" }}
              >
                {truncate(item.userPrincipal)}
              </TableCell>
              <TableCell
                className="font-mono text-sm"
                style={{ color: "oklch(0.76 0.12 78)" }}
              >
                {item.asset}
              </TableCell>
              <TableCell
                className="font-mono"
                style={{ color: "oklch(0.92 0.008 260)" }}
              >
                {item.amount.toFixed(4)}
              </TableCell>
              <TableCell
                className="text-xs max-w-32 truncate"
                style={{ color: "oklch(0.55 0.008 260)" }}
              >
                {item.note || "—"}
              </TableCell>
              <TableCell
                className="text-xs"
                style={{ color: "oklch(0.55 0.008 260)" }}
              >
                {new Date(item.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    background:
                      item.status === "approved"
                        ? "oklch(0.68 0.15 145 / 0.15)"
                        : item.status === "rejected"
                          ? "oklch(0.65 0.18 30 / 0.15)"
                          : "oklch(0.76 0.12 78 / 0.15)",
                    color:
                      item.status === "approved"
                        ? "oklch(0.68 0.15 145)"
                        : item.status === "rejected"
                          ? "oklch(0.65 0.18 30)"
                          : "oklch(0.76 0.12 78)",
                    border: `1px solid ${
                      item.status === "approved"
                        ? "oklch(0.68 0.15 145 / 0.3)"
                        : item.status === "rejected"
                          ? "oklch(0.65 0.18 30 / 0.3)"
                          : "oklch(0.76 0.12 78 / 0.3)"
                    }`,
                  }}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                {item.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      data-ocid="admin.confirm_button"
                      disabled={processing.has(item.id)}
                      onClick={() => onApprove(item.id)}
                      className="h-7 px-2.5 text-xs"
                      style={{
                        background: "oklch(0.68 0.15 145 / 0.15)",
                        color: "oklch(0.68 0.15 145)",
                        border: "1px solid oklch(0.68 0.15 145 / 0.3)",
                      }}
                    >
                      {processing.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      data-ocid="admin.delete_button"
                      disabled={processing.has(item.id)}
                      onClick={() => onReject(item.id)}
                      className="h-7 px-2.5 text-xs"
                      style={{
                        background: "oklch(0.65 0.18 30 / 0.15)",
                        color: "oklch(0.65 0.18 30)",
                        border: "1px solid oklch(0.65 0.18 30 / 0.3)",
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------- Main AdminPage ----------
export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [principalInput, setPrincipalInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [assigningRole, setAssigningRole] = useState(false);

  // Pending payments state
  const [pendingPayments, setPendingPayments] = useState<PendingItem[]>(() =>
    loadItems(PENDING_PAYMENTS_KEY),
  );
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingItem[]>(
    () => loadItems(PENDING_WITHDRAWALS_KEY),
  );
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(
    new Set(),
  );
  const [processingWithdrawals, setProcessingWithdrawals] = useState<
    Set<string>
  >(new Set());

  const checkAdmin = useCallback(async () => {
    if (!actor || isFetching) return;
    try {
      const result = await actor.isCallerAdmin();
      setIsAdmin(result);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }, [actor, isFetching]);

  const fetchTransactions = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoadingTx(true);
    try {
      const txs = await actor.getTransactionHistory();
      setTransactions(
        [...txs].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
      );
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTx(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    if (!isFetching && actor) {
      checkAdmin();
    }
  }, [checkAdmin, isFetching, actor]);

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions();
    }
  }, [isAdmin, fetchTransactions]);

  const handleAssignRole = async () => {
    if (!actor || !principalInput.trim()) {
      toast.error("Enter a valid principal ID");
      return;
    }
    setAssigningRole(true);
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const p = Principal.fromText(principalInput.trim());
      await actor.assignCallerUserRole(p, selectedRole);
      toast.success(`Role ${selectedRole} assigned successfully`);
      setPrincipalInput("");
    } catch (e) {
      toast.error(`Failed to assign role: ${String(e)}`);
    } finally {
      setAssigningRole(false);
    }
  };

  // Pending payments handlers
  const addPendingPayment = (
    item: Omit<PendingItem, "id" | "submittedAt" | "status">,
  ) => {
    const newItem: PendingItem = {
      ...item,
      id: generateId(),
      submittedAt: Date.now(),
      status: "pending",
    };
    const updated = [newItem, ...pendingPayments];
    setPendingPayments(updated);
    saveItems(PENDING_PAYMENTS_KEY, updated);
  };

  const approvePayment = async (id: string) => {
    if (!actor) return;
    setProcessingPayments((prev) => new Set([...prev, id]));
    try {
      const item = pendingPayments.find((p) => p.id === id);
      if (!item) return;
      await actor.receiveAsset(
        item.asset,
        item.amount,
        item.userPrincipal,
        item.note,
      );
      const updated = pendingPayments.map((p) =>
        p.id === id ? { ...p, status: "approved" as const } : p,
      );
      setPendingPayments(updated);
      saveItems(PENDING_PAYMENTS_KEY, updated);
      toast.success("Payment approved and recorded");
    } catch (e) {
      toast.error(`Failed to approve: ${String(e)}`);
    } finally {
      setProcessingPayments((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const rejectPayment = (id: string) => {
    const updated = pendingPayments.map((p) =>
      p.id === id ? { ...p, status: "rejected" as const } : p,
    );
    setPendingPayments(updated);
    saveItems(PENDING_PAYMENTS_KEY, updated);
    toast.success("Payment rejected");
  };

  // Pending withdrawals handlers
  const addPendingWithdrawal = (
    item: Omit<PendingItem, "id" | "submittedAt" | "status">,
  ) => {
    const newItem: PendingItem = {
      ...item,
      id: generateId(),
      submittedAt: Date.now(),
      status: "pending",
    };
    const updated = [newItem, ...pendingWithdrawals];
    setPendingWithdrawals(updated);
    saveItems(PENDING_WITHDRAWALS_KEY, updated);
  };

  const approveWithdrawal = async (id: string) => {
    if (!actor) return;
    setProcessingWithdrawals((prev) => new Set([...prev, id]));
    try {
      const item = pendingWithdrawals.find((w) => w.id === id);
      if (!item) return;
      await actor.sendAsset(
        item.asset,
        item.amount,
        item.userPrincipal,
        item.note,
      );
      const updated = pendingWithdrawals.map((w) =>
        w.id === id ? { ...w, status: "approved" as const } : w,
      );
      setPendingWithdrawals(updated);
      saveItems(PENDING_WITHDRAWALS_KEY, updated);
      toast.success("Withdrawal approved and recorded");
    } catch (e) {
      toast.error(`Failed to approve: ${String(e)}`);
    } finally {
      setProcessingWithdrawals((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const rejectWithdrawal = (id: string) => {
    const updated = pendingWithdrawals.map((w) =>
      w.id === id ? { ...w, status: "rejected" as const } : w,
    );
    setPendingWithdrawals(updated);
    saveItems(PENDING_WITHDRAWALS_KEY, updated);
    toast.success("Withdrawal request rejected");
  };

  const deposits = transactions.filter(
    (t) => t.direction === Direction.receive,
  );
  const withdrawals = transactions.filter(
    (t) => t.direction === Direction.send,
  );

  // Registered users: unique counterparties
  const registeredUsers = useMemo(() => {
    const map = new Map<
      string,
      { firstSeen: bigint; txCount: number; assets: Set<string> }
    >();
    for (const tx of transactions) {
      if (!tx.counterparty) continue;
      const existing = map.get(tx.counterparty);
      if (!existing) {
        map.set(tx.counterparty, {
          firstSeen: tx.timestamp,
          txCount: 1,
          assets: new Set([String(tx.asset)]),
        });
      } else {
        if (tx.timestamp < existing.firstSeen)
          existing.firstSeen = tx.timestamp;
        existing.txCount++;
        existing.assets.add(String(tx.asset));
      }
    }
    return Array.from(map.entries()).map(([principal, info]) => ({
      principal,
      ...info,
    }));
  }, [transactions]);

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (s: string) =>
    s.length > 16 ? `${s.slice(0, 8)}...${s.slice(-6)}` : s;

  if (checkingAdmin || isFetching) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(0.76 0.12 78)" }}
          />
          <p style={{ color: "oklch(0.55 0.008 260)" }}>
            Verifying admin access…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-sm">
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "oklch(0.65 0.18 30)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.92 0.008 260)" }}
          >
            Not Logged In
          </h2>
          <p style={{ color: "oklch(0.55 0.008 260)" }}>
            Please connect with Internet Identity first.
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-sm">
          <Shield
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "oklch(0.65 0.18 30)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.92 0.008 260)" }}
          >
            Access Denied
          </h2>
          <p style={{ color: "oklch(0.55 0.008 260)" }}>
            You do not have admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-8 max-w-6xl mx-auto"
      data-ocid="admin.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.76 0.12 78 / 0.15)",
            border: "1px solid oklch(0.76 0.12 78 / 0.3)",
          }}
        >
          <Shield
            className="w-5 h-5"
            style={{ color: "oklch(0.76 0.12 78)" }}
          />
        </div>
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "oklch(0.92 0.008 260)" }}
          >
            Admin Dashboard
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.55 0.008 260)" }}>
            Logged in as: {identity.getPrincipal().toString().slice(0, 12)}…
          </p>
        </div>
        <Button
          onClick={fetchTransactions}
          variant="outline"
          size="sm"
          className="ml-auto"
          data-ocid="admin.secondary_button"
          style={{
            borderColor: "oklch(0.26 0.015 260)",
            color: "oklch(0.65 0.008 90)",
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        data-ocid="admin.section"
      >
        {[
          {
            label: "Total Transactions",
            value: transactions.length,
            icon: DollarSign,
            color: "oklch(0.76 0.12 78)",
          },
          {
            label: "Total Deposits",
            value: deposits.length,
            icon: TrendingUp,
            color: "oklch(0.68 0.15 145)",
          },
          {
            label: "Total Withdrawals",
            value: withdrawals.length,
            icon: TrendingDown,
            color: "oklch(0.65 0.18 30)",
          },
          {
            label: "Registered Users",
            value: registeredUsers.length,
            icon: Users,
            color: "oklch(0.68 0.14 220)",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            data-ocid="admin.card"
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.008 260)" }}
                >
                  {stat.label}
                </span>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: "oklch(0.92 0.008 260)" }}
              >
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" data-ocid="admin.panel">
        <TabsList
          className="mb-6 flex-wrap h-auto gap-1"
          style={{
            background: "oklch(0.16 0.01 260)",
            border: "1px solid oklch(0.22 0.012 260)",
          }}
        >
          <TabsTrigger value="overview" data-ocid="admin.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="deposits" data-ocid="admin.tab">
            Deposits ({deposits.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" data-ocid="admin.tab">
            Withdrawals ({withdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="registrations" data-ocid="admin.tab">
            Registrations ({registeredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending-payments" data-ocid="admin.tab">
            Pending Payments (
            {pendingPayments.filter((p) => p.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="withdrawal-requests" data-ocid="admin.tab">
            Withdrawal Requests (
            {pendingWithdrawals.filter((w) => w.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.tab">
            User Management
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="space-y-3" data-ocid="admin.loading_state">
                  {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                    <Skeleton
                      key={id}
                      className="h-12 w-full"
                      style={{ background: "oklch(0.22 0.012 260)" }}
                    />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="admin.empty_state"
                >
                  <p style={{ color: "oklch(0.55 0.008 260)" }}>
                    No transactions found.
                  </p>
                </div>
              ) : (
                <TransactionTable
                  transactions={transactions.slice(0, 20)}
                  formatDate={formatDate}
                  truncate={truncate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                Confirmed Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="space-y-3" data-ocid="admin.loading_state">
                  {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                    <Skeleton
                      key={id}
                      className="h-12 w-full"
                      style={{ background: "oklch(0.22 0.012 260)" }}
                    />
                  ))}
                </div>
              ) : deposits.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="admin.empty_state"
                >
                  <p style={{ color: "oklch(0.55 0.008 260)" }}>
                    No deposits found.
                  </p>
                </div>
              ) : (
                <TransactionTable
                  transactions={deposits}
                  formatDate={formatDate}
                  truncate={truncate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                Confirmed Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="space-y-3" data-ocid="admin.loading_state">
                  {["s1", "s2", "s3", "s4", "s5"].map((id) => (
                    <Skeleton
                      key={id}
                      className="h-12 w-full"
                      style={{ background: "oklch(0.22 0.012 260)" }}
                    />
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="admin.empty_state"
                >
                  <p style={{ color: "oklch(0.55 0.008 260)" }}>
                    No withdrawals found.
                  </p>
                </div>
              ) : (
                <TransactionTable
                  transactions={withdrawals}
                  formatDate={formatDate}
                  truncate={truncate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                Registered Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="space-y-3" data-ocid="admin.loading_state">
                  {["s1", "s2", "s3"].map((id) => (
                    <Skeleton
                      key={id}
                      className="h-12 w-full"
                      style={{ background: "oklch(0.22 0.012 260)" }}
                    />
                  ))}
                </div>
              ) : registeredUsers.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="admin.empty_state"
                >
                  <p style={{ color: "oklch(0.55 0.008 260)" }}>
                    No registered users found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto" data-ocid="admin.table">
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{ borderColor: "oklch(0.22 0.012 260)" }}
                      >
                        <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
                          Principal
                        </TableHead>
                        <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
                          First Seen
                        </TableHead>
                        <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
                          # Transactions
                        </TableHead>
                        <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
                          Assets Used
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredUsers.map((user, idx) => (
                        <TableRow
                          key={user.principal}
                          data-ocid={`admin.row.${idx + 1}`}
                          style={{ borderColor: "oklch(0.22 0.012 260)" }}
                        >
                          <TableCell
                            className="font-mono text-xs"
                            style={{ color: "oklch(0.65 0.008 90)" }}
                          >
                            {truncate(user.principal)}
                          </TableCell>
                          <TableCell
                            className="text-xs"
                            style={{ color: "oklch(0.55 0.008 260)" }}
                          >
                            {formatDate(user.firstSeen)}
                          </TableCell>
                          <TableCell
                            className="font-mono"
                            style={{ color: "oklch(0.92 0.008 260)" }}
                          >
                            {user.txCount}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(user.assets).map((asset) => (
                                <Badge
                                  key={asset}
                                  className="text-xs"
                                  style={{
                                    background: "oklch(0.76 0.12 78 / 0.1)",
                                    color: "oklch(0.76 0.12 78)",
                                    border:
                                      "1px solid oklch(0.76 0.12 78 / 0.25)",
                                  }}
                                >
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Payments Tab */}
        <TabsContent value="pending-payments">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                  Pending Payment Confirmations
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="admin.toggle"
                  onClick={() => setShowAllPayments((v) => !v)}
                  style={{
                    borderColor: "oklch(0.26 0.015 260)",
                    color: "oklch(0.65 0.008 90)",
                  }}
                >
                  {showAllPayments ? "Show Pending Only" : "Show All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PendingItemForm onAdd={addPendingPayment} />
              <PendingItemsTable
                items={pendingPayments}
                showAll={showAllPayments}
                onApprove={approvePayment}
                onReject={rejectPayment}
                processing={processingPayments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawal Requests Tab */}
        <TabsContent value="withdrawal-requests">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                  Withdrawal Requests
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="admin.toggle"
                  onClick={() => setShowAllWithdrawals((v) => !v)}
                  style={{
                    borderColor: "oklch(0.26 0.015 260)",
                    color: "oklch(0.65 0.008 90)",
                  }}
                >
                  {showAllWithdrawals ? "Show Pending Only" : "Show All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PendingItemForm onAdd={addPendingWithdrawal} />
              <PendingItemsTable
                items={pendingWithdrawals}
                showAll={showAllWithdrawals}
                onApprove={approveWithdrawal}
                onReject={rejectWithdrawal}
                processing={processingWithdrawals}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card
            style={{
              background: "oklch(0.16 0.01 260)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "oklch(0.92 0.008 260)" }}>
                Assign User Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="principal-input"
                  className="text-sm mb-1.5 block"
                  style={{ color: "oklch(0.65 0.008 90)" }}
                >
                  Principal ID
                </label>
                <Input
                  id="principal-input"
                  data-ocid="admin.input"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  placeholder="Enter principal ID (e.g. rdmx6-jaaaa-…)"
                  style={{
                    background: "oklch(0.13 0.008 260)",
                    borderColor: "oklch(0.26 0.015 260)",
                    color: "oklch(0.92 0.008 260)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="role-select"
                  className="text-sm mb-1.5 block"
                  style={{ color: "oklch(0.65 0.008 90)" }}
                >
                  Role
                </label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as UserRole)}
                >
                  <SelectTrigger
                    data-ocid="admin.select"
                    style={{
                      background: "oklch(0.13 0.008 260)",
                      borderColor: "oklch(0.26 0.015 260)",
                      color: "oklch(0.92 0.008 260)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "oklch(0.16 0.01 260)",
                      borderColor: "oklch(0.26 0.015 260)",
                    }}
                  >
                    <SelectItem value={UserRole.admin}>Admin</SelectItem>
                    <SelectItem value={UserRole.user}>User</SelectItem>
                    <SelectItem value={UserRole.guest}>Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-ocid="admin.submit_button"
                onClick={handleAssignRole}
                disabled={assigningRole || !principalInput.trim()}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.76 0.12 78), oklch(0.68 0.14 68))",
                  color: "oklch(0.12 0.01 260)",
                  border: "none",
                  opacity: !principalInput.trim() ? 0.5 : 1,
                }}
              >
                {assigningRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  "Assign Role"
                )}
              </Button>
              <p className="text-xs" style={{ color: "oklch(0.45 0.008 260)" }}>
                Note: Role assignment is applied on behalf of the currently
                logged-in admin.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function TransactionTable({
  transactions,
  formatDate,
  truncate,
}: {
  transactions: Transaction[];
  formatDate: (ts: bigint) => string;
  truncate: (s: string) => string;
}) {
  return (
    <div className="overflow-x-auto" data-ocid="admin.table">
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "oklch(0.22 0.012 260)" }}>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Type
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Asset
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Amount
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Counterparty
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Date
            </TableHead>
            <TableHead style={{ color: "oklch(0.55 0.008 260)" }}>
              Note
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={String(tx.id)}
              data-ocid="admin.row"
              style={{ borderColor: "oklch(0.22 0.012 260)" }}
            >
              <TableCell>
                {tx.direction === Direction.receive ? (
                  <Badge
                    className="flex items-center gap-1 w-fit"
                    style={{
                      background: "oklch(0.68 0.15 145 / 0.15)",
                      color: "oklch(0.68 0.15 145)",
                      border: "1px solid oklch(0.68 0.15 145 / 0.3)",
                    }}
                  >
                    <ArrowDownLeft className="w-3 h-3" /> Deposit
                  </Badge>
                ) : (
                  <Badge
                    className="flex items-center gap-1 w-fit"
                    style={{
                      background: "oklch(0.65 0.18 30 / 0.15)",
                      color: "oklch(0.65 0.18 30)",
                      border: "1px solid oklch(0.65 0.18 30 / 0.3)",
                    }}
                  >
                    <ArrowUpRight className="w-3 h-3" /> Withdraw
                  </Badge>
                )}
              </TableCell>
              <TableCell
                style={{ color: "oklch(0.76 0.12 78)" }}
                className="font-mono text-sm"
              >
                {tx.asset}
              </TableCell>
              <TableCell
                style={{ color: "oklch(0.92 0.008 260)" }}
                className="font-mono"
              >
                {tx.amount.toFixed(4)}
              </TableCell>
              <TableCell
                style={{ color: "oklch(0.65 0.008 90)" }}
                className="font-mono text-xs"
              >
                {truncate(tx.counterparty)}
              </TableCell>
              <TableCell
                style={{ color: "oklch(0.55 0.008 260)" }}
                className="text-xs"
              >
                {formatDate(tx.timestamp)}
              </TableCell>
              <TableCell
                style={{ color: "oklch(0.55 0.008 260)" }}
                className="text-xs max-w-32 truncate"
              >
                {tx.note || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
