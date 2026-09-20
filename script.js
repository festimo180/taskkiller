/* ==========================================================================
   FESTIMO — CORE ENGINE & AI COPILOT SCRIPT
   ========================================================================== */

// --- 1. PAGE VIEW NAVIGATION SWITCHER ---
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    
    tab.classList.add('active');
    const pageId = tab.dataset.page;
    document.getElementById(pageId).classList.add('active');
  });
});

// --- 2. TIMER & FLOW LOGIC ---
let TOTAL = 4 * 60 * 60; // 4 Hours
let time = localStorage.getItem('timeLeft') ? parseInt(localStorage.getItem('timeLeft')) : TOTAL;
let timerEl = document.getElementById('timer');
let progress = document.getElementById('progress');
let btn = document.getElementById('btn');
let ding = document.getElementById('ding');
let running = false;
let interval;

function renderTimer() {
  let h = Math.floor(time / 3600);
  let m = Math.floor((time % 3600) / 60);
  let s = time % 60;
  
  timerEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  progress.style.width = `${((TOTAL - time) / TOTAL) * 100}%`;
  localStorage.setItem('timeLeft', time);
}
renderTimer();

btn.onclick = () => {
  if (!running) {
    running = true;
    btn.innerText = "⏸ IN FLOW";
    btn.style.background = "#111";
    btn.style.color = "#fff";
    interval = setInterval(() => {
      time--;
      renderTimer();
      if (time <= 0) {
        clearInterval(interval);
        running = false;
        ding.play();
        btn.innerText = "DONE 🎉";
        let completed = parseInt(localStorage.getItem('completed_sessions') || '0') + 1;
        localStorage.setItem('completed_sessions', completed);
        document.getElementById('history').innerText = `Sessions Completed: ${completed}`;
      }
    }, 1000);
  } else {
    running = false;
    btn.innerText = "START FLOW";
    btn.style.background = "var(--neon-green)";
    btn.style.color = "#000";
    clearInterval(interval);
  }
};

// --- 3. LAB & CODE EDITOR LOGIC ---
const htmlEl = document.getElementById('html');
const cssEl = document.getElementById('css');
const jsEl = document.getElementById('js');
const preview = document.getElementById('preview');
const logs = document.getElementById('logs');

// Tab switching inside Lab
document.querySelectorAll('.lab .tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.lab .tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('textarea.code').forEach(c => c.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  };
});

function runCode() {
  preview.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head><style>${cssEl.value}</style></head>
      <body>
        ${htmlEl.value}
        <script>
          const _l = console.log;
          console.log = (...a) => parent.postMessage({type: 'log', msg: a.join(' ')}, '*');
          window.onerror = e => parent.postMessage({type: 'log', msg: '✕ ' + e}, '*');
        <\/script>
        <script>${jsEl.value}<\/script>
      </body>
    </html>`;
    
  localStorage.setItem('lab_html', htmlEl.value);
  localStorage.setItem('lab_css', cssEl.value);
  localStorage.setItem('lab_js', jsEl.value);
}

// Initial restore
if (localStorage.getItem('lab_html')) {
  htmlEl.value = localStorage.getItem('lab_html');
  cssEl.value = localStorage.getItem('lab_css');
  jsEl.value = localStorage.getItem('lab_js');
}
runCode();

document.getElementById('run').onclick = runCode;
[htmlEl, cssEl, jsEl].forEach(el => el.addEventListener('input', () => {
  if (document.getElementById('autorun').checked) runCode();
}));

window.addEventListener('message', e => {
  if (e.data && e.data.type === 'log') {
    logs.innerHTML += `<div>> ${e.data.msg}</div>`;
  }
});

// Fullscreen preview toggle
document.getElementById('fullscreen-btn').onclick = () => {
  document.querySelector('.preview-side').classList.toggle('fullscreen');
};

// Theme recoloring helper
function recolor(theme) {
  const themes = {
    sunset: { bg: '#fff7ed', border: '#fed7aa', btn: '#ea580c' },
    ocean: { bg: '#ecfeff', border: '#a5f3fc', btn: '#0891b2' },
    bubblegum: { bg: '#fdf2f8', border: '#fbcfe8', btn: '#db2777' },
    forest: { bg: '#f0fdf4', border: '#bbf7d0', btn: '#16a34a' },
    midnight: { bg: '#05070a', border: 'rgba(0,255,135,0.3)', btn: '#00ff87' },
    barbie: { bg: '#fff1f2', border: '#fecdd3', btn: '#e11d48' }
  };
  const t = themes[theme];
  if (!t) return;
  cssEl.value = `*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:'Geist',system-ui;background:${t.bg};color:#1a1a1a;min-height:100vh;display:grid;place-items:center;padding:30px}\n.box{width:420px;background:#fff;border:2px solid ${t.border};padding:32px;border-radius:28px}\n#btn2{background:${t.btn};color:#fff;border:none;padding:12px 24px;border-radius:100px;font-weight:800;cursor:pointer}`;
  runCode();
}

// --- 4. DEDICATED AI COPILOT STUDIO ENGINE ---
const aiChatStudio = document.getElementById('aiChatStudio');
const aiStudioPrompt = document.getElementById('aiStudioPrompt');
const aiStudioSend = document.getElementById('aiStudioSend');

