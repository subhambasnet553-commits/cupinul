# Login/Signup Backend Setup

## What's included
- `backend/` — Node.js + Express + MongoDB API (signup, login, JWT auth)
- `frontend/` — your existing pages, lightly updated to actually call the backend

## What changed in your frontend
- `register.html` — wrapped inputs in a `<form>`, gave each field an `id`, added an error message spot
- `structure.html` — the login field is now `type="email"` (since accounts are keyed by email, not a separate username), removed the 10-character password limit, added an error message spot
- `script.js` — now sends the form data to your backend and stores the login token
- `style.css` / `flowers_.jpg` — unchanged, just copied over

## 1. Install MongoDB (pick one)
- **Local**: install MongoDB Community Server and run it (`mongod`)
- **Cloud (easier)**: create a free cluster at mongodb.com/cloud/atlas, get your connection string

## 2. Configure the backend
```
cd backend
cp .env.example .env
```
Open `.env` and set:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string (the `.env.example` file shows a command to generate one)
- `EMAIL_USER` / `EMAIL_PASS` — for sending signup verification codes. See below.

### Setting up email verification (OTP)
Signup now requires verifying a 6-digit code sent to the user's email.
1. On the Gmail account you want to send from (e.g. cupinul0@gmail.com), turn on 2-Step Verification at myaccount.google.com/security
2. Go to myaccount.google.com/apppasswords and create a new App Password
3. Put the Gmail address in `EMAIL_USER` and the 16-character app password in `EMAIL_PASS`

If you leave these blank, signup still works for local testing — the OTP just prints to your terminal instead of emailing, so you can copy it manually.

## 3. Install dependencies & run
```
cd backend
npm install
npm run dev      # auto-restarts on changes (needs nodemon, already in devDependencies)
# or:
npm start
```

The server starts at `http://localhost:5000` and also serves your `frontend/` folder automatically, so you can just open:
- `http://localhost:5000/register.html`
- `http://localhost:5000/structure.html`

## API Endpoints
| Method | Endpoint            | Body                                                              | Notes                       |
|--------|----------------------|--------------------------------------------------------------------|------------------------------|
| POST   | `/api/auth/register` | `{ firstName, lastName, email, password, confirmPassword }`       | Creates account, returns token |
| POST   | `/api/auth/login`    | `{ email, password }`                                              | Returns token                |
| GET    | `/api/auth/me`       | — (send `Authorization: Bearer <token>` header)                    | Returns the logged-in user   |

## How passwords are handled
Passwords are hashed with bcrypt before being saved — the raw password is never stored, and it's stripped out of every API response automatically.

## Notes / next steps you may want
- Add a "logout" that just clears `localStorage` (`localStorage.removeItem("token")`)
- Add a real dashboard/homepage that checks for a valid token before showing content
- Add rate limiting on `/login` to slow down brute-force attempts
- Add email verification if you want to confirm real email addresses
