import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Asset } from "../backend.d";
import { useActor } from "./useActor";

export function useBalances() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["balances"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBalances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDisplayName() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["displayName"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getDisplayName();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      counterparty,
      note,
    }: {
      asset: Asset;
      amount: number;
      counterparty: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendAsset(asset, amount, counterparty, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useReceiveAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      counterparty,
      note,
    }: {
      asset: Asset;
      amount: number;
      counterparty: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.receiveAsset(asset, amount, counterparty, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAddMockBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ asset, amount }: { asset: Asset; amount: number }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMockBalance(asset, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useInitializeWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.initializeWallet();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["displayName"] });
    },
  });
}
