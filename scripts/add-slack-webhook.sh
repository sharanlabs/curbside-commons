#!/usr/bin/env bash
# OWNER-RUN HELPER — pastes the Slack incoming-webhook URL into the gitignored
# .env without the URL ever appearing on screen, in chat logs, or in shell
# history (RULES §11: secrets via environment only, never committed/logged).
#
# Run from the project root (or anywhere — it finds the root itself):
#   bash scripts/add-slack-webhook.sh
#
# What it does: silently prompts for one paste → checks the URL has the exact
# Slack webhook shape (https://hooks.slack.com/services/…) → appends ONE line,
# SLACK_WEBHOOK_URL=…, to .env → confirms WITHOUT showing the value.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ] && grep -q '^SLACK_WEBHOOK_URL=' .env; then
  echo "A SLACK_WEBHOOK_URL line already exists in .env."
  echo "If you want to replace it, open .env in your editor, delete that line, and run this again."
  exit 1
fi

printf "Paste your Slack webhook URL and press Enter (typing is HIDDEN — that's normal): "
read -rs URL
echo

case "$URL" in
  https://hooks.slack.com/services/*) ;;
  *)
    echo "That doesn't look like a Slack incoming-webhook URL — it must start with"
    echo "https://hooks.slack.com/services/   Nothing was saved. Run the script again."
    exit 1
    ;;
esac

printf 'SLACK_WEBHOOK_URL=%s\n' "$URL" >> .env
echo "Saved to .env (which is gitignored — it never reaches GitHub)."
echo "The URL was not displayed, logged, or stored anywhere else. You can now tell the session: 'webhook is in'."
