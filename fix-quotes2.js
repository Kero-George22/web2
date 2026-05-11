const fs = require('fs');
let c = fs.readFileSync('scripts/addFakeActivity.js', 'utf8');
c = c.replace(/Couldn't/g, "Couldn\\'t");
c = c.replace(/I've/g, "I\\'ve");
c = c.replace(/wouldn't/g, "wouldn\\'t");
c = c.replace(/don't/g, "don\\'t");
c = c.replace(/Don't/g, "Don\\'t");

fs.writeFileSync('scripts/addFakeActivity.js', c);
