import fs from 'node:fs';

function fixupGitignore() {
  const s = fs.readFileSync('.gitignore', {encoding: 'utf8'});
  const newS = s.replace(/# --cut-here--[\s\S]*?# --cut-here--/, '');
  fs.writeFileSync('.gitignore', newS);
}

async function main() {
  fixupGitignore();
}

main();

