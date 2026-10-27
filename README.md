# 👁️ EyeGuard Intelligence Lab

### AI-Powered Ocular Health Assessment & Research Platform

EyeGuard Intelligence Lab is a machine-learning-based research application designed to explore ocular health patterns using clinical measurements. It provides a modern dashboard where users can enter clinical parameters, run model-based assessments, and view prediction results through an intuitive interface.

The project combines machine learning with a premium, interactive user interface to make experimental ocular health analysis easier to explore and understand.

---

## ✨ Features

- **Clinical Assessment:** Enter patient measurements through a structured clinical profile form.
- **Machine Learning Integration:** Uses a Random Forest classification model, subject to the configured backend implementation.
- **11 Clinical Features:** Supports patient age, gender code, dioptres, astigmatism, lens status, intraocular pressure, corneal thickness, axial length, and visual field mean deviation.
- **Confidence Threshold:** Configure a minimum acceptable prediction-confidence threshold when supported by the model.
- **Prediction Dashboard:** Display model outputs, confidence information, and assessment status.
- **Reset Fields:** Clear clinical inputs and previous assessment results.
- **Sample Data:** Load sample measurements for development and demonstration.
- **Model Insights:** Explore available model information, evaluation metrics, and feature importance.
- **Responsive UI:** Dark-themed interface with lime-green and lavender accents.
- **Input Validation:** Validate measurement values and handle errors before sending requests to the backend.

> Feature availability depends on the current implementation, trained model, and backend API.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Styling | CSS |
| Programming language | JavaScript |
| Machine learning | Python / scikit-learn |
| Model | Random Forest Classifier |
| Backend | Existing project API (verify implementation) |
| Development environment | Visual Studio Code |
| Version control | Git and GitHub |

---

## 📁 Project Structure

The exact structure depends on the files in your repository. A typical organization is:

```text
EyeGuard/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/
│   ├── app.py
│   └── models/
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

*Adjust this structure to match the actual files in your project.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

- [Node.js (LTS)](https://nodejs.org/en/download)
- [Visual Studio Code](https://code.visualstudio.com/)
- Git
- Python, if required by the machine-learning backend

Verify the Node.js installation:

```bash
node -v
npm -v
```

Both commands should return version numbers.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository URL.

### 2. Open the project

```bash
cd EyeGuard
```

Open the project folder in VS Code.

### 3. Install frontend dependencies

Run this command in the directory containing `package.json`:

```bash
npm install
```

### 4. Start the frontend

Check the `scripts` section in `package.json`.

For a Vite project:

```bash
npm run dev
```

For a project configured with a `start` script:

```bash
npm start
```

Open the local URL printed in the terminal.

### 5. Start the backend

If your project includes a Python backend, activate its environment, install the dependencies from its requirements file if available, and start the application using its configured entry point.

For example:

```bash
pip install -r requirements.txt
python app.py
```

These commands apply only if the corresponding files and scripts exist.

---

## 🧪 Clinical Input Features

The assessment form is designed around the following clinical parameters:

| No. | Feature | Unit |
|---:|---|---|
| 1 | Patient age | Years |
| 2 | Gender code | Dataset-specific |
| 3 | Dioptre 1 | D |
| 4 | Dioptre 2 | D |
| 5 | Astigmatism | D |
| 6 | Lens status code | Dataset-specific |
| 7 | Pneumatic IOP | mmHg |
| 8 | Perkins IOP | mmHg |
| 9 | Corneal thickness | µm |
| 10 | Axial length | mm |
| 11 | Visual field mean deviation (MD) | dB |

The feature order, data types, categorical encodings, and missing-value handling must match the model's training pipeline.

---

## 🔍 How It Works

1. **Enter measurements:** Supply the available clinical parameters.
2. **Validate inputs:** Check the supplied values and required fields.
3. **Run assessment:** Send the validated feature vector to the configured prediction backend.
4. **Generate prediction:** The trained model processes the input and returns its output.
5. **Apply confidence threshold:** Compare the highest class probability with the configured threshold, if supported.
6. **View results:** Display the prediction and relevant confidence information.
7. **Reset or reassess:** Clear the form or run another assessment.

---

## 📊 Model Evaluation

The Model Insights page can display model evaluation information when available:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion matrix
- Feature importance

Evaluation results should be calculated using appropriate held-out or cross-validation data. Do not report unverified metrics as actual model performance.

---

## 🔒 Privacy and Responsible Use

- Avoid entering identifiable patient information into a development or demonstration environment.
- Validate inputs on both the frontend and backend.
- Protect model files, credentials, and sensitive configuration.
- Do not expose secrets in public repositories.
- Use appropriately authorized and de-identified datasets for development.

---

## ⚠️ Medical Disclaimer

EyeGuard Intelligence Lab is an experimental machine-learning research project. Its outputs are not a medical diagnosis and must not replace examination, diagnosis, or treatment by a qualified eye-care professional.

Predictions may be incorrect or unreliable, particularly for missing, out-of-range, or unfamiliar inputs. Confidence scores, when available, do not represent medical certainty.

---

## 🚀 Future Enhancements

- Improve model evaluation and validation.
- Add interpretable prediction explanations.
- Develop assessment history with privacy safeguards.
- Add downloadable assessment reports.
- Improve accessibility and mobile responsiveness.
- Integrate securely with additional validated clinical datasets.

---

## 👩‍💻 Development

Built as a machine-learning and frontend development research project to explore ocular health classification and clinical-data visualization.

**Project:** EyeGuard Intelligence Lab

**Focus:** Machine Learning · Healthcare Research · Clinical Data Visualization · Web Development

---

## 📄 License

Choose and add an appropriate open-source license before distributing the project publicly.
