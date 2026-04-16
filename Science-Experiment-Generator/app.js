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
// SCIENCE FACTS
// ================================================================
const SCIENCE_FACTS = [
  'Honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.',
  'A bolt of lightning is about five times hotter than the surface of the sun.',
  'Humans share roughly 60% of their DNA with bananas.',
  'The mantis shrimp can punch with the same force as a bullet.',
  'Hot water can freeze faster than cold water — this is called the Mpemba effect.',
  'Sharks are older than trees. They\'ve existed for over 450 million years.',
  'A teaspoon of neutron star material would weigh about 10 million tons.',
  'Octopuses have three hearts, blue blood, and nine brains (one central + one per arm).',
  'The smell of rain — called petrichor — comes from a compound called geosmin released by soil bacteria.',
  'There are more possible chess games than atoms in the observable universe.',
  'Cats can\'t taste sweetness — they lack the taste receptor for sugar.',
  'Sound travels about four times faster through water than through air.',
  'Bananas are mildly radioactive due to their natural potassium content.',
  'A day on Venus is longer than a year on Venus.',
  'Glass is technically a supercooled liquid — it flows, just incredibly slowly.',
  'Your stomach acid is strong enough to dissolve stainless steel.',
  'The human body contains enough carbon to make roughly 900 pencils.',
  'Water can exist as solid, liquid, and gas simultaneously at its "triple point."',
  'There are more stars in the universe than grains of sand on all of Earth\'s beaches.',
  'A group of flamingos is called a flamboyance.',
];

let _lastFactIdx = -1;

function getRandomFact() {
  let idx;
  do { idx = Math.floor(Math.random() * SCIENCE_FACTS.length); } while (idx === _lastFactIdx);
  _lastFactIdx = idx;
  return SCIENCE_FACTS[idx];
}

let _factInterval = null;

function startFactRotation() {
  _factInterval = setInterval(() => {
    const el = document.getElementById('scienceFact');
    if (!el) { clearInterval(_factInterval); return; }
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.textContent = getRandomFact();
    el.classList.add('fade-in');
  }, 5000);
}

function stopFactRotation() {
  clearInterval(_factInterval);
  _factInterval = null;
}

function buildLoadingHTML() {
  return `
    <div class="loading-state">
      <div class="beaker-anim">
        <svg viewBox="0 0 100 120" width="90" height="108">
          <defs>
            <clipPath id="flaskClip">
              <path d="M38 10 L38 48 L10 90 Q5 103 20 103 L80 103 Q95 103 90 90 L62 48 L62 10 Z"/>
            </clipPath>
          </defs>
          <g clip-path="url(#flaskClip)">
            <rect class="flask-fill" x="0" y="0" width="100" height="120"/>
            <circle class="bbl bbl-1" cx="32" cy="98" r="4"/>
            <circle class="bbl bbl-2" cx="58" cy="95" r="3"/>
            <circle class="bbl bbl-3" cx="44" cy="100" r="2.5"/>
            <circle class="bbl bbl-4" cx="68" cy="97" r="2"/>
          </g>
          <path d="M38 10 L38 48 L10 90 Q5 103 20 103 L80 103 Q95 103 90 90 L62 48 L62 10 Z"
            fill="none" stroke="black" stroke-width="5" stroke-linejoin="round"/>
          <line x1="30" y1="22" x2="70" y2="22" stroke="black" stroke-width="5"/>
        </svg>
      </div>
      <div class="loading-text">Brewing your experiment…</div>
      <div class="science-fact-box">
        <span class="fact-label">Did you know?</span>
        <span id="scienceFact" class="fact-text fade-in">${getRandomFact()}</span>
      </div>
    </div>`;
}

// ================================================================
// GENERATE & REGENERATE
// ================================================================
async function handleGenerate() {
  state.apiKey = document.getElementById('apiKeyInput').value.trim();
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
  const resultCard  = document.getElementById('resultCard');
  const resultBody  = document.getElementById('resultBody');
  const generateBtn = document.getElementById('generateBtn');
  const regenBtn    = document.getElementById('regenBtn');

  resultCard.style.display = 'block';
  resultBody.innerHTML     = buildLoadingHTML();
  updateDiffStamp();
  startFactRotation();

  generateBtn.disabled = true;
  regenBtn.disabled    = true;
  state.isLoading      = true;

  setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  try {
    const success = await callOpenAI(buildPrompt(), resultBody);
    if (success) {
      confetti({
        particleCount: 150,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#D94F3A', '#E8B43A', '#1E5F74', '#F4E9D8', '#000000'],
        shapes: ['square', 'circle'],
      });
    }
  } finally {
    stopFactRotation();
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
  let full       = '';
  let firstChunk = true;

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

    return full.length > 0;

  } catch (err) {
    bodyEl.innerHTML = '<div class="error-banner">' + esc(friendlyError(err)) + '</div>';
    return false;
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
