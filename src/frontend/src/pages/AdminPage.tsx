import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Loader2,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Direction, UserRole } from "../backend";
import type { Transaction } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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

  const deposits = transactions.filter(
    (t) => t.direction === Direction.receive,
  );
  const withdrawals = transactions.filter(
    (t) => t.direction === Direction.send,
  );
  const totalDeposits = deposits.reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = withdrawals.reduce((s, t) => s + t.amount, 0);

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
            icon: Users,
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
            label: "Net Volume",
            value: `${(totalDeposits - totalWithdrawals).toFixed(2)}`,
            icon: DollarSign,
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
          className="mb-6"
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
