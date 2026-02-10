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

  // 4. MAIN DASHBOARD (Clean spec, let global CSS handle background)
  return (
    <ActiveDashboardWrapper account={account} userRole={userRole} onLogout={disconnect} />
  );
}

// Helper to keep code clean
const ActiveDashboardWrapper = ({ account, userRole, onLogout }) => {
  return <DeFiDashboard account={account} userRole={userRole} onLogout={onLogout} />;
};

export default App;