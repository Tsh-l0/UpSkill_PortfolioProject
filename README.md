# 🎓 UpSkill Portfolio Project

Welcome to the **UpSkill Portfolio Project** – a fully responsive, full-stack web application designed as part of the ALX Web Stack Portfolio Sprint. It brings together a sleek frontend, structured backend, and real-world features aimed at showcasing your abilities and growth.

---

## 🚀 Features

- 🏠 Homepage with dynamic content
- 🧑‍💼 User profile pages
- 📝 Blog section with posts
- 📊 Dashboard with real-time stats
- ⚙️ React Router-powered navigation
- 🔒 Future authentication integration (JWT, session, etc.)

---

## 🛠️ Tech Stack

### Frontend
- React (with Vite)
- React Router DOM
- Tailwind CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- RESTful API architecture

---

## 📂 Project Structure

## 🗂️ Project Structure

```txt
UpSkill_PortfolioProject/
├── .gitignore
├── README.md
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── controllers/
├── middlewares/
├── models/
├── routes/
├── node_modules/
├── testing_file/
└── project/
```

## 👥 Contributors
@Tsh-l0 — Frontend Development, Repo Owner
@BakaneN — Frontend Development
@The-Deliverator — Frontend Development


## 📌 Project Goals
✅ Showcase frontend & backend skills
✅ Collaborate effectively on GitHub
✅ Meet ALX Portfolio requirements
✅ Deliver before July 11, 2025

## 📄 License
This project is licensed under the MIT License.

## 💡 Acknowledgements
Special thanks to the ALX team for making this learning journey possible. 🚀

Kickstart the Project(npm init -y)
initializes package.json

Install core Dependencies(npm install express mongoose redis dotenv cors morgan express-validator bcrypt jsonwebtoken
)
express – Handles routing and middleware.

mongoose –Bridges our app and MongoDB, letting us define schemas and interact with the database.

redis – Sets up caching and analytics.

dotenv – Keeps our secrets safe in .env files.

cors – Ensures our frontend and backend can talk to each other securely.

express-validator – Validates request inputs.

bcrypt – Encrypts passwords before storing them.

jsonwebtoken – Handles JWT creation and verification for auth.


Dev Tools(npm install --save-dev nodemon)
nodemon watches for file changes and auto-restarts the server.


Server Configuration (server.js)

-Connects to MongoDB using Mongoose.

Initializes Redis client.

Loads middleware from app.js.

Starts Express server on port 5000 or whatever we set in our .env file


Security & Validation
JWT tokens are created upon login to secure user sessions.

bcrypt encrypts passwords, keeping them safe.

express-validator checks incoming data, so your routes don’t get spammed or broken.


Deployment
Once everything’s running smoothly, the backend is deployed to Render, making our API public and accessible:https://skillup-backend-26ea.onrender.com
