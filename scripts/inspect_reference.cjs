const fs = require('fs');
const js = fs.readFileSync('D:/Development/WEb-download/www.aahanabobade.com/www.aahanabobade.com/assets/index-DXHpmvF-.js', 'utf8');

console.log('--- Referenced Files ---');
const filesMatch = js.match(/[a-zA-Z0-9_-]+\.(tsx|html|js|json|ts|css|md|pdf)/g);
console.log([...new Set(filesMatch)]);

console.log('--- Theme matches ---');
const themeBlocks = js.match(/\{name:"[^"]+",id:"[^"]+"[^}]*\}/g);
if (themeBlocks) {
  console.log(themeBlocks.slice(0, 10));
}

console.log('--- Lucide icons or UI libraries ---');
const lucideIcons = js.match(/createLucideIcon\("[^"]+"/g);
if (lucideIcons) {
  console.log(lucideIcons.slice(0, 15));
}
