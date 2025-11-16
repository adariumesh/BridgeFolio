const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Gemini AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null;

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

// AI Mentor using Gemini
async function getAIMentorAdvice(portfolioData) {
    if (!geminiModel) {
        console.error('Gemini API not configured');
        return null;
    }

    try {
        const { totalTradFi, totalDeFi, totalPortfolio, riskRatio, fvcPrice } = portfolioData;
        
        const prompt = `You are a friendly financial literacy mentor for a game called BridgeFolio. The game teaches users about financial concepts through a simulation that combines traditional finance (TradFi) and decentralized finance (DeFi).

Current portfolio status:
- Total Portfolio Value: $${totalPortfolio.toFixed(2)}
- TradFi (Safe): $${totalTradFi.toFixed(2)} (${(100 - riskRatio * 100).toFixed(1)}%)
- DeFi (Volatile): $${totalDeFi.toFixed(2)} (${(riskRatio * 100).toFixed(1)}%)
- Current FVC Token Price: $${fvcPrice.toFixed(4)}

Based on this allocation, provide a brief, encouraging educational message (2-3 sentences) teaching ONE of these T. Rowe Price concepts:
- Risk vs. Return (if too safe: < 10% in DeFi)
- Volatility & Diversification (if too risky: > 70% in DeFi)
- Asset Allocation (if balanced: 30-70% in DeFi)

Keep it friendly, educational, and conversational. Don't use bullet points. Focus on the most relevant concept for their current allocation.`;

        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        const advice = response.text();

        // Determine the concept and title based on risk ratio
        let concept, title;
        if (riskRatio < 0.1) {
            concept = "Risk vs. Return";
            title = "Playing it Safe! 🏦";
        } else if (riskRatio > 0.7) {
            concept = "Volatility & Diversification";
            title = "High Roller Alert! ⚡";
        } else {
            concept = "Asset Allocation";
            title = "Great Job! 🎯";
        }

        return {
            title,
            body: advice,
            concept,
            isAI: true
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

// Simulated Solana functions (will be replaced with real ones later)
function generateSolanaWallet() {
    const publicKey = `FVC${Math.random().toString(36).substring(2, 15)}`;
    const tokenAccount = `FVCAccount${Math.random().toString(36).substring(2, 15)}`;
    
    // Store by tokenAccount so we can find it later
    solanaWallets.set(tokenAccount, {
        publicKey,
        tokenAccount,
        balance: 0,
        createdAt: new Date()
    });
    
    return { publicKey, tokenAccount };
}

function transferFVC(fromAccount, toAccount, amount) {
    let wallet = solanaWallets.get(toAccount);
    
    // If wallet doesn't exist, create it
    if (!wallet) {
        console.log(`Wallet ${toAccount} not found, creating it...`);
        wallet = {
            publicKey: toAccount,
            tokenAccount: toAccount,
            balance: 0,
            createdAt: new Date()
        };
        solanaWallets.set(toAccount, wallet);
    }
    
    wallet.balance += amount;
    console.log(`Transferred ${amount} FVC to ${toAccount}. New balance: ${wallet.balance}`);
    return true;
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
        // Nessie API returns: { code: 201, message: "...", objectCreated: { _id: "..." } }
        const customerId = customer.objectCreated?._id || customer._id;
        
        if (!customerId) {
            console.error('Failed to get customer ID from Nessie response:', customer);
            throw new Error('Customer creation failed - no ID returned');
        }
        
        console.log('Created Nessie customer:', customerId);
        
        // Create checking account
        // Nessie API requires specific fields for account creation
        const checkingData = {
            type: "Checking",
            nickname: "BridgeFolio Checking",
            rewards: 0,
            balance: 0
        };
        
        const checking = await nessieRequest(`/customers/${customerId}/accounts`, 'POST', checkingData);
        const checkingId = checking.objectCreated?._id || checking._id;
        
        console.log('Created checking account:', checkingId);
        
        // Create savings account
        const savingsData = {
            type: "Savings",
            nickname: "BridgeFolio Savings",
            rewards: 0,
            balance: 0
        };
        
        const savings = await nessieRequest(`/customers/${customerId}/accounts`, 'POST', savingsData);
        const savingsId = savings.objectCreated?._id || savings._id;
        
        console.log('Created savings account:', savingsId);
        
        // Create Solana wallet
        const { publicKey, tokenAccount } = generateSolanaWallet();
        
        // Store user data with local balance tracking
        const userData = {
            userId,
            customerId,
            checkingId,
            savingsId,
            solanaPublicKey: solanaPublicKey || publicKey,
            solanaTokenAccount: tokenAccount,
            // Track balances locally to avoid Nessie API issues
            checkingBalance: 0,
            savingsBalance: 0,
            createdAt: new Date()
        };
        
        users.set(userId, userData);
        
        console.log('User created successfully:', userId);
        
        res.json({
            userId,
            customerId,
            checkingId,
            savingsId,
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
        
        // Fetch real-time balances from Capital One Nessie API
        let checkingBalance = 0;
        let savingsBalance = 0;
        
        try {
            const checkingAccount = await nessieRequest(`/accounts/${user.checkingId}`);
            checkingBalance = checkingAccount.balance || 0;
            console.log(`Fetched checking balance from Nessie: $${checkingBalance}`);
        } catch (error) {
            console.error('Failed to fetch checking balance:', error.message);
            // Fallback to local tracking if API fails
            checkingBalance = user.checkingBalance || 0;
        }
        
        try {
            const savingsAccount = await nessieRequest(`/accounts/${user.savingsId}`);
            savingsBalance = savingsAccount.balance || 0;
            console.log(`Fetched savings balance from Nessie: $${savingsBalance}`);
        } catch (error) {
            console.error('Failed to fetch savings balance:', error.message);
            // Fallback to local tracking if API fails
            savingsBalance = user.savingsBalance || 0;
        }
        
        // Update local cache for fallback
        user.checkingBalance = checkingBalance;
        user.savingsBalance = savingsBalance;
        users.set(userId, user);
        
        // Get Solana balance
        const solanaWallet = solanaWallets.get(user.solanaTokenAccount);
        const fvcBalance = solanaWallet ? solanaWallet.balance : 0;
        
        res.json({
            ...user,
            checkingBalance,
            savingsBalance,
            fvcBalance,
            fvcPrice,
            deFiValue: fvcBalance * fvcPrice
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Simulate paycheck - using Capital One Deposits API
app.post('/api/paycheck', async (req, res) => {
    try {
        const { userId, amount = 2000 } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Create deposit via Capital One Nessie API
        const depositData = {
            medium: "balance",
            transaction_date: new Date().toISOString().split('T')[0],
            status: "completed",
            amount: amount,
            description: "Monthly Paycheck"
        };
        
        try {
            const deposit = await nessieRequest(`/accounts/${user.checkingId}/deposits`, 'POST', depositData);
            console.log(`Paycheck deposited via Nessie: +$${amount} to checking account ${user.checkingId}`);
            
            // Update local cache
            user.checkingBalance = (user.checkingBalance || 0) + amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Paycheck deposited',
                nessieResponse: deposit
            });
        } catch (apiError) {
            console.error('Nessie deposit API failed:', apiError.message);
            // Fallback to local tracking
            user.checkingBalance = (user.checkingBalance || 0) + amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Paycheck deposited (local fallback)',
                fallback: true
            });
        }
        
    } catch (error) {
        console.error('Paycheck error:', error);
        res.status(500).json({ error: 'Failed to process paycheck' });
    }
});

// Pay bills - using Capital One Withdrawals API
app.post('/api/pay-bills', async (req, res) => {
    try {
        const { userId, amount = 1500 } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if ((user.checkingBalance || 0) < amount) {
            return res.status(400).json({ error: 'Insufficient funds in checking' });
        }
        
        // Create withdrawal via Capital One Nessie API
        const withdrawalData = {
            medium: "balance",
            transaction_date: new Date().toISOString().split('T')[0],
            status: "completed",
            amount: amount,
            description: "Monthly Bills Payment"
        };
        
        try {
            const withdrawal = await nessieRequest(`/accounts/${user.checkingId}/withdrawals`, 'POST', withdrawalData);
            console.log(`Bills paid via Nessie: -$${amount} from checking account ${user.checkingId}`);
            
            // Update local cache
            user.checkingBalance = (user.checkingBalance || 0) - amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Bills paid',
                nessieResponse: withdrawal
            });
        } catch (apiError) {
            console.error('Nessie withdrawal API failed:', apiError.message);
            // Fallback to local tracking
            user.checkingBalance = (user.checkingBalance || 0) - amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Bills paid (local fallback)',
                fallback: true
            });
        }
        
    } catch (error) {
        console.error('Pay bills error:', error);
        res.status(500).json({ error: 'Failed to pay bills' });
    }
});

