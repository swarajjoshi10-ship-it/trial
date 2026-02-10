import React from 'react';
import MilestoneProof from './MilestoneProof';
import DonateButton from './DonateButton';

// 1. FUNDS CARD
export const FundsCard = () => (
  <div style={cardStyle}>
    <h3>💰 Current Alloted Funds</h3>
    <h1 style={{ color: '#2ecc71', fontSize: '40px', margin: '10px 0' }}>$5,240.00</h1>
    <p style={{ color: '#7f8c8d' }}>Of $10,000 Goal (52%)</p>
    <div style={{ background: '#eee', height: '10px', borderRadius: '5px', marginTop: '10px' }}>
      <div style={{ background: '#2ecc71', width: '52%', height: '100%', borderRadius: '5px' }}></div>
    </div>
  </div>
);

// 2. NEARBY VENDORS CARD
export const VendorList = () => (
  <div style={cardStyle}>
    <h3>🏪 Nearby Verified Vendors</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {['Annapoorna Rice Depot (0.8 km)', 'Fresh Veggies Hub (1.2 km)', 'City Meds Pharmacy (2.5 km)'].map((v, i) => (
        <li key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <span>{v}</span>
          <span style={{ color: 'green', fontSize: '12px' }}>✅ Verified</span>
        </li>
      ))}
    </ul>
    <button style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#f1f1f1', border: 'none', cursor: 'pointer' }}>View Map</button>
  </div>
);

// 3. ACTIVITY FEED (COMMENTS/DONATIONS)
export const ActivityFeed = () => (
  <div style={cardStyle}>
    <h3>💬 Recent Activity</h3>
    {[
      { user: 'Alice (Donor)', action: 'Donated 0.5 ETH', time: '2 mins ago' },
      { user: 'SaveTheKids (NGO)', action: 'Uploaded Proof for Task #2', time: '1 hour ago' },
      { user: 'Bob (Donor)', action: 'Commented: "Keep up the great work!"', time: '3 hours ago' },
    ].map((item, i) => (
      <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
        <strong>{item.user}</strong> <span style={{ color: '#555' }}>{item.action}</span>
        <div style={{ fontSize: '12px', color: '#aaa' }}>{item.time}</div>
      </div>
    ))}
  </div>
);


export const MakeDonation = () => (
  <div style={cardStyle}>
    <h3>❤️ Make a Difference</h3>
    <p>Select a cause and fund it directly on the blockchain.</p>
    <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
      <DonateButton />
    </div>
  </div>
);

// 4. CURRENT TASK (Uses your existing MilestoneProof)
export const CurrentTask = () => (
  <div style={cardStyle}>
    <h3>📌 Current Task: Food Distribution</h3>
    <p><strong>Milestone #1:</strong> Distribute 500 meals in Sector 4.</p>
    <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', margin: '10px 0', color: '#856404' }}>
      ⚠️ Proof Pending - Upload photo to release next 50% funds.
    </div>
    <MilestoneProof milestoneId={1} />
  </div>
);

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  marginBottom: '20px'
};