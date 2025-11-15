const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simulated databases for demo
const users = new Map();
const solanaWallets = new Map();
const transactions = new Map();

// Price Oracle Simulation - FVC Token volatility
let fvcPrice = 1.00;
setInterval(() => {
    const changePercent = (Math.random() - 0.47) * 0.3;
    fvcPrice = Math.max(0.10, fvcPrice + (fvcPrice * changePercent));
    console.log(`New FVC Price: $${fvcPrice.toFixed(4)}`);
}, 5000);

// Capital One Nessie API Configuration
const NESSIE_API_KEY = process.env.CAPITAL_ONE_API_KEY || 'demo-key';
const NESSIE_BASE_URL = 'http://api.nessieisreal.com';

// Utility function for Nessie API calls
async function nessieRequest(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${NESSIE_BASE_URL}${endpoint}?key=${NESSIE_API_KEY}`,
            headers: { 'Content-Type': 'application/json' },
            data
        };
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Nessie API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Simulated Solana functions (will be replaced with real ones later)
function generateSolanaWallet() {
    const publicKey = `FVC${Math.random().toString(36).substring(2, 15)}`;
    const tokenAccount = `FVCAccount${Math.random().toString(36).substring(2, 15)}`;
    
    solanaWallets.set(publicKey, {
        publicKey,
        tokenAccount,
        balance: 0,
        createdAt: new Date()
    });
    
    return { publicKey, tokenAccount };
}

function transferFVC(fromAccount, toAccount, amount) {
    const wallet = solanaWallets.get(toAccount);
    if (wallet) {
        wallet.balance += amount;
        console.log(`Transferred ${amount} FVC to ${toAccount}`);
        return true;
    }
    return false;
}

// API Routes

// Get current FVC price
app.get('/api/price', (req, res) => {
    res.json({ 
        price: fvcPrice,
        timestamp: new Date().toISOString()
    });
});

// Create new user (onboarding)
app.post('/api/create-user', async (req, res) => {
    try {
        const { solanaPublicKey } = req.body;
        const userId = uuidv4();
        
        // Create Nessie customer
        const customerData = {
            first_name: "Demo",
            last_name: "User",
            address: {
                street_number: "123",
                street_name: "Demo St",
                city: "DemoCity",
                state: "DC",
                zip: "12345"
            }
        };
        
        const customer = await nessieRequest('/customers', 'POST', customerData);
        const customerId = customer._id;
        
        // Create checking account
        const checkingData = {
            type: "Checking",
            nickname: "BridgeFolio Checking",
            rewards: 0,
            balance: 0,
            account_number: Math.random().toString().slice(2, 12)
        };
        
        const checking = await nessieRequest(`/customers/${customerId}/accounts`, 'POST', checkingData);
        
        // Create savings account
        const savingsData = {
            type: "Savings",
            nickname: "BridgeFolio Savings",
            rewards: 2,
            balance: 0,
            account_number: Math.random().toString().slice(2, 12)
        };
        
        const savings = await nessieRequest(`/customers/${customerId}/accounts`, 'POST', savingsData);
        
        // Create Solana wallet
        const { publicKey, tokenAccount } = generateSolanaWallet();
        
        // Store user data
        const userData = {
            userId,
            customerId,
            checkingId: checking._id,
            savingsId: savings._id,
            solanaPublicKey: solanaPublicKey || publicKey,
            solanaTokenAccount: tokenAccount,
            createdAt: new Date()
        };
        
        users.set(userId, userData);
        
        res.json({
            userId,
            customerId,
            checkingId: checking._id,
            savingsId: savings._id,
            solanaPublicKey: userData.solanaPublicKey,
            solanaTokenAccount: tokenAccount
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get user data
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get account balances from Nessie
        const checkingAccount = await nessieRequest(`/accounts/${user.checkingId}`);
        const savingsAccount = await nessieRequest(`/accounts/${user.savingsId}`);
        
        // Get Solana balance
        const solanaWallet = solanaWallets.get(user.solanaTokenAccount);
        const fvcBalance = solanaWallet ? solanaWallet.balance : 0;
        
        res.json({
            ...user,
            checkingBalance: checkingAccount.balance,
            savingsBalance: savingsAccount.balance,
            fvcBalance,
            fvcPrice,
            deFiValue: fvcBalance * fvcPrice
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Simulate paycheck
app.post('/api/paycheck', async (req, res) => {
    try {
        const { userId, amount = 2000 } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const depositData = {
            medium: "balance",
            payee_id: user.customerId,
            amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Monthly Paycheck"
        };
        
        await nessieRequest(`/accounts/${user.checkingId}/deposits`, 'POST', depositData);
        
        res.json({ success: true, amount, message: 'Paycheck deposited' });
        
    } catch (error) {
        console.error('Paycheck error:', error);
        res.status(500).json({ error: 'Failed to process paycheck' });
    }
});

// Pay bills
app.post('/api/pay-bills', async (req, res) => {
    try {
        const { userId, amount = 1500 } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const withdrawalData = {
            medium: "balance",
            payee_id: user.customerId,
            amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Monthly Bills (Rent, Utilities, etc.)"
        };
        
        await nessieRequest(`/accounts/${user.checkingId}/withdrawals`, 'POST', withdrawalData);
        
        res.json({ success: true, amount, message: 'Bills paid' });
        
    } catch (error) {
        console.error('Pay bills error:', error);
        res.status(500).json({ error: 'Failed to pay bills' });
    }
});

// Transfer to savings
app.post('/api/transfer-to-savings', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Withdrawal from checking
        const withdrawalData = {
            medium: "balance",
            payee_id: user.customerId,
            amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Transfer to Savings"
        };
        
        await nessieRequest(`/accounts/${user.checkingId}/withdrawals`, 'POST', withdrawalData);
        
        // Deposit to savings
        const depositData = {
            medium: "balance",
            payee_id: user.customerId,
            amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Transfer from Checking"
        };
        
        await nessieRequest(`/accounts/${user.savingsId}/deposits`, 'POST', depositData);
        
        res.json({ success: true, amount, message: 'Transferred to savings' });
        
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Failed to transfer to savings' });
    }
});

// Bridge to Solana (The core mashup functionality)
app.post('/api/bridge-to-solana', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Step 1: Withdraw from Capital One checking account
        const withdrawalData = {
            medium: "balance",
            payee_id: user.customerId,
            amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Bridge to DeFi"
        };
        
        await nessieRequest(`/accounts/${user.checkingId}/withdrawals`, 'POST', withdrawalData);
        
        // Step 2: Transfer FVC tokens to user's Solana wallet
        const success = transferFVC('bank', user.solanaTokenAccount, amount);
        
        if (!success) {
            throw new Error('Failed to transfer FVC tokens');
        }
        
        // Log transaction
        const transactionId = uuidv4();
        transactions.set(transactionId, {
            transactionId,
            userId,
            type: 'bridge_to_solana',
            amount,
            fvcPrice,
            timestamp: new Date()
        });
        
        res.json({ 
            success: true, 
            amount, 
            message: 'Successfully bridged to Solana',
            transactionId
        });
        
    } catch (error) {
        console.error('Bridge error:', error);
        res.status(500).json({ error: 'Failed to bridge to Solana' });
    }
});

// Get Solana wallet info
app.get('/api/solana/:tokenAccount', (req, res) => {
    const { tokenAccount } = req.params;
    const wallet = solanaWallets.get(tokenAccount);
    
    if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json({
        ...wallet,
        currentPrice: fvcPrice,
        totalValue: wallet.balance * fvcPrice
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        fvcPrice,
        activeUsers: users.size
    });
});

app.listen(PORT, () => {
    console.log(`🚀 BridgeFolio Backend Server running on port ${PORT}`);
    console.log(`💰 FVC Price Oracle started at $${fvcPrice.toFixed(4)}`);
});