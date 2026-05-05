const axios = require('axios');

async function testBackend() {
    try {
        console.log('1. Attempting Registration...');
        const uniqueEmail = `test_${Date.now()}@neurotask.com`;
        
        let registerResult;
        try {
            const regRes = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Test Administrator',
                email: uniqueEmail,
                password: 'password123',
                role: 'admin'
            });
            registerResult = regRes.data;
            console.log('Registration Success!');
        } catch (e) {
            console.error('Registration failed:', e.response?.data || e.message);
            return;
        }

        console.log('2. Attempting Login...');
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
                email: uniqueEmail,
                password: 'password123'
            });
            console.log('Login Success! Token received:', loginRes.data.token.substring(0, 15) + '...');
        } catch (e) {
            console.error('Login failed:', e.response?.data || e.message);
            return;
        }

    } catch (err) {
        console.error('Test script crashed:', err.message);
    }
}

testBackend();
