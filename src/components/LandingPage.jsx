import React, { useState } from 'react';

const LandingPage = ({ onLogin }) => {
  const [role, setRole] = useState('donor');

  return (
    <div className="landing-page-container" style={{ display: 'flex', height: '100vh', justifyContent: 'space-between', alignItems: 'center', padding: '0 10%', position: 'relative', zIndex: 1 }}>

      {/* Left Side: Branding */}
      <div style={{ maxWidth: '50%' }}>
        <h1 style={{ fontSize: '64px', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>TrustChain</h1>
        <p style={{ fontSize: '18px', marginTop: '20px', lineHeight: '1.6', opacity: 0.9 }}>
          Experience a new era of philanthropy. Every donation is recorded on the blockchain, ensuring 100% transparency and that your funds directly reach the causes you care about.
        </p>
      </div>

      {/* Right Side: Login Card */}
      <div className="card" style={{ width: '350px', padding: '40px', background: '#0b1121', border: '1px solid #1e293b', borderRadius: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>Login</h2>

        {/* Toggle Switch */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '30px', padding: '4px', marginBottom: '30px' }}>
          <button
            onClick={() => setRole('donor')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '25px',
              border: 'none',
              background: role === 'donor' ? '#2563eb' : 'transparent',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            Donor
          </button>
          <button
            onClick={() => setRole('ngo')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '25px',
              border: 'none',
              background: role === 'ngo' ? '#2563eb' : 'transparent',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            NGO
          </button>
        </div>

        <p style={{ fontSize: '14px', marginBottom: '20px' }}>Connect MetaMask Profile</p>

        {/* Fox Icon Image */}
        <div style={{ marginBottom: '20px' }}>
          <img src="/foxface.png" alt="Connect MetaMask" style={{ width: '100px', height: 'auto' }} />
        </div>

        <button
          className="btn-primary"
          onClick={() => onLogin(role)}
          style={{ width: '100%', fontSize: '16px' }}
        >
          CONNECT
        </button>
      </div>

      {/* Footer Grass Image */}
      <img
        src="/grass.png"
        alt="Grass Footer"
        className="grass-footer-img"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',
          height: 'auto',
          maxHeight: '250px', // Increased max-height slightly to ensure visibility
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      />
    </div>
  );
};

export default LandingPage;