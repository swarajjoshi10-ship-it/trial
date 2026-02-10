# TrustChain: AI-Verified Charity Platform

TrustChain is a decentralized charity platform that uses AI and Blockchain to ensure radical transparency. Funds are locked in smart contracts and only released when an AI agent verifies visual proof of the charity work.

## 🚀 Prerequisites

1.  **Node.js**: Installed (v18+ recommended).
2.  **Ollama**: Installed for local AI ([Download Here](https://ollama.com/download)).
3.  **MetaMask**: Browser extension for interacting with the dApp.

## 📦 Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/swarajjoshi10-ship-it/trial.git
    cd trial
    ```

2.  **Install Dependencies**:
    ```bash
    # Install Frontend Dependencies
    npm install

    # Install Backend Dependencies
    cd backend
    npm install
    cd ..
    ```

## 🧠 Setting up the AI (Ollama)

1.  **Pull the Vision Model**:
    Open a terminal and run:
    ```bash
    ollama pull llava:7b
    ```
    *(This downloads the ~4.7GB AI model locally)*.

2.  **Run the AI Server**:
    Keep this terminal window open running:
    ```bash
    ollama run llava:7b
    ```

## ⚙️ Configuration (.env)

Ensure your `backend/.env` file has the following (Create it if missing):

```env
PRIVATE_KEY=your_private_key_here_without_0x
RPC_URL=https://1rpc.io/sepolia
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt
```

## ▶️ Running the Application

You will need **3 Terminal Windows**:

### Terminal 1: Frontend (React)
```bash
npm run dev
```
*   Opens the UI at `http://localhost:5173`.

### Terminal 2: AI Server (Ollama)
```bash
ollama run llava:7b
```
*   Ensures the local AI is active.

### Terminal 3: Backend Verifier (Node.js)
```bash
cd backend
node aiVerifier.js
```
*   Listens to the blockchain for new proofs and verifies them using the AI.

## 🧪 How to Test

1.  Go to the **Dashboard** (localhost:5173).
2.  **Login** with MetaMask.
3.  **Create a Campaign** (as NGO) or **Donate** (as Donor).
4.  As an NGO, click **"Upload Proof"**.
5.  Take a photo.
6.  Check **Terminal 3** to see the AI analyze the photo in real-time!
    *   ✅ **Match Verified**: Funds released.
    *   ❌ **Rejected**: Funds remain locked.

## 🛠️ Troubleshooting

*   **Error: "Ollama is not running!"**: Make sure Terminal 2 is running `ollama run llava:7b`.
*   **Error: "503 Service Unavailable"**: The RPC URL might be busy. Try restarting the backend.
*   **Transactions stuck**: Check your Sepolia ETH balance in MetaMask.
