import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import DeFiDashboard from './components/DeFiDashboard';
import { getWeb3 } from './web3Service';

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. LOGIN LOGIC (Connects MetaMask)
  const handleLogin = async (role) => {
    if (window.ethereum) {
      try {
        const web3 = getWeb3();
        // Request Account Access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setAccount(accounts[0]); // Save the active wallet address
        setUserRole(role);       // 'donor' or 'ngo' (mostly for UI themes now)
        setActiveTab('dashboard');
      } catch (error) {
        console.error("Connection rejected", error);
        alert("Connection failed. Please check MetaMask.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setUserRole(null);
  };

  // 2. ROUTING LOGIC (Switches Views)
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // This is your new "Mega Component" that handles Creating, Funding, and Claiming
        return <DeFiDashboard account={account} userRole={userRole} />;

      case 'tasks':
        // We reuse the Dashboard here because it includes the Task Feed
        return <DeFiDashboard account={account} userRole={userRole} />;

      case 'funds':
        // Legacy view for purely financial stats (optional, looks good for demos)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FundsCard />
            <ActivityFeed />
          </div>
        );

      default:
        return <DeFiDashboard account={account} userRole={userRole} />;
    }
  };

  // 3. LANDING PAGE (If not logged in)
  if (!account) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // 4. MAIN DASHBOARD LAYOUT (Simplified)
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* Simple Top Navigation */}
      <nav style={{ background: 'white', padding: '15px 40px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔗</span>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>SatyaProtocol</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Role: <strong style={{ color: userRole === 'ngo' ? '#7c3aed' : '#059669' }}>{userRole === 'ngo' ? 'NGO / Creator' : 'Donor'}</strong>
          </span>

          <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
            🟢 {account.substring(0, 6)}...{account.substring(38)}
          </div>

          <button onClick={disconnect} style={{ border: '1px solid #e5e7eb', background: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area - Centered */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <DeFiDashboard account={account} userRole={userRole} />
      </div>

    </div>
  );
}

export default App;