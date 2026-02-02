# Job Tracker Dashboard

A full-stack Job Tracker Dashboard built with **Express**, **TypeScript**, and **Vite** to help track job applications efficiently. This project follows clean backend architecture and modern tooling, making it suitable for real-world production use and DevOps/MLOps learning.

---

## 🚀 Features

* RESTful API built with **Express + TypeScript**
* Modern frontend powered by **Vite**
* Environment-based configuration (development / production)
* Centralized error handling & request logging
* Clean project structure
* Ready for Docker & CI/CD integration

---

## 🛠 Tech Stack

**Backend**

* Node.js
* Express.js
* TypeScript

**Frontend**

* Vite

**Tooling**

* tsx
* cross-env
* npm

---

## 📁 Project Structure

```
Job-Tracker-Dashboard/
├── server/
│   ├── index.ts        # Express app entry point
│   ├── routes.ts       # API routes
│   ├── static.ts       # Static file handling
│   └── vite.ts         # Vite dev server integration
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the project (Development)

```bash
npm run dev
```

The server will start on:

```
http://localhost:5000
```

---

## 🌍 Environment Variables

Create a `.env` file if needed:

```
PORT=5000
NODE_ENV=development
```

---

## 🧪 API Logging

All `/api` requests are automatically logged with:

* HTTP method
* Route
* Status code
* Response time

---

## 🚢 Production Build

```bash
npm run build
npm start
```

---

## 📌 Future Enhancements

* Docker support
* GitHub Actions CI/CD
* Authentication
* Database integration
* Cloud deployment (AWS/Azure)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ✨ Author

**Jyotishree Dash**
DevOps / MLOps Engineer

---

⭐ If you like this project, give it a star on GitHub!
