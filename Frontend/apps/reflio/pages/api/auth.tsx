import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getUserDetails } from './user'; // Adjust the import path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { email, password } = req.body;

            // Check if email and password are provided
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Make a POST request to the Django backend API endpoint for user signup
            const response = await axios.post('http://localhost:8000/api/signup/', {
                email,
                password
            });

            // If signup is successful, return the user object received from Django
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Error during signup:', error.response?.data || error.message);
            // Handle specific error responses from Django or generic errors
            res.status(error.response?.status || 500).json({ error: 'Signup failed' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
