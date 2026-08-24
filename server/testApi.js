const http = require('http');

http.get('http://localhost:3000/api/v1/roast?name=Leo&tag=DMCG&region=ap&mode=competitive', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('--- Pipeline Debug ---');
      console.log(JSON.stringify(parsed.pipelineDebug, null, 2));
      console.log('--- Main Roast ---');
      console.log(parsed.card.roast.main);
      console.log('--- Evidence ---');
      console.log(parsed.card.roast.evidence);
    } catch(e) {
      console.log("Error parsing:", e, data);
    }
  });
}).on('error', (err) => console.log('Error: ', err.message));
