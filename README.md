## 🚀 NeuroTask AI

🌐 Live App: https://neurotask-frontend.onrender.com/  
🔌 API: https://neurotask-ai-a56h.onrender.com/api/health

NeuroTask AI is a full-stack task management system where I experimented with **agentic AI using a local LLM (Ollama - Llama3)**.

The idea was simple: instead of just managing tasks, let AI actively **plan, monitor, and assist** in execution.

---

## 💡 What makes it different

Most task apps just store data.

This one actually **acts on it** using multiple AI agents:

* breaks down tasks
* tracks inactivity
* detects risks
* communicates automatically

---

## 🧠 AI Agents

### Task Planning Agent

* Splits tasks into subtasks
* Estimates effort (hours)
* Suggests deadlines

### Monitoring Agent

* Detects inactive tasks (no updates)
* Nudges employees
* Alerts managers

### Risk Analysis Agent

* Identifies overloaded users
* Flags high-risk tasks
* Suggests reassignment

### Communication Agent

* Sends deadline reminders via email
* Generates professional messages using LLM

---

## 🛠 Tech Stack

**Backend**

* Node.js, Express
* MongoDB

**Frontend**

* React

**AI**

* Ollama (local)
* Llama3:8B

---

## ⚙️ Running locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔑 Environment variables

Create `.env` in backend:

```env
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b

EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

## 🤖 AI setup

Install Ollama and run:

```bash
ollama run llama3:8b
```

---

## ⚠️ Note

AI features work only when Ollama is running locally.
In deployment, agents won’t work unless a server-side LLM is configured.

---

## 🧪 Why I built this

I wanted to explore:

* how **agent-based AI systems** can be integrated into real apps
* using **local LLMs instead of paid APIs**
* automating decision-making in task management

---

## 📌 Next improvements

* Move to cloud LLM (OpenAI / API)
* Better UI/UX
* Real-time updates

---

## 👨‍💻 Author

Avinash Parmar
[https://github.com/AvinashParmar12](https://github.com/AvinashParmar12)

---

