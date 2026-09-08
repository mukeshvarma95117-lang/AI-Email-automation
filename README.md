# SmartSend AI — AI Automated Message Generator & Sender

SmartSend AI is a modern full-stack messaging platform engineered for institutional and organizational communications. Users describe their messaging objective in plain English (e.g. *"Send a professional reminder to all students about tomorrow's AI workshop at 10 AM"*), and SmartSend AI automatically generates, personalizes, previews in realistic device simulators, and dispatches or schedules messages across **Email**, **WhatsApp**, and **SMS**.

---

## 🌟 Key Features

1. **AI Message Generator & Composer**:
   - Natural language prompt synthesis.
   - Granular controls: **Tone** (Professional, Friendly, Casual, Formal, Urgent, Promotional), **Language**, **Channel** (Email, WhatsApp, SMS), and **Length**.
   - Generates: Subject Line, Message Body, 1-Sentence Summary, and Call-To-Action (CTA).
   - Instant AI Refinements: *Make Shorter*, *Make Longer*, *Make More Professional*, *Make Friendlier*, *Translate*, and *Improve*.

2. **Dynamic Personalization Engine**:
   - Template placeholders: `{{name}}`, `{{event}}`, `{{date}}`, `{{time}}`, `{{location}}`, and unlimited custom contact fields.
   - Dynamic recipient switcher dropdown to test live variable replacement in real-time.

3. **Realistic Channel Simulators**:
   - **WhatsApp Simulator**: Phone skin, green header with contact avatar & online status, chat bubble with line breaks, bold/italic rendering, read receipts, and CTA button.
   - **Email Simulator**: Desktop webmail client frame, From/To headers, subject line, formatted card body, and styled CTA button.
   - **SMS Simulator**: Smartphone mockup, character meter, and SMS segment counter (160 chars/segment).

4. **Recipient & Cohort Management**:
   - Full CRUD for contacts.
   - Student cohort & group tagging with color coding.
   - CSV Import with automatic column mapping and sample template download.
   - CSV Export.

5. **Multi-Channel Delivery & Scheduler**:
   - **Email**: SMTP via Nodemailer.
   - **WhatsApp**: Meta WhatsApp Cloud API / Twilio WhatsApp format.
   - **SMS**: Twilio SMS client.
   - **Scheduler**: Background scheduler checking and executing scheduled queue every 15 seconds.
   - **Cancellation**: Ability to cancel scheduled messages before delivery.

6. **AI Safety & Dispatch Validation**:
   - Detects empty copy.
   - Detects missing recipient emails or phone numbers.
   - Flags unresolved `{{variable}}` tags with interactive alerts.
   - Warns on large recipient lists (>50).
   - Pre-send modal requiring explicit confirmation (*"You are about to send this message to X recipients"*).

7. **Out-of-the-Box Demo Mode**:
   - If messaging credentials or external LLM API keys are unconfigured, SmartSend operates in **Demo Mode** with simulated delivery logs and built-in contextual AI generation so the app is 100% testable right away without payment or credentials.
   - Clearly marks simulated messages as "Demo Sent" to prevent false delivery claims.

8. **Security & Authentication**:
   - JWT authentication.
   - Bcrypt password hashing.
   - Preloaded default admin account: `admin@smartsend.ai` / `admin123`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node.js v24 with native SQLite)
- npm v9+

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run seed     # Seeds sample students, cohorts, and settings
npm start        # Starts Express server on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 3. Open in Browser
Navigate to `http://localhost:5173`.
- **Email:** `admin@smartsend.ai`
- **Password:** `admin123`
*(Or click the convenient "Auto-Fill" button on the login screen).*

---

## 📁 Project Architecture

```
AI Email automation/
├── backend/
│   ├── database/
│   │   ├── db.js              # SQLite DatabaseSync connection & schema
│   │   └── seed.js            # Admin user, sample student cohorts, logs
│   ├── services/
│   │   ├── aiService.js       # OpenAI-compatible API + Built-in Smart Fallback Engine
│   │   ├── variableResolver.js# Dynamic {{variable}} replacement & detection
│   │   ├── emailService.js    # SMTP nodemailer + Demo simulation
│   │   ├── whatsappService.js # WhatsApp API + Demo simulation
│   │   ├── smsService.js      # Twilio SMS + Demo simulation
│   │   └── schedulerService.js# Node 15s interval worker & cancellation
│   ├── controllers/
│   ├── routes/
│   └── server.js              # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── generator/     # PromptBox, ToneSelector, VariablePills, AiActionButtons
    │   │   ├── preview/       # WhatsAppPreview, EmailPreview, SmsPreview
    │   │   ├── contacts/      # ContactModal, CsvImportModal, GroupModal
    │   │   ├── scheduling/    # ScheduleModal
    │   │   └── common/        # ConfirmationModal, Toast
    │   ├── pages/
    │   │   ├── Dashboard.jsx  # Metrics, channel charts, activity stream
    │   │   ├── Generator.jsx  # Main composer flow
    │   │   ├── Contacts.jsx   # Contacts directory & CSV management
    │   │   ├── Scheduled.jsx  # Scheduled queue with cancellation
    │   │   ├── History.jsx    # Delivery logs with inspection drawer
    │   │   ├── Settings.jsx   # API keys, SMTP, WhatsApp, SMS & Demo Mode
    │   │   └── Login.jsx      # Auth screen with quick demo login
    │   └── context/           # AuthContext, ThemeContext, ToastContext
    └── package.json
```

