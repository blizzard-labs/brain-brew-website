"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export const DONATION_PROGRESS_REFRESH = "donation-progress:refresh";

export function MatchedGiftForm() {
  const [amount, setAmount] = useState("");
  const [charity, setCharity] = useState("");
  const [state, setState] = useState<{ status: "idle" | "saving" | "saved" | "error"; message?: string }>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const website = new FormData(event.currentTarget).get("website");
    setState({ status: "saving" });
    try {
      const response = await fetch("/api/matched-gifts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount, charity, website }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not save your match. Please try again.");
      setAmount("");
      setCharity("");
      setState({ status: "saved", message: "Thank you! Your match has been added to our total." });
      window.dispatchEvent(new Event(DONATION_PROGRESS_REFRESH));
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Could not save your match." });
    }
  };

  return (
    <form className="matched-gift-form" onSubmit={submit}>
      <label htmlFor="matched-gift-amount">
        Has your employer already matched? Enter the matched amount to help us track our progress.
      </label>
      <div className="matched-gift-row">
        <select
          className="matched-gift-charity"
          name="charity"
          aria-label="Charity your employer matched"
          required
          value={charity}
          onChange={(event) => setCharity(event.target.value)}
        >
          <option value="" disabled>Charity</option>
          <option value="alzheimers">Alzheimer’s Assoc.</option>
          <option value="michaelJFox">Michael J. Fox</option>
        </select>
        <span className="matched-gift-input">
          <span aria-hidden="true">$</span>
          <input
            id="matched-gift-amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="1"
            max="1000"
            step="0.01"
            placeholder="0.00"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </span>
        <Button type="submit" size="sm" className="matched-gift-submit" disabled={state.status === "saving"}>
          {state.status === "saving" ? "Adding…" : "Add match"}
        </Button>
      </div>
      <input className="matched-gift-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state.message && (
        <p className={`matched-gift-status ${state.status}`} role="status">{state.message}</p>
      )}
    </form>
  );
}
