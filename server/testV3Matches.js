const region = "ap";
const name = "Leo";
const tag = "DMCG";
const url = `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=2`;

async function test() {
  const headers = { 'User-Agent': 'VALOROAST/2.0' };
  
  console.log("Fetching:", url);
  const res = await fetch(url, { headers });
  console.log("Status:", res.status);
  
  const text = await res.text();
  console.log("Body:", text);
}

test();
