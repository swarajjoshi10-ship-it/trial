import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userRole }) => {
  // 1. Define menu items inside the component so they can access 'userRole'
  const allMenuItems = [
    { id: 'dashboard', icon: '📊', label: 'Overview', roles: ['donor', 'ngo'] },
    { id: 'tasks', icon: '✅', label: 'Tasks / Proof', roles: ['ngo'] }, 
    { id: 'donate', icon: '❤️', label: 'Donate', roles: ['donor'] },
    { id: 'funds', icon: '💰', label: 'Funds & Milestones', roles: ['donor', 'ngo'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  // 2. Styles
  const styles = {
    sidebar: {
      width: '250px',
      height: '100vh',
      background: '#1a1a2e',
      color: 'white',
      padding: '20px',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    logo: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', color: '#4cc9f0' },
    item: (id) => ({
      padding: '15px',
      cursor: 'pointer',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: '0.3s',
      // This is where activeTab is used safely
      background: activeTab === id ? '#16213e' : 'transparent',
      borderLeft: activeTab === id ? '4px solid #4cc9f0' : '4px solid transparent'
    }),
    logout: { 
      marginTop: 'auto', 
      padding: '15px', 
      background: '#e63946', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      textAlign: 'center' 
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>🔗 Satya-Ledger</div>
      
      {menuItems.map(item => (
        <div 
          key={item.id}
          style={styles.item(item.id)} // Pass the ID to the style function
          onClick={() => setActiveTab(item.id)}
        >
          <span>{item.icon}</span> {item.label}
        </div>
      ))}

      <div style={styles.logout} onClick={onLogout}>
        🚪 Disconnect
      </div>
    </div>
  );
};

export default Sidebar;