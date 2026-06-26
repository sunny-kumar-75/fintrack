# 💳 FinTrack

**A Full-Stack Personal Finance & Expense Tracker**

| ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) | ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) | ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) | ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) |
|---|---|---|---|---|

> *Managing daily spending, budgets, and getting smart financial insights has never been easier.*

---

I built this project to practice advanced full-stack web development. It pushed me to learn how to handle secure authentication, connect AI APIs, build complex UI components, and connect a Node/Express backend to a MongoDB database.

<br />

## ✨ Key Features Built

* 🔐 **Custom User Authentication:** Built a fully secure login/signup system using JWT (JSON Web Tokens) stored in HttpOnly cookies to prevent XSS attacks.
* 💳 **Transaction Management:** Full CRUD operations for daily transactions, including advanced search, filtering, and sorting to easily find past expenses.
* 🏷️ **Smart Categories & Tags:** Automatically categorize expenses and add custom tags to keep spending organized.
* 📸 **Receipt Scan via Gemini Vision:** Users can upload images of physical receipts which are automatically scanned to auto-fill the transaction form.
* 🤖 **AI Financial Insights:** Integrated the Google Gemini API to deeply analyze spending habits and give custom AI advice on budgets.
* 📊 **Dashboard & Charts:** Built a comprehensive dashboard featuring Area, Donut, and Bar charts using the Recharts library to visualize data.
* 📑 **Data Export:** Built functionality to export transaction history to Excel (xlsx) or PDF format using jsPDF and autoTable.

<br />

## 💻 Tech Stack Used

**Frontend**  
`React.js` `React Router` `Recharts` `Vite`

**Backend**  
`Node.js` `Express.js` `bcryptjs` `express-rate-limit`

**Database & Cloud**  
`MongoDB` `Mongoose` `Cloudinary`

**Deployment**  
`Vercel` `Render`

<br />

## 🚀 How to run this locally

If you want to run my code on your own computer, follow these steps:

**1. Clone the repo**
```bash
git clone https://github.com/sunny-kumar-75/fintrack.git
cd fintrack
```

**2. Setup the Backend**
Open a terminal and go to the `server` folder:
```bash
cd server
npm install
```
Create a `.env` file in the server folder and add your connection strings:
```env
PORT=5000
MONGO_URI=your_mongodb_string_here
JWT_SECRET=any_secret_key_you_want
JWT_REFRESH_SECRET=any_refresh_key_you_want
GEMINI_API_KEY=your_google_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Start the server:
```bash
npm start
```

**3. Setup the Frontend**
Open a new terminal and go to the `client` folder:
```bash
cd client
npm install
```
Start the React app:
```bash
npm run dev
```

The app should now be running on `http://localhost:5173`!
