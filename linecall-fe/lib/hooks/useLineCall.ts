"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import LineCall from "../contracts/LineCall";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import type { FeePresetLevel } from "../genlayer/fees";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { CreateDisputeInput, Dispute } from "../contracts/types";

export function useLineCallContract(): LineCall | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  return useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.",
        {
          label: "Setup Guide",
          onClick: () => window.open("/docs/setup", "_blank"),
        }
      );
      return null;
    }
    return new LineCall(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);
}

export function useDisputes() {
  const contract = useLineCallContract();

  return useQuery<Dispute[], Error>({
    queryKey: ["disputes"],
    queryFn: () => (contract ? contract.getDisputes() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function useDispute(disputeId: string | undefined) {
  const contract = useLineCallContract();

  return useQuery<Dispute | null, Error>({
    queryKey: ["dispute", disputeId],
    queryFn: () =>
      contract && disputeId
        ? contract.getDispute(disputeId)
        : Promise.resolve(null),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!disputeId,
  });
}

export function useDisputeIds() {
  const contract = useLineCallContract();

  return useQuery<string[], Error>({
    queryKey: ["disputeIds"],
    queryFn: () => (contract ? contract.listDisputeIds() : Promise.resolve([])),
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function useTotalDisputes() {
  const contract = useLineCallContract();

  return useQuery<number, Error>({
    queryKey: ["totalDisputes"],
    queryFn: () => (contract ? contract.getTotalDisputes() : Promise.resolve(0)),
    staleTime: 2000,
    enabled: !!contract,
  });
}

function invalidateDockets(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["disputes"] });
  queryClient.invalidateQueries({ queryKey: ["dispute"] });
  queryClient.invalidateQueries({ queryKey: ["disputeIds"] });
  queryClient.invalidateQueries({ queryKey: ["totalDisputes"] });
}

export function useCreateDispute() {
  const contract = useLineCallContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      input,
      feePresetLevel,
    }: {
      input: CreateDisputeInput;
      feePresetLevel?: FeePresetLevel;
    }) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsCreating(true);
      const feePreset = await contract.estimateCreateDisputeFees(
        input,
        feePresetLevel ?? "standard"
      );
      return contract.createDispute(input, feePreset);
    },
    onSuccess: () => {
      invalidateDockets(queryClient);
      setIsCreating(false);
      success("Dispute filed", {
        description: "Claim and rule text are locked on-chain.",
      });
    },
    onError: (err: any) => {
      setIsCreating(false);
      error("Failed to file dispute", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createDispute: mutation.mutate,
    createDisputeAsync: mutation.mutateAsync,
  };
}

export function useResolveDispute() {
  const contract = useLineCallContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (disputeId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsResolving(true);
      setResolvingId(disputeId);
      return contract.resolve(disputeId);
    },
    onSuccess: () => {
      invalidateDockets(queryClient);
      setIsResolving(false);
      setResolvingId(null);
      success("Call resolved", {
        description: "Committee wrote YES, NO, or VOID.",
      });
    },
    onError: (err: any) => {
      setIsResolving(false);
      setResolvingId(null);
      error("Resolve failed", {
        description: err?.message || "Sources may be unreachable.",
      });
    },
  });

  return {
    ...mutation,
    isResolving,
    resolvingId,
    resolveDispute: mutation.mutate,
    resolveDisputeAsync: mutation.mutateAsync,
  };
}

export function useAppealDispute() {
  const contract = useLineCallContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAppealing, setIsAppealing] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      disputeId,
      appealContext,
    }: {
      disputeId: string;
      appealContext: string;
    }) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsAppealing(true);
      return contract.appeal(disputeId, appealContext);
    },
    onSuccess: () => {
      invalidateDockets(queryClient);
      setIsAppealing(false);
      success("Appeal submitted", {
        description: "One re-review is now on record.",
      });
    },
    onError: (err: any) => {
      setIsAppealing(false);
      error("Appeal failed", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isAppealing,
    appealDispute: mutation.mutate,
    appealDisputeAsync: mutation.mutateAsync,
  };
}