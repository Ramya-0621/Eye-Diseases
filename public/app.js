const state = {
  isLoading: false,
  lastResult: null
};

const form = document.getElementById('assessment-form');
const thresholdSlider = document.getElementById('confidence-threshold');
const thresholdReadout = document.getElementById('threshold-readout');
const resultState = document.getElementById('result-state');
const runAssessmentBtn = document.getElementById('run-assessment');

const requiredFields = [
  'age',
  'gender_code',
  'dioptre_1',
  'dioptre_2',
  'astigmatism',
  'lens_status_code',
  'pneumatic_iop',
  'perkins_iop',
  'corneal_thickness',
  'axial_length',
  'visual_field_md'
];

const fieldValidators = {
  age: value => validateNumber(value, {min: 0, max: 120, integer: true, label: 'Patient age'}),
  gender_code: value => validateSelect(value, 'Gender code'),
  dioptre_1: value => validateNumber(value, {min: -20, max: 20, label: 'Dioptre 1'}),
  dioptre_2: value => validateNumber(value, {min: -20, max: 20, label: 'Dioptre 2'}),
  astigmatism: value => validateNumber(value, {min: 0, max: 10, label: 'Astigmatism'}),
  lens_status_code: value => validateSelect(value, 'Lens status code'),
  pneumatic_iop: value => validateNumber(value, {min: 0, max: 100, label: 'Pneumatic IOP'}),
  perkins_iop: value => validateNumber(value, {min: 0, max: 100, label: 'Perkins IOP'}),
  corneal_thickness: value => validateNumber(value, {min: 400, max: 700, label: 'Corneal thickness'}),
  axial_length: value => validateNumber(value, {min: 15, max: 35, label: 'Axial length'}),
  visual_field_md: value => validateNumber(value, {min: -30, max: 5, label: 'Visual field MD'})
};

