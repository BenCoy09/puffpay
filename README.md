# PuffPay

Type a payment split in plain English. SERV Reasoning turns it into a checked table. One signature pays everyone on Robinhood Chain Testnet.

Example: "Pay Ada, Tobi and Kemi from 0.003 ETH. Ada gets double."

## How it works
- `api/parse.js` sends the instruction to SERV Reasoning and returns structured JSON. The API key stays server-side.
- `index.html` calculates amounts in code (BigInt, no model math), validates addresses and totals, then sends one transaction.
- The `PuffSplitter` contract pays all recipients atomically and reverts if the amounts don't match the value sent.

## Network
Robinhood Chain Testnet (chain ID 46630)
Contract: 0xaEB42103Bfb988a1B92E1C3ECA8277594D9bDA9f

## Run it
1. Deploy to Vercel.
2. Add the environment variable `SERV_API_KEY`.

Built for the OpenServ SERV Hackathon, Edition 01.
