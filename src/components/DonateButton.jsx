import React, { useState } from 'react';
import { getContract, getWeb3 } from '../web3Service';

const DonateButton = () => {
    const [amount, setAmount] = useState("");

    const handleDonate = async () => {
        if (!amount) return alert("Enter an amount!");
        try {
            const contract = await getContract();
            const web3 = getWeb3();
            const accounts = await web3.eth.getAccounts();
            
            await web3.eth.sendTransaction({
                from: accounts[0],
                to: contract.options.address,
                value: web3.utils.toWei(amount, "ether")
            });
            alert("Donation Successful! 🎉");
        } catch (err) {
            console.error(err);
            alert("Transaction Failed (Check Console)");
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            <h3>❤️ Support Our Cause</h3>
            <input 
                type="text" 
                placeholder="Amount in ETH" 
                onChange={(e) => setAmount(e.target.value)} 
                style={{ padding: '8px', marginRight: '10px' }}
            />
            <button onClick={handleDonate} style={{ padding: '8px', background: 'blue', color: 'white', cursor: 'pointer' }}>
                Donate Now
            </button>
        </div>
    );
};

export default DonateButton;