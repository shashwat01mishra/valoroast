const http = require('http');

http.get('http://localhost:3001/api/roast/ap/Leo/DMCG?act=e9a1&mode=competitive', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('--- Archetype Title ---');
      console.log(parsed.roast.roastTitle);
      console.log('--- Summary ---');
      console.log(parsed.roast.summary);
      console.log('--- Main Roast ---');
      console.log(parsed.roast.mainRoast);
    } catch(e) {
      console.log("Error parsing:", e, data);
    }
  });
}).on('error', (err) => console.log('Error: ', err.message));