function validateSelect(value, label) {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required.`;
  }
  return '';
}

function validateNumber(value, { min, max, integer = false, label }) {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return `${label} must be a valid number.`;
  }
  if (integer && !Number.isInteger(num)) {
    return `${label} must be a whole number.`;
  }
  if (num < min || num > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return '';
}

function setThresholdText(value) {
  thresholdReadout.textContent = `${value}%`;
}

function renderResultState(stateName, contentHtml) {
  resultState.className = `result-state ${stateName}`;
  resultState.innerHTML = contentHtml;
}

function showWaitingState() {
  renderResultState('waiting', `
    <div class="status-badge awaiting">AWAITING INPUT</div>
    <div class="orbital-visual mini">
      <div class="orbital-ring ring-a"></div>
      <div class="orbital-ring ring-b"></div>
      <div class="core-glow"></div>
    </div>
    <h3>Waiting for your first scan.</h3>
    <p>Complete the clinical profile to begin an assessment.</p>
  `);
}

function setFieldError(name, message) {
  const field = document.getElementById(name)?.closest('.field-group');
  const errorEl = document.querySelector(`[data-error-for="${name}"]`);
  if (!field || !errorEl) return;
  field.classList.toggle('has-error', Boolean(message));
  errorEl.textContent = message || '';
}

function clearErrors() {
  requiredFields.forEach(fieldName => setFieldError(fieldName, ''));
}

function collectPayload() {
  const payload = {};
  requiredFields.forEach(fieldName => {
    const el = document.getElementById(fieldName);
    const value = el ? el.value : '';
    payload[fieldName] = value;
  });
  payload.threshold = Number(thresholdSlider.value);
  return payload;
}

function validateForm() {
  clearErrors();
  let valid = true;
  requiredFields.forEach(fieldName => {
    const value = document.getElementById(fieldName)?.value;
    const validator = fieldValidators[fieldName];
    const error = validator ? validator(value) : '';
    if (error) {
      setFieldError(fieldName, error);
      valid = false;
    }
  });
  return valid;
}

function resetFormState() {
  form.reset();
  thresholdSlider.value = 80;
  setThresholdText(80);
  clearErrors();
  state.lastResult = null;
  state.isLoading = false;
  runAssessmentBtn.disabled = false;
  showWaitingState();
}

function renderLoadingState() {
  renderResultState('loading', `
    <div class="status-badge">ANALYZING</div>
    <div class="loading-spinner"></div>
    <h3>Analyzing clinical measurements...</h3>
    <p>Please wait while the model evaluates the supplied profile.</p>
  `);
}

function renderErrorState(errorMessage) {
  renderResultState('error', `
    <div class="status-badge">ASSESSMENT ERROR</div>
    <div class="orbital-visual mini">
      <div class="orbital-ring ring-a"></div>
      <div class="orbital-ring ring-b"></div>
      <div class="core-glow"></div>
    </div>
    <h3>Assessment could not be completed.</h3>
    <p>${errorMessage}</p>
    <button type="button" class="secondary-btn" id="retry-assessment" style="margin-top:16px;">Retry assessment</button>
  `);
  document.getElementById('retry-assessment')?.addEventListener('click', () => {
    state.isLoading = false;
    runAssessmentBtn.disabled = false;
    showWaitingState();
  });
}

function renderSuccessState(result) {
  const prediction = result?.output || result?.prediction || {};
  const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : null;
  const threshold = Number(result?.output?.threshold ?? thresholdSlider.value);
  const passed = Boolean(result?.output?.passedThreshold ?? true);
  const statusClass = passed ? 'success' : 'low-confidence';
  const statusText = passed ? 'ASSESSMENT COMPLETE' : 'LOW CONFIDENCE — REVIEW REQUIRED';
  const className = prediction.predictedClass || result?.prediction || 'Uncertain';
  const confidenceText = confidence === null ? 'Not available' : `${Math.round(confidence)}%`;

  renderResultState(statusClass, `
    <div class="status-badge">${statusText}</div>
    <div class="prediction-card" style="margin-top:20px;">
      <div class="prediction-row">
        <div class="prediction-class">${className}</div>
        <div class="prediction-score">${confidenceText}</div>
      </div>
      <ul class="meta-list">
        <li><span>Confidence threshold</span><strong>${threshold}%</strong></li>
        <li><span>Threshold met</span><strong>${passed ? 'Yes' : 'No'}</strong></li>
        <li><span>Timestamp</span><strong>${new Date().toLocaleString()}</strong></li>
      </ul>
    </div>
    <div class="alert-box">Experimental machine-learning research output only. Not a medical diagnosis.</div>
  `);
}

async function runAssessment() {
  if (state.isLoading) return;
  if (!validateForm()) return;

  state.isLoading = true;
  runAssessmentBtn.disabled = true;
  renderLoadingState();

  const payload = collectPayload();

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data || !data.success) {
      throw new Error(data?.error || 'Unable to complete the assessment.');
    }

    state.lastResult = data;
    renderSuccessState(data);
  } catch (error) {
    renderErrorState(error.message || 'A network error occurred.');
  } finally {
    state.isLoading = false;
    runAssessmentBtn.disabled = false;
  }
}

function bindNavigation() {
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `${view}-view`));
    });
  });
}

function loadSampleData() {
  fetch('/api/sample')
    .then(res => res.json())
    .then(({ sample }) => {
      Object.entries(sample).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) input.value = value;
      });
      thresholdSlider.value = 80;
      setThresholdText(80);
      clearErrors();
      renderResultState('waiting', `
        <div class="status-badge awaiting">DEMONSTRATION DATA</div>
        <div class="orbital-visual mini">
          <div class="orbital-ring ring-a"></div>
          <div class="orbital-ring ring-b"></div>
          <div class="core-glow"></div>
        </div>
        <h3>Sample data loaded.</h3>
        <p>This is demonstration data only and is not a real patient record.</p>
      `);
    })
    .catch(() => {
      renderErrorState('Sample data is unavailable.');
    });
}

thresholdSlider.addEventListener('input', event => setThresholdText(event.target.value));
form.addEventListener('submit', event => {
  event.preventDefault();
  runAssessment();
});
runAssessmentBtn.addEventListener('click', runAssessment);
document.getElementById('reset-fields').addEventListener('click', resetFormState);
document.getElementById('load-sample').addEventListener('click', loadSampleData);

bindNavigation();
setThresholdText(thresholdSlider.value);
showWaitingState();
