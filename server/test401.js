const region = "ap";
const name = "Leo";
const tag = "DMCG";
const url = `https://api.henrikdev.xyz/valorant/v1/stored-matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=50`;

async function test() {
  const headers = { 
    'User-Agent': 'VALOROAST/2.0',
    'Authorization': 'REDACTED'
  };
  
  console.log("Fetching:", url);
  const res = await fetch(url, { headers });
  console.log("Status:", res.status);
  
  const text = await res.text();
  console.log("Body:", text.substring(0, 500)); // only print first 500 chars to avoid flooding
}

test();
