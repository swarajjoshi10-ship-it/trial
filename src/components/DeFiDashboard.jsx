import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { getContract, getWeb3, toWei, fromWei } from '../web3Service';

const DeFiDashboard = ({ account, userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [vendorAddr, setVendorAddr] = useState('');



  // Camera State
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  // 1. SAFER LOAD TASKS
  const loadTasks = async () => {
    if (!account) return;

    try {
      const contract = await getContract();
      if (!contract) return;

      const taskCount = await contract.methods.nextTaskId().call();
      const loadedTasks = [];

      for (let i = 0; i < taskCount; i++) {
        const t = await contract.methods.tasks(i).call();
        loadedTasks.push(t);
      }
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, [account]);

  // 2. CREATE TASK (Updated with Gas Limit)
  const handleCreate = async () => {
    if (!desc || !target || !vendorAddr) return alert("Fill all fields");

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return alert("Contract not loaded");

      await contract.methods.createTask(desc, toWei(target), vendorAddr)
        .send({
          from: account,
          value: toWei("0.001"),
          gas: '3000000' // <--- ADDED FIX HERE
        });

      alert("Task Posted! 🚀");
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  // 3. FUND TASK (Updated with Gas Limit)
  const handleFund = async (id, amountEth) => {
    try {
      const contract = await getContract();
      if (!contract) return;

      await contract.methods.fundTask(id)
        .send({
          from: account,
          value: toWei(amountEth),
          gas: '3000000' // <--- ADDED FIX HERE
        });

      alert("Donated! ❤️");
      loadTasks();
    } catch (err) {
      alert("Funding Failed: " + err.message);
    }
  };

  // 4. CLAIM FUNDS (Updated with Gas Limit)
  const handleClaimInitial = async (id) => {
    try {
      const contract = await getContract();
      if (!contract) return;

      await contract.methods.claimInitialFunds(id)
        .send({
          from: account,
          gas: '3000000' // <--- ADDED FIX HERE
        });

      alert("Funds Claimed!");
      loadTasks();
    } catch (err) {
      alert("Claim Failed: " + err.message);
    }
  };

  // 5. SUBMIT PROOF (Updated with Gas Limit)

  // 5. SUBMIT PROOF (INTEGRATED CAMERA)
  const initiateProof = (id) => {
    setActiveTaskId(id);
    setShowCamera(true);
  };

  const captureAndSubmit = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setShowCamera(false);

    try {
      alert("Uploading to IPFS... Please wait.");

      // 1. Upload to Pinata
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append('file', blob, `proof_${activeTaskId}.jpg`);

      const pinataRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY
        }
      });

      const ipfsHash = pinataRes.data.IpfsHash;
      console.log("IPFS Hash:", ipfsHash);

      // 2. Submit Hash to Blockchain
      const contract = await getContract();
      if (!contract) return;

      await contract.methods.submitProof(activeTaskId, ipfsHash)
        .send({ from: account });

      alert("Proof Uploaded & Sent! AI is verifying... 🤖");
      setActiveTaskId(null);
      setImgSrc(null);
      loadTasks();

    } catch (err) {
      console.error(err);
      alert("Upload Failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (!account) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Please connect your wallet first.</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px' }}>🌐 Decentralized Aid Protocol</h1>
        <p style={{ color: '#666' }}>Permissionless. Transparent. AI-Verified.</p>
      </div>


      {/* 1. NGO VIEW: CREATE TASK FORM */}
      {userRole === 'ngo' && (
        <div style={cardStyle}>
          <h3>➕ Propose a New Aid Task</h3>
          <p style={{ fontSize: '12px', color: '#888' }}>Request funds for your project. Cost: 0.001 ETH (Spam Protection)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '10px', marginTop: '10px' }}>
            <input placeholder="Item Description (e.g. Food, Meds)" value={desc} onChange={e => setDesc(e.target.value)} style={inputStyle} />
            <input placeholder="Target ETH (e.g. 0.1)" value={target} onChange={e => setTarget(e.target.value)} style={inputStyle} />
            <input placeholder="Vendor Wallet Address" value={vendorAddr} onChange={e => setVendorAddr(e.target.value)} style={inputStyle} />
            <button onClick={handleCreate} disabled={loading} style={btnStyle}>Request Funds</button>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3>📸 Take Proof Photo</h3>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              style={{ borderRadius: '8px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={captureAndSubmit} style={{ ...btnStyle, background: '#10b981' }}>Capture & Submit</button>
              <button onClick={() => setShowCamera(false)} style={{ ...btnStyle, background: '#ef4444' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DONOR VIEW: WELCOME */}
      {userRole === 'donor' && (
        <div style={{ ...cardStyle, background: 'linear-gradient(to right, #4f46e5, #0ea5e9)', color: 'white' }}>
          <h2 style={{ margin: 0 }}>👋 Welcome, Donor!</h2>
          <p style={{ opacity: 0.9 }}>Directly fund verified aid requests below. Your funds are locked until proof is provided.</p>
        </div>
      )}

      {/* TASK LIST */}
      <h2 style={{ marginTop: '30px' }}>{userRole === 'ngo' ? '📋 My Requests & Status' : '📢 Active Needs'}</h2>
      {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No tasks found. {userRole === 'ngo' ? 'Create one above!' : 'Check back later!'}</p>}

      {tasks.map((t) => {
        const progress = (Number(t.fundedAmount) / Number(t.targetAmount)) * 100;
        const isFunded = progress >= 100;
        const isVendor = account && t.vendor && account.toLowerCase() === t.vendor.toLowerCase();

        return (
          <div key={t.id} style={{ ...cardStyle, borderLeft: isFunded ? '5px solid #10b981' : '5px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0 }}>#{t.id.toString()} - {t.description}</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>Vendor: {t.vendor}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>{fromWei(t.fundedAmount)} / {fromWei(t.targetAmount)} ETH</div>
                <div style={{ fontSize: '12px', color: isFunded ? '#10b981' : '#f59e0b' }}>
                  {isFunded ? "✅ Fully Funded" : "⚠️ Needs Funds"}
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', height: '20px', background: '#e5e7eb', borderRadius: '10px', margin: '15px 0', overflow: 'hidden' }}>
              {/* Progress Fill */}
              <div style={{ width: `${Math.min(progress, 100)}%`, background: isFunded ? '#10b981' : '#f59e0b', height: '100%', borderRadius: '10px', transition: 'width 0.5s' }}></div>

              {/* 30% Marker Line */}
              <div style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, borderRight: '2px dashed #6b7280', zIndex: 10 }}></div>
              <div style={{ position: 'absolute', left: '30%', top: '-25px', fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}>30% Milestone</div>
            </div>

            {/* SHOW UPLOADED IMAGE (If available) */}
            {/* SHOW UPLOADED IMAGE (IPFS or Local) */}
            {t.proofImageHash && (
              <div style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>📸 Submitted Proof:</p>
                <img
                  src={t.proofImageHash.startsWith("Qm") ? `https://gateway.pinata.cloud/ipfs/${t.proofImageHash}` : `https://placehold.co/300x200?text=Processing`}
                  alt="Proof"
                  style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  onError={(e) => { e.target.src = localStorage.getItem(`proof_${t.id}`) || "https://placehold.co/300x200?text=Loading+IPFS..."; }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {/* DONOR ACTIONS */}
              {userRole === 'donor' && !isFunded && !t.isCompleted && (
                <button onClick={() => handleFund(t.id, "0.1")} style={{ ...btnStyle, background: '#10b981', flex: 1 }}>
                  ❤️ Donate 0.1 ETH
                </button>
              )}

              {/* NGO/VENDOR ACTIONS */}
              {isFunded && !t.isInitialReleased && isVendor && (
                <button onClick={() => handleClaimInitial(t.id)} style={{ ...btnStyle, background: '#f59e0b' }}>
                  🔓 Claim 30% Initial
                </button>
              )}
              {t.isInitialReleased && !t.proofImageHash && isVendor && (
                <button onClick={() => initiateProof(t.id)} style={{ ...btnStyle, background: '#6366f1' }}>
                  📷 Upload Proof
                </button>
              )}

              {/* STATUS BADGES */}
              {t.proofImageHash && !t.isVerified && <span style={badgeStyle}>🤖 AI Checking if photo matches "{t.description}"...</span>}
              {t.isVerified && !t.isCompleted && <span style={{ ...badgeStyle, background: '#ecfdf5', color: '#047857' }}>✅ Match Confirmed! Releasing 70%...</span>}
              {t.isCompleted && <span style={{ ...badgeStyle, background: '#d1fae5', color: '#065f46' }}>🎉 Completed & Paid</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px' };
const btnStyle = { padding: '10px 20px', background: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const badgeStyle = { padding: '8px 12px', background: '#e0e7ff', color: '#3730a3', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };

export default DeFiDashboard;