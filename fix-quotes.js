const fs = require('fs');
let c = fs.readFileSync('scripts/addFakeActivity.js', 'utf8');
c = c.replace(/''/g, "'");
fs.writeFileSync('scripts/addFakeActivity.js', c);
