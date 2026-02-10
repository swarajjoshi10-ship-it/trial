import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { getContract, getWeb3 } from '../web3Service';

const MilestoneProof = ({ milestoneId }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Capture Logic
  const capture = useCallback(() => {
    setImgSrc(webcamRef.current.getScreenshot());
  }, [webcamRef]);

  // 2. Upload Logic
  const uploadAndSubmit = async () => {
    setLoading(true);
    try {
        // --- IPFS Upload ---
        const blob = await (await fetch(imgSrc)).blob();
        const formData = new FormData();
        formData.append('file', blob);
        
        // 🔴 You will need your Pinata JWT here later
        const PINATA_JWT = "YOUR_PINATA_JWT_HERE"; 

        // Upload to Pinata
        /* const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: { 'Authorization': `Bearer ${PINATA_JWT}` }
        });
        const ipfsHash = res.data.IpfsHash; 
        */
       
        // MOCK HASH for testing (Delete this line when you have Pinata key)
        const ipfsHash = "QmTestHash123456789"; 

        console.log("Uploaded to IPFS:", ipfsHash);

        // --- Blockchain Submit ---
        const contract = await getContract();
        const web3 = getWeb3();
        const accounts = await web3.eth.getAccounts();

        await contract.methods.submitProof(milestoneId, ipfsHash)
            .send({ from: accounts[0] });

        alert("Proof Submitted! CID: " + ipfsHash);
    } catch (error) {
        console.error(error);
        alert("Upload Failed. Check console.");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', border: '1px solid #ddd', padding: '20px' }}>
      {!imgSrc ? (
        <>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={300} />
          <br/><br/>
          <button onClick={capture}>📸 Capture Proof</button>
        </>
      ) : (
        <>
          <img src={imgSrc} alt="Proof" width={300} />
          <br/><br/>
          <button onClick={() => setImgSrc(null)}>Retake</button>
          <button onClick={uploadAndSubmit} disabled={loading} style={{ background: 'green', color: 'white', marginLeft: '10px' }}>
            {loading ? "Uploading..." : "✅ Submit to Blockchain"}
          </button>
        </>
      )}
    </div>
  );
};

export default MilestoneProof;