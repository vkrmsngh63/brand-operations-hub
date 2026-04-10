const fs = require('fs');
const path = '/workspaces/brand-operations-hub/src/app/keyword-clustering/components/AutoAnalyze.tsx';
let code = fs.readFileSync(path, 'utf8');

const todo = `    // 6. Create sister links (TODO: implement via API when ready)`;
const impl = `    // 6. Create sister links
    const existingSisters = new Set(sisterLinks.map(sl => [sl.nodeA, sl.nodeB].sort().join('-')));
    for (const row of parsed) {
      if (!row.sisters || !row.title) continue;
      const node = titleToNode.get(row.title);
      if (!node) continue;
      const sisterNames = row.sisters.split(',').map(s => s.trim()).filter(Boolean);
      for (const sName of sisterNames) {
        const sNode = titleToNode.get(sName);
        if (!sNode || sNode.id === node.id) continue;
        const key = [node.id, sNode.id].sort().join('-');
        if (existingSisters.has(key)) continue;
        try {
          await fetch('/api/projects/' + projectId + '/canvas/sister-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodeA: node.id, nodeB: sNode.id }),
          });
          existingSisters.add(key);
        } catch (e) { console.warn('Sister link failed:', e); }
      }
    }`;

code = code.replace(todo, impl);
fs.writeFileSync(path, code);
console.log('Sister link creation implemented.');