// Transfer to savings - using Capital One Transfers API
app.post('/api/transfer-to-savings', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if ((user.checkingBalance || 0) < amount) {
            return res.status(400).json({ error: 'Insufficient funds in checking' });
        }
        
        // Create transfer via Capital One Nessie API
        const transferData = {
            medium: "balance",
            payee_id: user.savingsId,
            amount: amount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: "Transfer to Savings"
        };
        
        try {
            const transfer = await nessieRequest(`/accounts/${user.checkingId}/transfers`, 'POST', transferData);
            console.log(`Transfer via Nessie: $${amount} checking→savings`);
            
            // Update local cache
            user.checkingBalance = (user.checkingBalance || 0) - amount;
            user.savingsBalance = (user.savingsBalance || 0) + amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Transferred to savings',
                nessieResponse: transfer
            });
        } catch (apiError) {
            console.error('Nessie transfer API failed:', apiError.message);
            // Fallback to local tracking
            user.checkingBalance = (user.checkingBalance || 0) - amount;
            user.savingsBalance = (user.savingsBalance || 0) + amount;
            users.set(userId, user);
            
            res.json({ 
                success: true, 
                amount, 
                message: 'Transferred to savings (local fallback)',
                fallback: true
            });
        }
        
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Failed to transfer to savings' });
    }
});

