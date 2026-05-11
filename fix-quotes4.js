const fs = require('fs');
let c = fs.readFileSync('scripts/addFakeActivity.js', 'utf8');
c = c.replace(/:\s*';/g, ": '';");
fs.writeFileSync('scripts/addFakeActivity.js', c);
