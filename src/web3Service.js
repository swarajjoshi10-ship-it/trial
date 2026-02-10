import Web3 from 'web3';
// Make sure this path points to your actual JSON file
import SatyaProtocolABI from './NGOContract.json';

// 🔴 REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS ON SEPOLIA
const CONTRACT_ADDRESS = "0x26F189a0daA025A7b9966F05c72315eE8944b972";

// Sepolia Network Params
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111
const SEPOLIA_CONFIG = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const getWeb3 = () => {
    if (window.ethereum) {
        return new Web3(window.ethereum);
    } else {
        alert("Please install MetaMask!");
        return null;
    }
};

export const getContract = async () => {
    const web3 = getWeb3();
    if (!web3) return null;

    try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Force switch to Sepolia
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [SEPOLIA_CONFIG],
                });
            }
        }

        return new web3.eth.Contract(SatyaProtocolABI, CONTRACT_ADDRESS);
    } catch (error) {
        console.error("User denied account access or network switch error", error);
        return null;
    }
};

export const toWei = (amount) => {
    const web3 = getWeb3();
    if (!web3) return "0";
    return web3.utils.toWei(amount.toString(), 'ether');
};

export const fromWei = (amount) => {
    const web3 = getWeb3();
    if (!web3) return "0";
    return web3.utils.fromWei(amount.toString(), 'ether');
};