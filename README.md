# Moments - My Year Captured

**Moments** is a premium, minimalist digital journal designed to help you capture your year, one day at a time. It features a beautiful dark glass design, private local storage, and a friendly AI companion to help you reflect.

![Moments App Icon](/public/icon.svg)

## ✨ Features

-   **Capture the Day**: A distraction-free editor to write your daily thoughts.
-   **AI Companion**: A friendly, analytical AI that offers warm insights on *only* what you wrote today. (Powered by Puter.js)
-   **Offline Ready**: Works perfectly without an internet connection. Write anywhere, anytime.
-   **Private**: Your entries are stored locally on your device (in your browser). No external servers see your private data.
-   **Beautiful Design**: A "Premium Dark Glass" aesthetic with an irregular "Bento" grid for your recent moments.

---

## 📱 How to Install on Mobile

You can install Moments directly to your phone's home screen, just like a native app!

### For iPhone (iOS)
1.  Open the website in **Safari**.
2.  Tap the **Share** button (box with an arrow pointing up) at the bottom.
3.  Scroll down and tap **"Add to Home Screen"**.
4.  Confirm the name **Moments** and tap **Add**.

### For Android
1.  Open the website in **Chrome**.
2.  Tap the **Three Dots** menu (top right).
3.  Tap **"Install App"** or **"Add to Home Screen"**.
4.  Follow the prompt to install **Moments**.

Once installed, it will appear as an app icon on your home screen and launch in full-screen mode.

---

## 💻 Running Locally (For Developers)

If you want to run the code yourself:

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/moments.git
    cd moments
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    # or
    bun run dev
    ```

4.  Open `http://localhost:8080` in your browser.

## 🛠️ Stack

-   **Framework**: React + Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
-   **AI**: Puter.js (Client-side AI Service)
-   **Storage**: LocalStorage (Browser)
