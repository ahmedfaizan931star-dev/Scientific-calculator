// Scientific calculator with history, memory, parentheses highlighting, keyboard cheat sheet and mobile-friendly tweaks

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const angleToggle = document.getElementById('angle-toggle');
const angleLabel = document.getElementById('angle-label');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggle = document.getElementById('history-toggle');
const closeHistory = document.getElementById('close-history');
const clearHistoryBtn = document.getElementById('clear-history');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');

let expr = '';
let memory = 0;
let history = JSON.parse(localStorage.getItem('calc_history_v2') || '[]');

function render() {
  renderExpressionWithParens(expr);
  try {
    const val = tryEvaluate(expr);
    resultEl.textContent = (val === undefined || val === '' || isNaN(val)) ? '0' : formatResult(val);
  } catch (e) {
    resultEl.textContent = '';
  }
}

function insert(value){
  expr += value;
  render();
}

function clearAll(){
  expr = '';
  render();
}

function backspace(){
  expr = expr.slice(0,-1);
  render();
}

function equals(){
  try {
    const val = tryEvaluate(expr);
    const formatted = (val === undefined || val === null) ? '' : String(val);
    // push to history
    if (expr.trim() !== ''){
      history.unshift({expr: expr, res: formatted, ts: Date.now()});
      if (history.length > 200) history.pop();
      localStorage.setItem('calc_history_v2', JSON.stringify(history));
      renderHistory();
    }
    expr = formatted;
    render();
  } catch (e) {
    resultEl.textContent = "Error";
  }
}

function formatResult(v){
  if (!isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-10) return '0';
  return Number.isInteger(v) ? String(v) : parseFloat(v.toPrecision(12)).toString();
}

/* Memory functions */
function memClear(){ memory = 0; persistMemory(); flashMemoryState(); }
function memRecall(){ insert(String(memory)); }
function memPlus(){
  try{ const val = Number(tryEvaluate(expr)); if (!isNaN(val)) memory = memory + val; persistMemory(); flashMemoryState(); }
  catch(e){}
}
function memMinus(){
  try{ const val = Number(tryEvaluate(expr)); if (!isNaN(val)) memory = memory - val; persistMemory(); flashMemoryState(); }
  catch(e){}
}
function persistMemory(){ localStorage.setItem('calc_memory_v2', String(memory)); }
function loadMemory(){ const m = localStorage.getItem('calc_memory_v2'); memory = m ? Number(m) : 0; }
function flashMemoryState(){ /* small UI hint - briefly show memory value in result area */
  const prev = resultEl.textContent;
  resultEl.textContent = 'M: ' + String(memory);
  setTimeout(()=>{ resultEl.textContent = prev; }, 900);
}

/* Evaluation environment */
function tryEvaluate(input){
  if (!input) return '';
  const cleaned = input.replace(/π/g, 'pi').replace(/×/g,'*').replace(/÷/g,'/');
  const jsExpr = cleaned.replace(/\^/g, '**').replace(/%/g, '/100');

  const degMode = angleToggle.checked === true;
  const env = {
    pi: Math.PI,
    e: Math.E,
    sin: (x)=> degMode ? Math.sin(x*Math.PI/180) : Math.sin(x),
    cos: (x)=> degMode ? Math.cos(x*Math.PI/180) : Math.cos(x),
    tan: (x)=> degMode ? Math.tan(x*Math.PI/180) : Math.tan(x),
    asin: (x)=> degMode ? Math.asin(x)*180/Math.PI : Math.asin(x),
    acos: (x)=> degMode ? Math.acos(x)*180/Math.PI : Math.acos(x),
    atan: (x)=> degMode ? Math.atan(x)*180/Math.PI : Math.atan(x),
    ln: (x)=> Math.log(x),
    log10: (x)=> (Math.log10 ? Math.log10(x) : Math.log(x)/Math.LN10),
    sqrt: (x)=> Math.sqrt(x),
    fact: (n)=> { n = Math.floor(n); if (n < 0) throw 'Factorial of negative'; if (n === 0 || n === 1) return 1; let r = 1; for (let i=2;i<=n;i++) r *= i; return r; }
  };

  const names = Object.keys(env);
  const vals = names.map(k => env[k]);
  const wrapped = `"use strict"; return (${jsExpr});`;
  const f = new Function(...names, wrapped);
  const result = f(...vals);
  return result;
}

