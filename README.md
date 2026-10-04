# PaperCast AI

> **"Research Papers. Simplified. Spoken."**  
> *Transform complex academic research papers into clear, engaging AI-powered audio podcasts with verified factual fidelity.*

---

## 🌟 Overview

**PaperCast AI** is a production-grade web application that converts dense academic research manuscripts (PDF format) into two-speaker conversational podcasts (Host & Researcher dialogue). 

Unlike generic summarization tools, PaperCast AI is built on a **Zero-Hallucination Academic Standard**: every finding, percentage, p-value, sample size, and hardware benchmark is strictly validated against source paper sections. The application incorporates a dedicated **AI Factual Drift Evaluation Engine** that cross-examines generated audio scripts against empirical research tables to detect unsupported claims and drift.

---

## 🚀 Key Features

1. **Smart PDF Document Ingestion**:
   - Drag-and-drop PDF dropzone (up to 25MB).
   - Structured section extraction: Abstract, Introduction, Methodology, Results, Discussion, Conclusion, References.
   - Built-in library of benchmark academic papers (*Attention Is All You Need*, *AlphaFold 2*, *Generative Agents in Virtual Sandbox*) for instant 1-click evaluation without hunting down files.

2. **Section-Based Factual Summarization**:
   - Preserves numerical figures, statistical bounds, experimental parameters, and citations without modification.
   - Distinguishes explicit source claims from conversational analogies.

3. **Two-Voice Podcast Screenplay Generation**:
   - **Speaker 1 (Host)**: Inquisitive, articulate science journalist asking sharp questions and contextualizing the research problem.
   - **Speaker 2 (Researcher)**: Authoritative domain expert explaining mathematical breakthroughs, empirical benchmarks, and transparent limitations.

4. **Interactive Studio Podcast Player**:
   - Dual-voice speech narration with realistic conversational pacing and natural pauses.
   - Real-time synchronized transcript highlighting active speaker turns.
   - Variable playback speed (0.75x, 1x, 1.25x, 1.5x, 2x), interactive scrubbing, and dynamic audio waveform visualizer.
   - One-click downloads for audio masters and transcripts.

5. **AI Factual Drift Evaluation**:
   - Compares generated scripts against source text.
   - Quantified metrics: *Factual Accuracy Score* (e.g. 96%), *Dialogue Clarity Score* (e.g. 94%), and *Unsupported Claims Count* (e.g. 0).
   - Claim-by-claim audit table with source verification grounding and severity indicators.

6. **Relational Database & User History**:
   - Normalized data models for Users, Research Papers, Paper Sections, Podcasts, Segments, Ratings, Search History, and Activity History.
   - Scoped access ensuring users manage their own private research library.
   - Chronological activity timeline categorized by *Today*, *Yesterday*, and *Earlier*.

7. **Multi-Dimensional User Ratings**:
   - Post-listen evaluation on **Clarity** (1–5), **Accuracy** (1–5), and **Usefulness** (1–5) with qualitative feedback.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API with JWT Authentication & bcryptjs encryption.
- **AI Engine**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` for extraction, summarization, scriptwriting, and factual drift evaluation, with Gemini TTS for speech synthesis.
- **Audio Synthesis**: Web Audio API & Web Speech API dual-voice synthesis engine for interactive browser playback.
- **Database**: Persistent JSON/Relational schema store located in `data/db.json` with relational cascading and atomic writes.

---

## 📐 Architecture & Data Flow

```
[Academic PDF] ──> [Server PDF Ingestion]
                         │
                         ▼
             [Gemini 3.8 Flash Parser]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Section Extraction]              [Empirical Summaries]
(Abstract, Methods, Results)     (Preserves numerical data)
        │                                 │
        └────────────────┬────────────────┘
                         ▼
           [Conversational Scriptwriter]
             (Host & Researcher turns)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Two-Voice Audio Engine]         [Factual Drift Auditor]
(Dual personas & pauses)        (Cross-checks claims & scores)
        │                                 │
        └────────────────┬────────────────┘
                         ▼
      [Interactive Studio Player & Dashboard]
```

---

## 🗄️ Database Schemas

- **`users`**: `id`, `name`, `email`, `role`, `createdAt`, `lastLogin`, `profileImage`, `preferences`
- **`research_papers`**: `id`, `userId`, `title`, `authors`, `abstract`, `fileName`, `fileSize`, `uploadedAt`, `publicationDate`, `keywords`, `processingStatus`
- **`paper_sections`**: `id`, `paperId`, `sectionName`, `originalText`, `summary`, `orderIndex`
- **`podcasts`**: `id`, `userId`, `paperId`, `title`, `script`, `audioUrl`, `duration`, `status`, `createdAt`, `completedAt`
- **`podcast_segments`**: `id`, `podcastId`, `speaker`, `text`, `sequence`, `duration`, `audioUrl`
- **`evaluations`**: `id`, `podcastId`, `factualAccuracyScore`, `clarityScore`, `unsupportedClaims`, `detectedIssues`, `evaluationSummary`
- **`ratings`**: `id`, `userId`, `podcastId`, `clarityScore`, `accuracyScore`, `usefulnessScore`, `overallScore`, `feedback`, `createdAt`
- **`user_history`**: `id`, `userId`, `actionType`, `paperId`, `podcastId`, `timestamp`, `metadata`
- **`search_history`**: `id`, `userId`, `query`, `searchedAt`

---

## ⚡ Installation & Setup Instructions

### 1. Prerequisites
- Node.js 18+ and npm installed.

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is configured:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
JWT_SECRET="your_secure_jwt_secret"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Full-Stack Application
Start the unified full-stack server (Express backend running Vite middleware):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🧑‍💻 Quick Demo Credentials
To immediately explore pre-populated research papers, podcasts, and evaluation reports without registering from scratch:
- **Click "⚡ Instant Demo" on the top navigation bar**  
  *OR*
- **Email**: `demo@papercast.ai`
- **Password**: `demo1234`
