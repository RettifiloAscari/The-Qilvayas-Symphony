// Markdown-emitting stub for docx-js. Records semantic intent instead of OOXML.
const esc = s => String(s == null ? '' : s);
class TextRun {
  constructor(o){ if (typeof o === 'string') o = { text: o };
    this.text = esc(o.text); this.bold = !!o.bold; this.italics = !!o.italics; }
  md(){ let t = this.text; if (!t) return '';
    if (this.bold && this.italics) return '***'+t.trim()+'*** ';
    if (this.bold) return '**'+t.trim()+'** ';
    if (this.italics) return '*'+t.trim()+'* ';
    return t; }
}
class Paragraph {
  constructor(o){ o = o || {}; this.o = o; this.children = o.children || []; }
  md(){
    const body = this.children.map(c => (c.md ? c.md() : '')).join('').replace(/\s+$/,'');
    if (!body) return '';
    const h = this.o.heading;
    if (h === 'Heading1') return '# ' + body;
    if (h === 'Heading2') return '## ' + body;
    if (h === 'Heading3') return '### ' + body;
    if (this.o.numbering) return '- ' + body;
    if (this.o.shading) return '> ' + body;          // BOX read-aloud
    return body;
  }
}
class TableCell { constructor(o){ this.children = o.children || []; this.head = !!(o.shading); }
  txt(){ return this.children.map(p => (p.md?p.md():'')).join(' ').replace(/\|/g,'\\|').trim(); } }
class TableRow { constructor(o){ this.cells = o.children || []; } }
class Table {
  constructor(o){ this.rows = o.rows || []; }
  md(){ if (!this.rows.length) return '';
    const grid = this.rows.map(r => r.cells.map(c => c.txt()));
    const w = grid[0].length;
    const out = ['| ' + grid[0].join(' | ') + ' |', '|' + ' --- |'.repeat(w)];
    grid.slice(1).forEach(r => out.push('| ' + r.join(' | ') + ' |'));
    return out.join('\n'); }
}
let CAPTURED = null;
class Document { constructor(o){ CAPTURED = o; } }
const Packer = { toBuffer: () => Promise.resolve(Buffer.from(render(), 'utf8')) };
function render(){
  const secs = (CAPTURED && CAPTURED.sections) || [];
  const blocks = [];
  secs.forEach(s => (s.children||[]).forEach(n => { const m = n.md ? n.md() : ''; if (m) blocks.push(m); }));
  const out = []; let prev = '';
  blocks.forEach(b => {
    if (prev.startsWith('- ') && b.startsWith('- ')) out.push(b);
    else if (prev.startsWith('|') && b.startsWith('|')) out.push(b);
    else out.push((out.length ? '\n' : '') + b);
    prev = b;
  });
  return out.join('\n') + '\n';
}
module.exports = { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel: { HEADING_1:'Heading1', HEADING_2:'Heading2', HEADING_3:'Heading3', TITLE:'Title' },
  AlignmentType: { CENTER:'center', LEFT:'left', RIGHT:'right', JUSTIFIED:'both' },
  WidthType: { PERCENTAGE:'pct', DXA:'dxa', AUTO:'auto' },
  ShadingType: { CLEAR:'clear', SOLID:'solid' },
  LevelFormat: { BULLET:'bullet', DECIMAL:'decimal' },
  BorderStyle:{SINGLE:'single',NONE:'none'}, VerticalAlign:{CENTER:'center'},
  PageNumber:{CURRENT:'cur'}, Footer:class{constructor(){}}, Header:class{constructor(){}},
  TabStopType:{RIGHT:'right'}, UnderlineType:{SINGLE:'single'}, convertInchesToTwip:v=>v*1440 };
