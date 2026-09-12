import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

// Seeds the instruments table from the same TREDIN_SYMBOL_MAP JSON that the
// market adapter uses, so every tradable symbol exists before orders flow.
// Idempotent: safe to run on every deploy (upsert on instrument id).
let instruments;
try { instruments = JSON.parse(process.env.TREDIN_SYMBOL_MAP || '[]'); }
catch { throw new Error('TREDIN_SYMBOL_MAP must be valid JSON.'); }
if (!Array.isArray(instruments) || instruments.length === 0) {
  console.log('TREDIN_SYMBOL_MAP not set or empty — skipping instrument seed.');
  process.exit(0);
}
const required=['id','symbol','name','exchange','segment','truedataSymbol'];
const ids=new Set(), symbols=new Set(), tdSymbols=new Set();
for (const x of instruments) {
  if (!x || typeof x !== 'object' || required.some(k => typeof x[k] !== 'string' || !x[k].trim()))
    throw new Error('Each TREDIN_SYMBOL_MAP entry must contain non-empty string fields: id, symbol, name, exchange, segment, truedataSymbol.');
  if (ids.has(x.id) || symbols.has(x.symbol) || tdSymbols.has(x.truedataSymbol))
    throw new Error('TREDIN_SYMBOL_MAP contains duplicate id, symbol, or truedataSymbol.');
  ids.add(x.id); symbols.add(x.symbol); tdSymbols.add(x.truedataSymbol);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const x of instruments) {
    await pool.query(
      `insert into instruments(id,symbol,exchange,segment,truedata_symbol,enabled)
       values($1,$2,$3,$4,$5,true)
       on conflict(id) do update set
         symbol=excluded.symbol, exchange=excluded.exchange, segment=excluded.segment,
         truedata_symbol=excluded.truedata_symbol, enabled=true, updated_at=now()`,
      [String(x.id), String(x.symbol), String(x.exchange || 'NSE'), String(x.segment || 'equity'), String(x.truedataSymbol || x.symbol)]
    );
  }
  console.log(`Instruments seeded: ${instruments.length}`);
} finally { await pool.end(); }