/* History rendering */
function renderHistory(){
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<li class="small-muted">No history yet</li>';
    return;
  }
  history.forEach((h, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<div class="expr">${escapeHtml(h.expr)}</div><div class="res">${escapeHtml(h.res)}</div>`;
    li.addEventListener('click', ()=>{
      // tap once to load expression in editor; double-click to set result
      expr = h.expr;
      render();
    });
    historyList.appendChild(li);
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* Parentheses highlighting by depth */
function renderExpressionWithParens(s){
  const container = expressionEl;
  container.innerHTML = '';
  let depth = 0;
  for (let i = 0; i < s.length; i++){
    const ch = s[i];
    if (ch === '('){
      const span = document.createElement('span');
      span.className = 'paren-depth-' + (depth % 5);
      span.textContent = ch;
      container.appendChild(span);
      depth++;
    } else if (ch === ')'){
      depth = Math.max(0, depth-1);
      const span = document.createElement('span');
      span.className = 'paren-depth-' + (depth % 5);
      span.textContent = ch;
      container.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.textContent = ch;
      container.appendChild(span);
    }
  }
}

/* Buttons */
document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const v = btn.dataset.value;
    const action = btn.dataset.action;
    if (action === 'clear') clearAll();
    else if (action === 'back') backspace();
    else if (action === 'equals') equals();
    else if (action === 'mc') memClear();
    else if (action === 'mr') memRecall();
    else if (action === 'mplus') memPlus();
    else if (action === 'mminus') memMinus();
    else if (v) insert(v);
  });
});

/* History controls */
historyToggle.addEventListener('click', ()=>{ historyPanel.style.display = historyPanel.style.display === 'none' || !historyPanel.style.display ? 'block' : 'none'; });
closeHistory.addEventListener('click', ()=>{ historyPanel.style.display = 'none'; });
clearHistoryBtn.addEventListener('click', ()=>{ history = []; localStorage.removeItem('calc_history_v2'); renderHistory(); });

/* initial history */
renderHistory();

/* Angle toggle label */
angleToggle.addEventListener('change', ()=>{
  angleLabel.textContent = angleToggle.checked ? 'DEG' : 'RAD';
  render();
});

/* Keyboard support and shortcuts */
document.addEventListener('keydown', (ev)=>{
  // avoid typing when modal open
  if (helpModal.getAttribute('aria-hidden') === 'false') return;
  if (ev.key >= '0' && ev.key <= '9') insert(ev.key);
  else if (ev.key === '.') insert('.');
  else if (ev.key === 'Enter' || ev.key === '='){ ev.preventDefault(); equals(); }
  else if (ev.key === 'Backspace') backspace();
  else if (ev.key === 'Escape') clearAll();
  else if (['+','-','*','/','(',')','%','^'].includes(ev.key)) insert(ev.key);
  else if (ev.key === '?') { ev.preventDefault(); openHelp(); }
  else if (ev.key.toLowerCase() === 's') insert('sin(');
  else if (ev.key.toLowerCase() === 'c') insert('cos(');
  else if (ev.key.toLowerCase() === 't') insert('tan(');
  else if (ev.key.toLowerCase() === 'l') insert('ln(');
  else if (ev.key.toLowerCase() === 'p') insert('pi');
});

/* Help modal */
function openHelp(){ helpModal.setAttribute('aria-hidden','false'); }
function closeHelpModal(){ helpModal.setAttribute('aria-hidden','true'); }
helpBtn.addEventListener('click', openHelp);
closeHelp.addEventListener('click', closeHelpModal);
helpModal.addEventListener('click', (e)=>{ if (e.target === helpModal) closeHelpModal(); });

/* load memory */
loadMemory();

/* initial render */
render();

/* expose for debug */
window._calc = { getHistory: ()=>history, getMemory: ()=>memory };