// Bridge to Solana (The core mashup functionality) - using Capital One Withdrawals API
app.post('/api/bridge-to-solana', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if ((user.checkingBalance || 0) < amount) {
            return res.status(400).json({ error: 'Insufficient funds in checking' });
        }
        
        // Step 1: Withdraw from checking account via Capital One Nessie API
        const withdrawalData = {
            medium: "balance",
            transaction_date: new Date().toISOString().split('T')[0],
            status: "completed",
            amount: amount,
            description: "Bridge to DeFi (Solana)"
        };
        
        try {
            await nessieRequest(`/accounts/${user.checkingId}/withdrawals`, 'POST', withdrawalData);
            console.log(`Bridge withdrawal via Nessie: -$${amount} from checking account ${user.checkingId}`);
        } catch (apiError) {
            console.error('Nessie withdrawal for bridge failed:', apiError.message);
            // Continue with local tracking as fallback
        }
        
        // Update local balance
        user.checkingBalance = (user.checkingBalance || 0) - amount;
        users.set(userId, user);
        
        // Step 2: Transfer FVC tokens to user's Solana wallet
        const success = transferFVC('bank', user.solanaTokenAccount, amount);
        
        if (!success) {
            throw new Error('Failed to transfer FVC tokens');
        }
        
        console.log(`Bridge: $${amount} → ${amount} FVC. Checking balance: $${user.checkingBalance}`);
        
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

// Get AI Mentor Advice
app.post('/api/mentor-advice', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Fetch real-time balances from Capital One Nessie API
        let checkingBalance = 0;
        let savingsBalance = 0;
        
        try {
            const checkingAccount = await nessieRequest(`/accounts/${user.checkingId}`);
            checkingBalance = checkingAccount.balance || 0;
        } catch (error) {
            console.error('Failed to fetch checking balance for mentor:', error.message);
            checkingBalance = user.checkingBalance || 0;
        }
        
        try {
            const savingsAccount = await nessieRequest(`/accounts/${user.savingsId}`);
            savingsBalance = savingsAccount.balance || 0;
        } catch (error) {
            console.error('Failed to fetch savings balance for mentor:', error.message);
            savingsBalance = user.savingsBalance || 0;
        }
        
        // Get Solana balance
        const solanaWallet = solanaWallets.get(user.solanaTokenAccount);
        const fvcBalance = solanaWallet ? solanaWallet.balance : 0;
        
        // Calculate portfolio metrics
        const totalTradFi = checkingBalance + savingsBalance;
        const totalDeFi = fvcBalance * fvcPrice;
        const totalPortfolio = totalTradFi + totalDeFi;
        const riskRatio = totalPortfolio > 0 ? totalDeFi / totalPortfolio : 0;
        
        // Only provide advice if portfolio is substantial enough
        if (totalPortfolio < 500) {
            return res.json({ 
                advice: null,
                message: 'Portfolio too small for advice yet'
            });
        }
        
        // Get AI advice
        const advice = await getAIMentorAdvice({
            totalTradFi,
            totalDeFi,
            totalPortfolio,
            riskRatio,
            fvcPrice
        });
        
        if (advice) {
            res.json({ advice });
        } else {
            // Fallback to pre-written advice if AI fails
            let fallbackAdvice;
            if (riskRatio < 0.1) {
                fallbackAdvice = {
                    title: "Playing it Safe! 🏦",
                    body: "Your money is secure, but you're missing out on growth potential. This demonstrates the Risk vs. Return tradeoff - safer investments typically offer lower returns.",
                    concept: "Risk vs. Return",
                    isAI: false
                };
            } else if (riskRatio > 0.7) {
                fallbackAdvice = {
                    title: "High Roller Alert! ⚡",
                    body: "Whoa! You're heavily invested in DeFi. Your portfolio is experiencing high Volatility - prices can swing dramatically. Consider Diversification to reduce risk.",
                    concept: "Volatility & Diversification",
                    isAI: false
                };
            } else {
                fallbackAdvice = {
                    title: "Great Job! 🎯",
                    body: "You've built a balanced portfolio! This demonstrates good Asset Allocation - spreading investments across different risk levels to optimize returns while managing risk.",
                    concept: "Asset Allocation",
                    isAI: false
                };
            }
            res.json({ advice: fallbackAdvice });
        }
        
    } catch (error) {
        console.error('Mentor advice error:', error);
        res.status(500).json({ error: 'Failed to get mentor advice' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        fvcPrice,
        activeUsers: users.size,
        geminiEnabled: !!geminiModel
    });
});

app.listen(PORT, () => {
    console.log(`🚀 BridgeFolio Backend Server running on port ${PORT}`);
    console.log(`💰 FVC Price Oracle started at $${fvcPrice.toFixed(4)}`);
    console.log(`🤖 Gemini AI Mentor: ${geminiModel ? 'ENABLED ✓' : 'DISABLED (using fallback)'}`);
});