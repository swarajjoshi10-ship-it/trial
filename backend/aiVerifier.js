require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc-mumbai.maticvigil.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY; // MUST be the owner/AI verifier key
const CONTRACT_ADDRESS = "0x26F189a0daA025A7b9966F05c72315eE8944b972"; // Replace if redeployed

// Load ABI (We use the one from src)
const abiPath = path.join(__dirname, '../src/NGOContract.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

async function startVerifier() {
    console.log("🤖 AI Verifier Starting...");

    if (!PRIVATE_KEY || PRIVATE_KEY.includes("your_private_key_here")) {
        console.error("❌ CRITICAL: You must set a VALID PRIVATE_KEY in backend/.env");
        console.error("   Open 'backend/.env' and paste your wallet private key (without 0x prefix if possible, or ensure it is valid hex).");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

    const network = await provider.getNetwork();
    console.log(`✅ Connected to Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`✅ User Wallet: ${wallet.address}`);
    console.log(`✅ Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`📡 Listening for ProofSubmitted events...`);

    // Use POLLING instead of contract.on to avoid "filter not found" errors on public RPCs
    let lastBlock = await provider.getBlockNumber();
    console.log(`📡 Polling for ProofSubmitted events starting from block ${lastBlock}...`);

    setInterval(async () => {
        try {
            const currentBlock = await provider.getBlockNumber();
            if (currentBlock <= lastBlock) return;

            // Fetch events
            const events = await contract.queryFilter("ProofSubmitted", lastBlock + 1, currentBlock);

            for (const event of events) {
                const taskId = event.args[0];
                const ipfsHash = event.args[1];

                console.log(`\n---------------------------------`);
                console.log(`📷 New Proof Received for Task #${taskId} (Block ${event.blockNumber})`);
                console.log(`🔗 IPFS Hash: ${ipfsHash}`);

                await processVerification(taskId, ipfsHash, contract);
            }

            lastBlock = currentBlock;
        } catch (err) {
            console.error("⚠️ Polling Error (ignoring):", err.message);
        }
    }, 10000); // Poll every 10 seconds
}

// Separate function for processing to keep polling loop clean
async function processVerification(taskId, ipfsHash, contract) {
    // REAL AI ANALYSIS
    try {
        console.log(`🔍 Fetching task details...`);
        const task = await contract.tasks(taskId);

        console.log(`🧠 AI Agent is analyzing the photo via Google Gemini...`);

        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ CRITICAL: GEMINI_API_KEY missing");
            return;
        }

        // 1. Download Image from IPFS (Try multiple gateways)
        const gateways = [
            `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            `https://ipfs.io/ipfs/${ipfsHash}`,
            `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
            `https://dweb.link/ipfs/${ipfsHash}`,
            `https://w3s.link/ipfs/${ipfsHash}`,
            `https://flk-ipfs.xyz/ipfs/${ipfsHash}`
        ];

        let imageBuffer = null;
        for (const url of gateways) {
            try {
                console.log(`   > Trying gateway: ${url}`);
                const imageResp = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' } // Fake Browser to avoid some blocks
                });
                imageBuffer = Buffer.from(imageResp.data);
                console.log("   ✅ Image downloaded successfully.");
                break;
            } catch (err) {
                console.warn(`   ⚠️ Gateway failed (${url}): ${err.message}`);
            }
        }

        if (!imageBuffer) throw new Error("Could not download image from any IPFS gateway.");

        // 2. Ask Gemini
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an AI Auditor for a charity. 
        Task Description: "${task.description}"
        
        Does this image show proof of the task description? 
        If the image is completely black, blurry, irrelevant, or does not match, say NO.
        If the image matches the description reasonably well, say YES.
        
        Reply ONLY with "YES" or "NO".
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]);

        const responseText = result.response.text().trim().toUpperCase();
        console.log(`🤖 Gemini Response: "${responseText}"`);

        const isValid = responseText.includes("YES");

        console.log(`🤔 AI Verdict: ${isValid ? "MATCH VERIFIED ✅" : "REJECTED (Poor Quality/Mismatch) ❌"}`);

        if (isValid) {
            console.log(`🔓 Releasing remaining 70% funds to Vendor...`);
            const tx = await contract.verifyProof(taskId, true);
            console.log(`⏳ Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`🎉 Success! Funds released on-chain.`);
        } else {
            console.log(`🛑 Verification failed. Funds remain locked.`);
            const tx = await contract.verifyProof(taskId, false);
            console.log(`⏳ Rejection recorded: ${tx.hash}`);
            await tx.wait();
        }

    } catch (error) {
        console.error(`❌ Verification Logic Error:`, error.message);
    }
}

startVerifier().catch(console.error);
