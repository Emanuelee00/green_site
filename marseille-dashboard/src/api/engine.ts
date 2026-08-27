import type { QuartierCollection, HistoryResponse } from "../types";

const BASE = "/api";

export const fetchQuartiers = (): Promise<QuartierCollection> =>
  fetch(`${BASE}/uhi/quartiers`).then((r) => r.json());

export const fetchRisk = (month: number): Promise<QuartierCollection> =>
  fetch(`${BASE}/risk/?month=${month}`).then((r) => r.json());

export const fetchHistory = (zone: string): Promise<HistoryResponse> =>
  fetch(`${BASE}/history/${zone}?from=2000&to=2024`).then((r) => r.json());
