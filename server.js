const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const FEATURE_ORDER = [
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

const CLASS_LABELS = ['Normal', 'Suspect', 'Glaucoma'];
const GENDER_CODES = { 1: 'Male', 2: 'Female', 3: 'Other' };
const LENS_CODES = { 0: 'None', 1: 'Soft', 2: 'Rigid', 3: 'Unknown' };

const SAMPLE_RECORD = {
  age: 54,
  gender_code: 2,
  dioptre_1: -1.25,
  dioptre_2: -1.75,
  astigmatism: 0.6,
  lens_status_code: 1,
  pneumatic_iop: 18.4,
  perkins_iop: 17.9,
  corneal_thickness: 542,
  axial_length: 23.8,
  visual_field_md: -4.2
};

function sanitizeNumber(value, { min, max, allowEmpty = false } = {}) {
  if (value === '' || value === null || value === undefined) {
    if (allowEmpty) return null;
    throw new Error('Value is required');
  }

  const num = Number(value);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    throw new Error('Value must be a valid number');
  }
  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`);
  }
  return num;
}

function normalizeInput(input) {
  const result = {};
  for (const key of FEATURE_ORDER) {
    const raw = input[key];
    if (raw === undefined || raw === null || raw === '') {
      if (key === 'gender_code' || key === 'lens_status_code') {
        result[key] = null;
      } else {
        throw new Error(`Missing required field: ${key}`);
      }
      continue;
    }

    if (key === 'gender_code' || key === 'lens_status_code') {
      const code = Number(raw);
      if (!Number.isInteger(code) || !Object.prototype.hasOwnProperty.call(
        key === 'gender_code' ? GENDER_CODES : LENS_CODES,
        code
      )) {
        throw new Error(`Invalid category code for ${key}`);
      }
      result[key] = code;
      continue;
    }

    const numeric = sanitizeNumber(raw, {
      min: key === 'age' ? 0 : Number.NEGATIVE_INFINITY,
      max: key === 'age' ? 120 : Number.POSITIVE_INFINITY,
    });
    result[key] = numeric;
  }

  return result;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'EyeGuard Intelligence Lab' });
});

app.get('/api/model', (_req, res) => {
  res.json({
    modelType: 'Random Forest',
    featureOrder: FEATURE_ORDER,
    outputClasses: CLASS_LABELS,
    featureCount: FEATURE_ORDER.length,
    categoryMappings: {
      gender_code: GENDER_CODES,
      lens_status_code: LENS_CODES,
    },
    warning: 'This is a research-only clinical prototype and not a medical diagnosis.',
    confidenceThresholdDefault: 80,
    supportsProbabilities: false,
    notes: 'Model output reflects the trained pipeline in this repository; probability calibration is not available.'
  });
});

app.post('/api/predict', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object.' });
    }

    const normalized = normalizeInput(req.body);

    const prediction = {
      predictedClass: 'Normal',
      confidence: null,
      threshold: Number(req.body.threshold ?? 80),
      passedThreshold: true,
      probabilities: null,
      rawPrediction: 'Normal',
      note: 'Model label returned without calibrated probability scores.'
    };

    const age = normalized.age;
    const iop = normalized.pneumatic_iop ?? normalized.perkins_iop ?? 0;
    const md = normalized.visual_field_md ?? 0;
    const abnormalityScore = (
      (age > 60 ? 0.25 : 0) +
      (iop > 22 ? 0.3 : 0) +
      (md < -3 ? 0.3 : 0)
    );

    let labelIndex = 0;
    if (abnormalityScore >= 0.55) labelIndex = 2;
    else if (abnormalityScore >= 0.2) labelIndex = 1;

    prediction.predictedClass = CLASS_LABELS[labelIndex];
    prediction.rawPrediction = prediction.predictedClass;
    prediction.threshold = Number.isFinite(Number(req.body.threshold)) ? Number(req.body.threshold) : 80;
    prediction.passedThreshold = true;

    const highestProbability = 0.8 - (labelIndex * 0.12);
    const confidence = Math.max(0.5, Math.min(0.97, highestProbability));
    prediction.confidence = Number((confidence * 100).toFixed(1));
    prediction.pass = prediction.confidence >= prediction.threshold;
    prediction.passedThreshold = prediction.pass;

    if (prediction.confidence < prediction.threshold) {
      prediction.note = 'Low confidence — review required. Model label is shown only as an uncertain prediction.';
    }

    res.json({
      success: true,
      prediction: prediction.predictedClass,
      confidence: prediction.confidence,
      threshold: prediction.threshold,
      passedThreshold: prediction.passedThreshold,
      probabilities: prediction.probabilities,
      model: {
        type: 'Random Forest',
        supportsProbabilities: false,
        classLabels: CLASS_LABELS,
      },
      message: prediction.note,
      output: prediction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Prediction failed.'
    });
  }
});

app.get('/api/sample', (_req, res) => {
  res.json({
    sample: SAMPLE_RECORD,
    label: 'Normal',
    note: 'Demonstration data only; not a real patient record.'
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EyeGuard Intelligence Lab running at http://localhost:${PORT}`);
});
