import { describe, expect, it } from "vitest";
import { simulate, totals, type Transaction } from "./finance";

describe("finance rules", () => {
  it("simulação sem juros soma apenas os aportes", () => {
    const rows = simulate(1000, 100, 0, 1);
    expect(rows.at(-1)?.total).toBeCloseTo(2200);
  });

  it("taxa de 12% a.a. sobre R$ 1.000 por 1 ano rende R$ 1.120", () => {
    expect(simulate(1000, 0, 12, 1).at(-1)?.total).toBeCloseTo(1120, 1);
  });

  it("saldo é receitas menos despesas", () => {
    const txs = [
      { amount: 5000, type: "receita" },
      { amount: 1500, type: "despesa" },
    ] as Transaction[];
    expect(totals(txs).saldo).toBe(3500);
    expect(totals(txs).taxaPoupanca).toBeCloseTo(0.7);
  });
});
