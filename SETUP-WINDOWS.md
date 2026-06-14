# Running Voiceapp on Windows

A step-by-step guide to run the app on a Windows laptop. Once set up, starting it
later is just **double-clicking `start-windows.bat`**.

---

## 1. Install the prerequisites (one time)

| Tool | What it's for | Where to get it |
| --- | --- | --- |
| **Node.js** (LTS) | Runs the app | <https://nodejs.org> |
| **Docker Desktop** | Runs the voice server | <https://www.docker.com/products/docker-desktop> |
| **Git** | Downloads the code | <https://git-scm.com> |

Install all three with their default options. For Docker Desktop, **launch it
after installing and leave it running** — if it asks to enable WSL2, say yes.

To confirm they work, open **PowerShell** (Start menu → type "PowerShell") and run:

```powershell
node --version
docker --version
git --version
```

Each should print a version number, not an error.

---

## 2. Download the code (one time)

```powershell
cd $HOME\Desktop
git clone https://github.com/AdyDuby0/Voiceapp.git
cd Voiceapp
git checkout claude/discord-alternative-app-0jso99
```

This puts a `Voiceapp` folder on your Desktop.

---

## 3. Start the app

1. Make sure **Docker Desktop is open and running**.
2. Open the `Voiceapp` folder and **double-click `start-windows.bat`**.

The script checks everything is installed, installs the app's dependencies the
first time (this takes a minute), starts the voice server, and launches the app.
When the window shows **"Ready"**, open your browser to:

```
http://localhost:3000
```

(If the browser opened too early and shows an error, just refresh it once "Ready"
appears.)

---

## 4. Try a two-person call

1. Tab 1: enter a name, click **Create a new room**, and **allow the microphone**.
2. Copy the room code (or the whole link).
3. Tab 2: enter a different name and **Join** with that code.
4. **Wear headphones** — two tabs on one laptop without them will screech with
   audio feedback.

You should see both names, a glowing ring around whoever is talking, and the chat
panel working on the side.

---

## 5. Stopping it

- **The app:** close the `start-windows.bat` window (or press `Ctrl+C` in it).
- **The voice server:** double-click `stop-windows.bat`.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Docker Desktop is installed but not running" | Open Docker Desktop, wait until it says **Running**, then try again. |
| Microphone doesn't work | It only works on `http://localhost` or `https://`. Use `localhost`, not a `192.168.x.x` address. |
| Loud screeching | Use headphones — that's audio feedback between two tabs. |
| Port 3000 already in use | Close any other app using it, or stop the other `npm run dev` window. |
| Want friends to join from elsewhere | That needs a real deployment (Vercel + LiveKit Cloud) — local mode is your laptop only. |
