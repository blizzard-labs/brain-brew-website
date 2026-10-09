import assert from "node:assert/strict";
import test from "node:test";
import { parseAlzheimersTotal, parseMichaelJFoxTotal } from "../lib/donation-progress.ts";

test("reads the Alzheimer's raised amount, not the goal or roster", () => {
  assert.equal(parseAlzheimersTotal('<span class="total-goal-value">$5,000</span><span class="amount-raised-value"> $1,250.50 </span>'), 1250.5);
  assert.equal(parseAlzheimersTotal('<span class="amount-raised-value">$0</span>'), 0);
  assert.throws(() => parseAlzheimersTotal('<span class="total-goal-value">$5,000</span>'));
});
test("reads the MJFF team total rather than its parent campaign", () => {
  const page = 'var SC = ' + JSON.stringify({ campaign: { total_raised: 90000 }, team: { id: 846507, currency_code: "USD", total_raised: 153.81, name: 'Brain "Brew" {team}' } }) + '; unrelated();';
  assert.equal(parseMichaelJFoxTotal(page), 153.81);
  assert.throws(() => parseMichaelJFoxTotal(page.replace('846507', '999')));
  assert.throws(() => parseMichaelJFoxTotal(page.replace('USD', 'EUR')));
  assert.throws(() => parseMichaelJFoxTotal(page.replace('153.81', '-1')));
  assert.throws(() => parseMichaelJFoxTotal('var SC = {'));
});