function addStudioMsg(text, sender = 'ai', codeToInject = null) {
  const msgDiv = document.createElement('div');
  msgDiv.className = sender === 'user' ? 'u-msg' : 'ai-msg';
  
  if (sender === 'ai') {
    msgDiv.innerHTML = `<div class="msg-author">✦ Copilot</div>${text}`;
    if (codeToInject) {
      const codeBlock = document.createElement('div');
      codeBlock.className = 'ai-code-block';
      codeBlock.innerText = codeToInject.html || codeToInject.css || codeToInject.js;
      
      const applyBtn = document.createElement('button');
      applyBtn.className = 'apply-code-btn';
      applyBtn.innerText = '✨ Apply Code to Lab & Preview';
      applyBtn.onclick = () => {
        if (codeToInject.html) htmlEl.value = codeToInject.html;
        if (codeToInject.css) cssEl.value = codeToInject.css;
        if (codeToInject.js) jsEl.value = codeToInject.js;
        runCode();
        alert('✨ Applied code to Lab! Switch to "Lab & Timer" page to inspect.');
      };
      
      msgDiv.appendChild(codeBlock);
      msgDiv.appendChild(applyBtn);
    }
  } else {
    msgDiv.innerText = text;
  }
  
  aiChatStudio.appendChild(msgDiv);
  aiChatStudio.scrollTop = aiChatStudio.scrollHeight;
}

// Intelligent AI Generator Engine
function generateAIResponse(promptText) {
  const q = promptText.toLowerCase();

  // 1. Theme Requests
  const foundTheme = ['sunset', 'ocean', 'bubblegum', 'forest', 'midnight', 'barbie'].find(x => q.includes(x));
  if (foundTheme) {
    recolor(foundTheme);
    return addStudioMsg(`Applied the <b>${foundTheme}</b> color theme directly to your Lab!`, 'ai');
  }

  // 2. Component Generation Logic
  if (q.includes('hero') || q.includes('card') || q.includes('glassmorphism')) {
    const generated = {
      html: `<div class="hero-card">\n  <div class="badge">PRO VERSION</div>\n  <h1>Build Dynamic Apps</h1>\n  <p>Created with Festimo AI Copilot in Lagos.</p>\n  <button class="cta-btn">Get Started ↗</button>\n</div>`,
      css: `body { background: #080b10; font-family: system-ui; display: grid; place-items: center; min-height: 100vh; color: #fff; }\n.hero-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(0,255,135,0.3); padding: 40px; border-radius: 24px; text-align: center; backdrop-filter: blur(12px); box-shadow: 0 0 30px rgba(0,255,135,0.1); }\n.badge { display: inline-block; background: #00ff87; color: #000; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 100px; margin-bottom: 12px; }\nh1 { font-size: 2.2rem; margin-bottom: 10px; }\np { opacity: 0.7; margin-bottom: 20px; }\n.cta-btn { background: #00ff87; color: #000; border: none; padding: 12px 28px; font-weight: 800; border-radius: 100px; cursor: pointer; }`,
      js: `document.querySelector('.cta-btn').onclick = () => alert('Welcome to Festimo Flow!');`
    };
    return addStudioMsg(`I generated a neon glassmorphic hero card snippet for you! Click below to apply it.`, 'ai', generated);
  }

  if (q.includes('kanban') || q.includes('board') || q.includes('task')) {
    const generated = {
      html: `<div class="board">\n  <div class="col"><h3>To Do</h3><div class="card">Design Hero</div></div>\n  <div class="col"><h3>In Flow</h3><div class="card">AI Integration</div></div>\n</div>`,
      css: `body { background: #0d1117; color: #fff; font-family: system-ui; padding: 20px; }\n.board { display: flex; gap: 20px; }\n.col { background: #161b22; flex: 1; padding: 15px; border-radius: 12px; }\n.card { background: #21262d; padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 3px solid #00ff87; }`,
      js: `console.log("Kanban initialized");`
    };
    return addStudioMsg(`Here is a dark-mode Kanban board structure!`, 'ai', generated);
  }

  // Fallback AI Response
  addStudioMsg(`I processed your request: "${promptText}". You can ask me to generate cards, pricing tables, themes (sunset, ocean, midnight), or custom layouts!`, 'ai');
}

// Send Chat Handler
function handleAISend() {
  const val = aiStudioPrompt.value.trim();
  if (!val) return;
  addStudioMsg(val, 'user');
  aiStudioPrompt.value = '';
  setTimeout(() => generateAIResponse(val), 400);
}

aiStudioSend.onclick = handleAISend;
aiStudioPrompt.onkeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleAISend();
  }
};

// Preset Button Click Handlers
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.onclick = () => {
    const promptText = btn.dataset.prompt;
    addStudioMsg(promptText, 'user');
    setTimeout(() => generateAIResponse(promptText), 400);
  };
});

// Quick Theme Buttons in AI Sidebar
document.querySelectorAll('.theme-quick-grid button').forEach(btn => {
  btn.onclick = () => {
    const theme = btn.dataset.c;
    addStudioMsg(`Switch theme to ${theme}`, 'user');
    recolor(theme);
    addStudioMsg(`Theme updated to <b>${theme}</b> in the Lab!`, 'ai');
  };
});

// Clear Chat
document.getElementById('clearChatBtn').onclick = () => {
  aiChatStudio.innerHTML = `<div class="ai-msg"><div class="msg-author">✦ Copilot</div>Chat history cleared. What are we building next?</div>`;
};
