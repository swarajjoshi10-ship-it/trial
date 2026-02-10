import React from 'react';

const LandingPage = ({ onLogin }) => {
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '60px', marginBottom: '20px' }}>🔗 Satya-Ledger</h1>
        <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px' }}>
          The world's first transparent NGO tracking system powered by Blockchain.
          See exactly where every penny goes.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => onLogin('donor')}
            style={{ padding: '15px 40px', fontSize: '18px', background: 'white', color: '#764ba2', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ❤️ Login as Donor
          </button>
          <button
            onClick={() => onLogin('ngo')}
            style={{ padding: '15px 40px', fontSize: '18px', background: 'transparent', color: 'white', border: '2px solid white', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📋 Login as NGO / Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;