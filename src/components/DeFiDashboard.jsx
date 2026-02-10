import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { getContract, getWeb3, toWei, fromWei } from '../web3Service';

const DeFiDashboard = ({ account, userRole, onLogout }) => {
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
  const [donationAmounts, setDonationAmounts] = useState({});

  // 1. SAFER LOAD TASKS
  const loadTasks = async () => {
    if (!account) return;

    try {
      const contract = await getContract();
      if (!contract) return;

      const taskCount = Number(await contract.methods.nextTaskId().call());
      const loadedTasks = [];

      // Limit to last 3 tasks (Newest First)
      const startIndex = Math.max(0, taskCount - 3);

      for (let i = taskCount - 1; i >= startIndex; i--) {
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
    return <div className="landing-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Please connect your wallet first.</h2>
    </div>;
  }

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <h1>TrustChain</h1>
        <div className="nav-links">
          <span style={{ cursor: 'pointer', color: '#cbd5e1' }}>About us</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0b1121', padding: '8px 16px', borderRadius: '20px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '20px' }}>🦊</span>
            <span style={{ fontSize: '12px', userSelect: 'all' }}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              borderRadius: '20px',
              padding: '6px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
          {userRole === 'ngo' ? 'DECENTRALIZED AID PROTOCOL' : 'DONATE SEAMLESSLY'}
        </h2>
        <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          {userRole === 'ngo'
            ? 'Create campaigns with a click of a button'
            : 'Leave the security and verification of ethical usage of funds to us'}
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* 1. NGO VIEW: CREATE TASK FORM (Split Layout) */}
        {userRole === 'ngo' && (
          <div className="card" style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '60px', background: '#0b1121', border: '1px solid #1e293b' }}>

            {/* Left: Upload Box */}
            <div style={{
              width: '300px', height: '200px',
              background: '#cbd5e1', borderRadius: '20px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#1e293b', fontWeight: 'bold'
            }}>
              <span style={{ fontSize: '18px', textAlign: 'center', marginBottom: '10px' }}>Upload Image of<br />thumbnail</span>
              <span style={{ fontSize: '40px' }}>+</span>
            </div>

            {/* Right: Form */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>Propose a New Campaign</h3>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Item Description</label>
                  <input className="input-pill" placeholder="" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Target ETH</label>
                  <input className="input-pill" placeholder="" value={target} onChange={e => setTarget(e.target.value)} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Vendor Wallet Address</label>
                  <input className="input-pill" placeholder="" value={vendorAddr} onChange={e => setVendorAddr(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button onClick={handleCreate} disabled={loading} className="btn-primary">Create campaign</button>
                  <button className="btn-primary" style={{ background: '#cbd5e1', color: '#1e293b' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASK LIST (Campaign Grid) */}
        <h3 style={{ fontSize: '24px', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '0' }}>Active Campaigns</h3>

        {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No campaigns found.</p>}

        <div className="campaign-grid">
          {tasks.map((t) => {
            const progress = (Number(t.fundedAmount) / Number(t.targetAmount)) * 100;
            const isFunded = progress >= 100;
            const isVendor = account && t.vendor && account.toLowerCase() === t.vendor.toLowerCase();
            const percentFunded = Math.min(Math.round(progress), 100);

            // Calculate Badge Text
            let badgeText = `${percentFunded}% Funded`;
            if (isFunded) badgeText = "Fully Funded";

            return (
              <div key={t.id} className="campaign-card">

                {/* Badge Overlay */}
                <div className="badge-funded">{badgeText}</div>

                {/* Image Area */}
                <div className="campaign-img-placeholder">
                  {t.proofImageHash ? (
                    <img
                      src={t.proofImageHash.startsWith("Qm") ? `https://gateway.pinata.cloud/ipfs/${t.proofImageHash}` : t.proofImageHash} // Fallback logic
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '20px', margin: '10px 0' }}>Campaign-{t.id.toString()}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', padding: '0 20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.description}
                </p>

                {/* Progress Bar Mini */}
                <div style={{ width: '80%', height: '6px', background: '#334155', margin: '15px auto', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentFunded}%`, background: '#2563eb', height: '100%' }}></div>
                </div>

                {/* Actions (Simplified for grid view) */}
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userRole === 'donor' && !isFunded && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="number"
                        placeholder="Amount"
                        className="input-pill"
                        style={{ padding: '8px 15px', fontSize: '12px', margin: 0 }}
                        value={donationAmounts[t.id] || ''}
                        onChange={(e) => setDonationAmounts(prev => ({ ...prev, [t.id]: e.target.value }))}
                      />
                      <button
                        className="btn-primary"
                        style={{ padding: '8px 15px', fontSize: '12px' }}
                        onClick={() => handleFund(t.id, donationAmounts[t.id] || "0.01")}
                      >
                        Donate
                      </button>
                    </div>
                  )}

                  {/* Quick Actions for NGO/Vendor */}
                  {isVendor && (
                    <>
                      {isFunded && !t.isInitialReleased && <button onClick={() => handleClaimInitial(t.id)} className="btn-primary" style={{ padding: '8px', fontSize: '12px', background: '#f59e0b' }}>Claim 30%</button>}
                      {t.isInitialReleased && !t.proofImageHash && <button onClick={() => initiateProof(t.id)} className="btn-primary" style={{ padding: '8px', fontSize: '12px', background: '#ec4899' }}>Upload Proof</button>}
                    </>
                  )}
                </div>

                {/* STATUS FOOTER - Explicit Fund Status */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e293b', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                  Status:
                  {!isFunded && <span style={{ color: '#f59e0b', marginLeft: '5px' }}>⚠️ Collecting Funds</span>}
                  {isFunded && !t.isInitialReleased && <span style={{ color: '#ef4444', marginLeft: '5px' }}>🔒 100% Locked in Smart Contract</span>}
                  {t.isInitialReleased && !t.proofImageHash && <span style={{ color: '#f59e0b', marginLeft: '5px' }}>🔓 30% Released (Waiting for Proof)</span>}
                  {t.proofImageHash && !t.isVerified && <span style={{ color: '#3b82f6', marginLeft: '5px' }}>🤖 AI Analyzing Proof... (70% Locked)</span>}
                  {t.isVerified && <span style={{ color: '#10b981', marginLeft: '5px' }}>✅ Verified & 100% Paid</span>}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CAMERA MODAL RESTORED */}
      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ background: '#1e293b', border: '1px solid #334155' }}>
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
              <button onClick={captureAndSubmit} className="btn-primary" style={{ background: '#10b981' }}>Capture</button>
              <button onClick={() => setShowCamera(false)} className="btn-primary" style={{ background: '#ef4444' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeFiDashboard;