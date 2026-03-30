/*
   All API communication uses fetch() (Ajax)
*/

const API_BASE = 'https://localhost:7091/api/Survey';

//  DOM refs
const container = document.getElementById('questions-container');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const emailInput = document.getElementById('email');
const idInput = document.getElementById('idNumber');
const toast = document.getElementById('toast');

// Current shuffled question list from the API
let currentQuestions = [];


// 1. LOAD QUESTIONS  —  GET /api/survey/questions
function loadQuestions() {
    showSkeletons();

    fetch(`${API_BASE}/questions`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(questions => {
            currentQuestions = questions;
            renderQuestions(questions);
        })
        .catch(err => {
            container.innerHTML = `
        <div class="state-msg">
          <span class="state-icon">⚠️</span>
          Could not load questions. Is the API running?<br>
          <small style="color:#e63946">${err.message}</small>
        </div>`;
            console.error('loadQuestions error:', err);
        });
}

function showSkeletons() {
    container.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>`;
}


// 2. RENDER QUESTIONS  —  dynamically builds form fields
function renderQuestions(questions) {
    container.innerHTML = '';

    questions.forEach(q => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
      <label for="q${q.id}">
        ${escHtml(q.text)}
        <span class="badge badge-${q.inputType}">${q.inputType}</span>
        ${q.isRequired ? '<span class="required-star"> *</span>' : ''}
      </label>
      <input
        type="${q.inputType}"
        id="q${q.id}"
        data-id="${q.id}"
        data-text="${escAttr(q.text)}"
        ${q.inputType === 'number' ? 'min="0" step="1"' : ''}
        placeholder="${placeholder(q.inputType)}"
      />
      <div class="error-msg" id="err-q${q.id}">This field cannot be empty.</div>`;
        container.appendChild(group);

        const inp = document.getElementById(`q${q.id}`);
        const err = document.getElementById(`err-q${q.id}`);
        inp.addEventListener('blur', () => {
            if (inp.value.trim()) {
                setError(inp, err, '', false);
            }
        });
    });
}

// 3. VALIDATION
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidSAId(idNumber) {
    // Check if null/empty, length = 13, and only digits
    if (!idNumber || idNumber.length !== 13 || !/^\d+$/.test(idNumber)) {
        return false;
    }

    // Extract date part (YYMMDD)
    const dobPart = idNumber.substring(0, 6);

    // Validate date
    const year = parseInt(dobPart.substring(0, 2), 10);
    const month = parseInt(dobPart.substring(2, 4), 10);
    const day = parseInt(dobPart.substring(4, 6), 10);

    // Basic date validation
    const fullYear = year <= new Date().getFullYear() % 100 ? 2000 + year : 1900 + year;
    const date = new Date(fullYear, month - 1, day);

    if (
        date.getFullYear() !== fullYear ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return false;
    }

    return true;
}

function setError(input, errEl, msg, show) {
    input.classList.toggle('invalid', show);
    errEl.classList.toggle('visible', show);
    if (show && msg) errEl.textContent = msg;
}

// Live blur validation for fixed fields
emailInput.addEventListener('blur', () => {
    const err = document.getElementById('email-error');
    if (!emailInput.value.trim()) setError(emailInput, err, 'Email address is required.', true);
    else if (!isValidEmail(emailInput.value)) setError(emailInput, err, 'Please enter a valid email address.', true);
    else setError(emailInput, err, '', false);
});

idInput.addEventListener('blur', () => {
    const err = document.getElementById('id-error');
    if (!idInput.value.trim()) setError(idInput, err, 'ID number is required.', true);
    else if (!isValidSAId(idInput.value)) setError(idInput, err, 'Please enter a valid 13-digit SA ID.', true);
    else setError(idInput, err, '', false);
});

// 4. SUBMIT  —  POST /api/survey/submit
submitBtn.addEventListener('click', () => {
    let valid = true;

    // Validate email
    const emailErr = document.getElementById('email-error');
    if (!emailInput.value.trim()) {
        setError(emailInput, emailErr, 'Email address is required.', true); valid = false;
    } else if (!isValidEmail(emailInput.value)) {
        setError(emailInput, emailErr, 'Please enter a valid email address.', true); valid = false;
    } else {
        setError(emailInput, emailErr, '', false);
    }

    // Validate ID
    const idErr = document.getElementById('id-error');
    if (!idInput.value.trim()) {
        setError(idInput, idErr, 'ID number is required.', true); valid = false;
    } else if (!isValidSAId(idInput.value)) {
        setError(idInput, idErr, 'Please enter a valid 13-digit SA ID.', true); valid = false;
    } else {
        setError(idInput, idErr, '', false);
    }

    // Validate dynamic questions
    const answers = [];
    currentQuestions.forEach(q => {
        const inp = document.getElementById(`q${q.id}`);
        const err = document.getElementById(`err-q${q.id}`);
        if (!inp) return;
        if (!inp.value.trim()) {
            setError(inp, err, 'This field cannot be empty.', true); valid = false;
        } else {
            setError(inp, err, '', false);
            answers.push({ questionId: q.id, questionText: q.text, answer: inp.value.trim() });
        }
    });

    if (!valid) {
        showToast('Please fix the highlighted errors.', 'error');
        return;
    }

    const payload = {
        email: emailInput.value.trim(),
        idNumber: idInput.value.trim(),
        answers
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) {
                const msgs = data.errors ? data.errors.join('\n') : (data.error || 'Submission failed.');
                showToast(msgs, 'error');
                console.warn('Submission errors:', data);
            } else {
                // Log clean list to console
                console.log('=== Survey Submission Result ===');
                data.data.forEach(item => console.log(`${item.field}: ${item.value}`));
                console.log('================================');
                showToast('Survey submitted successfully! ✅', 'success');
                resetForm(false);
            }
        })
        .catch(err => {
            showToast('Network error. Is the API running?', 'error');
            console.error('Submit error:', err);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit →';
        });
});

// 5. RESET
resetBtn.addEventListener('click', () => resetForm(true));

function resetForm(reloadQuestions = true) {
    emailInput.value = '';
    idInput.value = '';
    document.getElementById('email-error').classList.remove('visible');
    document.getElementById('id-error').classList.remove('visible');
    emailInput.classList.remove('invalid');
    idInput.classList.remove('invalid');

    if (reloadQuestions) {
        loadQuestions();
    } else {
        currentQuestions.forEach(q => {
            const inp = document.getElementById(`q${q.id}`);
            const err = document.getElementById(`err-q${q.id}`);
            if (inp) { inp.value = ''; inp.classList.remove('invalid'); }
            if (err) err.classList.remove('visible');
        });
    }
}

// 6. TOAST
let toastTimer;
function showToast(msg, type = '') {
    toast.textContent = msg;
    toast.className = `show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}

// UTILS
function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(s) {
    return String(s).replace(/"/g, '&quot;');
}
function placeholder(type) {
    return type === 'number' ? 'Enter a number' : type === 'date' ? '' : 'Type your answer here';
}

// Init
loadQuestions();