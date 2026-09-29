const fs = require('fs');
const css = fs.readFileSync('D:/Development/WEb-download/www.aahanabobade.com/www.aahanabobade.com/assets/index-C4rzL3lx.css', 'utf8');

console.log('CSS length:', css.length);
// Extract CSS variables
const vars = css.match(/--[a-zA-Z0-9_-]+:\s*[^;]+/g);
if (vars) {
  console.log('CSS Variables:', [...new Set(vars)].slice(0, 35));
}

// Extract key classes
const classes = css.match(/\.[a-zA-Z0-9_-]+/g);
if (classes) {
  const uniqueClasses = [...new Set(classes)].filter(c => !c.startsWith('.-') && c.length > 3);
  console.log('Classes sample:', uniqueClasses.slice(0, 50));
}
