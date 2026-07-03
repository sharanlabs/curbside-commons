#!/usr/bin/env node
/**
 * Verifier CLI — W0 STUB (plan §6, C1).
 *
 * Prints usage for the future `check <feed.json> --against <catalog.json>`
 * command and exits non-zero on unknown arguments. This path makes ZERO LLM
 * calls, ever — the wedge is $0-LLM (C1). W1 wires the real deterministic
 * comparator behind `check`.
 *
 * Plain: the command line you will run to check a feed against a catalog. Right
 * now it only explains itself and rejects commands it does not know.
 */

const USAGE = `verifier (W0 skeleton — no checks implemented yet)

Usage:
  check <feed.json> --against <catalog.json>   Verify a serving copy against a reference (W1)
  help                                         Show this message

Notes:
  - This path performs NO LLM calls (C1: the wedge is $0-LLM).
  - W0 is a skeleton: verifier-core and the packs are stubs; no drift is detected yet.
`;

/**
 * @param {string[]} argv - process.argv
 * @returns {number} process exit code (non-zero on unknown command)
 */
function main(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    process.stdout.write(USAGE);
    return 0;
  }

  if (cmd === "check") {
    process.stdout.write(
      "check: not implemented in W0 (skeleton). The deterministic comparator lands in W1.\n\n",
    );
    process.stdout.write(USAGE);
    return 0;
  }

  process.stderr.write(`Unknown command: ${cmd}\n\n`);
  process.stderr.write(USAGE);
  return 2;
}

process.exit(main(process.argv));
