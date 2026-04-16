// ================================================================
// STATE
// ================================================================
const state = {
  apiKey:     '',
  grade:      '6-8',
  subject:    'Biology',
  difficulty: 'Beginner',
  supplies:   '',
  isLoading:  false,
};

// ================================================================
// API KEY INPUT  (in-memory only — never stored)
// ================================================================
function handleKeyInput(value) {
  state.apiKey = value.trim();
}

function toggleKeyVis() {
  const inp = document.getElementById('apiKeyInput');
  const btn = document.getElementById('showKeyBtn');
  inp.type     = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? 'Show' : 'Hide';
}

// ================================================================
// FORM STATE SYNC
// ================================================================
document.getElementById('gradeSelect').addEventListener('change', function () {
  state.grade = this.value;
});

document.getElementById('subjectSelect').addEventListener('change', function () {
  state.subject = this.value;
});

document.getElementById('suppliesInput').addEventListener('input', function () {
  state.supplies = this.value;
});

function setDifficulty(level, el) {
  state.difficulty = level;
  document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// ================================================================
// PROMPT BUILDER
// ================================================================
function buildPrompt() {
  const diffGuide = {
    Beginner:     'Keep steps very simple and safe. Avoid open flames or hazardous chemicals. Use minimal scientific vocabulary. Focus on hands-on exploration and basic observation.',
    Intermediate: 'Include measurement, one or two variables, and moderate scientific concepts. Students should record observations and draw basic conclusions.',
    Advanced:     'Include multiple variables, precise measurements, hypothesis formation, and detailed scientific reasoning. Encourage data analysis and connections to broader concepts.',
  }[state.difficulty];

  return `You are an enthusiastic science teacher designing an experiment for grade ${state.grade} students.

Subject: ${state.subject}
Difficulty: ${state.difficulty}
Difficulty guidance: ${diffGuide}

Supplies the student has available:
${state.supplies || '(use common household materials)'}

Create a detailed, engaging science experiment using primarily the supplies listed above. If any extra materials are needed beyond what's listed, call them out clearly at the top of the Materials section.

Format your entire response using EXACTLY these section headers with emoji prefixes, in this order:

## 🧪 Materials
## 📋 Steps
## 🔬 What to Observe
## ⚡ The Science Behind It
## ⚠️ Safety Notes
## ⏱️ Estimated Time

Use markdown formatting: bullet lists for materials and steps, bold key terms, and clear short sentences. Tailor vocabulary and complexity to ${state.grade} grade ${state.difficulty.toLowerCase()} level.`;
}

// ================================================================
// GENERATE & REGENERATE
// ================================================================
async function handleGenerate() {
  if (!state.apiKey) {
    showError('Paste your OpenAI API key before generating.');
    return;
  }
  if (!state.supplies.trim()) {
    const ta = document.getElementById('suppliesInput');
    ta.style.borderColor  = '#D94F3A';
    ta.style.boxShadow    = '3px 3px 0 #D94F3A';
    ta.focus();
    setTimeout(() => {
      ta.style.borderColor = '';
      ta.style.boxShadow   = '';
    }, 1600);
    return;
  }
  await runGeneration();
}

async function handleRegenerate() {
  await runGeneration();
}

async function runGeneration() {
  const resultCard = document.getElementById('resultCard');
  const resultBody = document.getElementById('resultBody');
  const generateBtn = document.getElementById('generateBtn');
  const regenBtn    = document.getElementById('regenBtn');

  // Show result card with loading state
  resultCard.style.display = 'block';
  resultBody.innerHTML = `
    <div class="loading-state">
      <span class="loading-icon">🧪</span>
      <div class="loading-text">Brewing your experiment…</div>
    </div>`;
  updateDiffStamp();

  generateBtn.disabled = true;
  regenBtn.disabled    = true;
  state.isLoading      = true;

  setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  try {
    await callOpenAI(buildPrompt(), resultBody);
  } finally {
    state.isLoading      = false;
    generateBtn.disabled = false;
    regenBtn.disabled    = false;
  }
}

function updateDiffStamp() {
  const beakers = { Beginner: '🧪', Intermediate: '🧪🧪', Advanced: '🧪🧪🧪' };
  document.getElementById('diffStamp').innerHTML = `
    <div class="stamp-label">APPROVED</div>
    <div class="stamp-level">${state.difficulty}</div>
    <div class="stamp-beakers">${beakers[state.difficulty]}</div>`;
}

// ================================================================
// OPENAI API CALL WITH SSE STREAMING
// ================================================================
async function callOpenAI(prompt, bodyEl) {
  let full        = '';
  let firstChunk  = true;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': 'Bearer ' + state.apiKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:    'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        stream:   true,
      }),
    });

    if (!res.ok) {
      let errData = {};
      try { errData = await res.json(); } catch { /* ignore */ }
      throw { status: res.status, message: errData.error?.message || 'HTTP ' + res.status };
    }

    const reader = res.body.getReader();
    const dec    = new TextDecoder();
    let   buf    = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const chunk = JSON.parse(raw);
          const tok   = chunk.choices?.[0]?.delta?.content;
          if (tok) {
            if (firstChunk) {
              bodyEl.innerHTML = '';
              firstChunk = false;
            }
            full += tok;
            bodyEl.innerHTML = marked.parse(full);
          }
        } catch { /* ignore malformed SSE chunks */ }
      }
    }

  } catch (err) {
    bodyEl.innerHTML = '<div class="error-banner">' + esc(friendlyError(err)) + '</div>';
  }
}

// ================================================================
// ERROR HELPERS
// ================================================================
function friendlyError(err) {
  const msg = (err.message || '').toLowerCase();
  if (err.status === 401 || msg.includes('invalid') || msg.includes('incorrect api')) {
    return '🔑 API key rejected. Double-check your .env file and try again.';
  }
  if (err.status === 429 || msg.includes('rate limit')) {
    return '⏱️ Rate limit hit — wait a moment and try again.';
  }
  if (err.name === 'TypeError' || msg.includes('fetch') || msg.includes('network')) {
    return '📡 Network error. Check your internet connection and try again.';
  }
  return '❌ ' + (err.message || 'Something went wrong. Please try again.');
}

function showError(msg) {
  const resultCard = document.getElementById('resultCard');
  const resultBody = document.getElementById('resultBody');
  resultCard.style.display = 'block';
  resultBody.innerHTML     = '<div class="error-banner">' + esc(msg) + '</div>';
  updateDiffStamp();
  setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ================================================================
// INIT — sync state from default HTML values
// ================================================================
(function init() {
  state.grade   = document.getElementById('gradeSelect').value;
  state.subject = document.getElementById('subjectSelect').value;
})();
