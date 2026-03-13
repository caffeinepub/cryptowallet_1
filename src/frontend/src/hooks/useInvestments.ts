import { useCallback, useState } from "react";

export interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  packageName: "Signature" | "Prestige" | "Elite";
  amount: number;
  interestRate: number;
  durationDays: number;
  startTime: number;
  status: "active" | "matured" | "withdrawn";
}

const BALANCE_KEY = "tsla_balance";
const INVESTMENTS_KEY = "tsla_investments";
const DEFAULT_BALANCE = 5000;

function loadBalance(): number {
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    localStorage.setItem(BALANCE_KEY, String(DEFAULT_BALANCE));
    return DEFAULT_BALANCE;
  }
  return Number(stored);
}

function loadInvestments(): Investment[] {
  const stored = localStorage.getItem(INVESTMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Investment[];
  } catch {
    return [];
  }
}

function saveInvestments(investments: Investment[]) {
  localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
}

export function useInvestments() {
  const [tslaBalance, setTslaBalance] = useState<number>(loadBalance);
  const [investments, setInvestments] = useState<Investment[]>(loadInvestments);

  const invest = useCallback(
    (
      projectId: string,
      projectName: string,
      pkg: {
        name: "Signature" | "Prestige" | "Elite";
        interestRate: number;
        durationDays: number;
      },
      amount: number,
    ) => {
      const newBalance = tslaBalance - amount;
      const newInvestment: Investment = {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        projectId,
        projectName,
        packageName: pkg.name,
        amount,
        interestRate: pkg.interestRate,
        durationDays: pkg.durationDays,
        startTime: Date.now(),
        status: "active",
      };
      const updated = [...investments, newInvestment];
      localStorage.setItem(BALANCE_KEY, String(newBalance));
      saveInvestments(updated);
      setTslaBalance(newBalance);
      setInvestments(updated);
    },
    [tslaBalance, investments],
  );

  const withdraw = useCallback(
    (investmentId: string) => {
      const inv = investments.find((i) => i.id === investmentId);
      if (!inv) return;
      const interest = computeInterest(inv);
      const totalReturn = inv.amount + interest;
      const newBalance = tslaBalance + totalReturn;
      const updated = investments.map((i) =>
        i.id === investmentId ? { ...i, status: "withdrawn" as const } : i,
      );
      localStorage.setItem(BALANCE_KEY, String(newBalance));
      saveInvestments(updated);
      setTslaBalance(newBalance);
      setInvestments(updated);
    },
    [investments, tslaBalance],
  );

  const computeInterest = (investment: Investment): number => {
    const now = Date.now();
    const elapsed = now - investment.startTime;
    const durationMs = investment.durationDays * 24 * 60 * 60 * 1000;
    const progress = Math.min(elapsed / durationMs, 1);
    return investment.amount * investment.interestRate * progress;
  };

  // Sync matured status
  const syncMatured = useCallback(() => {
    const now = Date.now();
    let changed = false;
    const updated = investments.map((inv) => {
      if (inv.status === "active") {
        const endTime = inv.startTime + inv.durationDays * 24 * 60 * 60 * 1000;
        if (now >= endTime) {
          changed = true;
          return { ...inv, status: "matured" as const };
        }
      }
      return inv;
    });
    if (changed) {
      saveInvestments(updated);
      setInvestments(updated);
    }
  }, [investments]);

  return {
    tslaBalance,
    investments,
    invest,
    withdraw,
    computeInterest,
    syncMatured,
  };
}
