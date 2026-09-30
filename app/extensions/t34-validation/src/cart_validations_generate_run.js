// T34 throwaway cart and checkout validation Function (plain JavaScript).
// Trivial rule for the acceptance: a single cart line may not carry more
// than 99 units. Anything at or below the limit passes with no errors.

const MAX_LINE_QUANTITY = 99;

export function cartValidationsGenerateRun(input) {
  const errors = input.cart.lines
    .filter((line) => line.quantity > MAX_LINE_QUANTITY)
    .map(() => ({
      message: "Not possible to order more than 99 of each item",
      target: "$.cart",
    }));

  const operations = [
    {
      validationAdd: {
        errors,
      },
    },
  ];

  return { operations };
}
