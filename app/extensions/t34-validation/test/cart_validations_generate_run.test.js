// Offline unit test for the t34-validation Function run export.
// Uses only the node stdlib test runner: no install, no network, no wasm
// build. (The reference cc-g4-fn integration test drives the compiled wasm
// via @shopify/shopify-function-test-helpers, which needs `shopify app
// function build` + Shopify login; the coordinator runs that in CI.)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cartValidationsGenerateRun } from "../src/cart_validations_generate_run.js";

function inputWithQuantities(quantities) {
  return { cart: { lines: quantities.map((quantity) => ({ quantity })) } };
}

describe("cartValidationsGenerateRun", () => {
  it("passes a cart whose lines are all within the limit", () => {
    const result = cartValidationsGenerateRun(inputWithQuantities([1, 1, 99]));
    assert.deepEqual(result, { operations: [{ validationAdd: { errors: [] } }] });
  });

  it("blocks a cart line above 99 units", () => {
    const result = cartValidationsGenerateRun(inputWithQuantities([1, 100]));
    assert.deepEqual(result, {
      operations: [
        {
          validationAdd: {
            errors: [{ message: "Not possible to order more than 99 of each item", target: "$.cart" }],
          },
        },
      ],
    });
  });

  it("emits one error per offending line", () => {
    const result = cartValidationsGenerateRun(inputWithQuantities([100, 2, 250]));
    assert.equal(result.operations[0].validationAdd.errors.length, 2);
  });
});
