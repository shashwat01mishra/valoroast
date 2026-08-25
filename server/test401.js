import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
let HENRIK_API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/HENRIK_API_KEY=(.+)/);
  if (match) HENRIK_API_KEY = match[1].trim();
}

const region = "ap";
const name = "Leo";
const tag = "DMCG";
const url = `https://api.henrikdev.xyz/valorant/v1/stored-matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=50`;

async function test() {
  const headers = {
    'User-Agent': 'VALOROAST/2.0',
    'Authorization': HENRIK_API_KEY
  };

  console.log("Fetching:", url);
  const res = await fetch(url, { headers });
  console.log("Status:", res.status);
  
  const text = await res.text();
  console.log("Body:", text.substring(0, 500)); // only print first 500 chars to avoid flooding
}

test();
