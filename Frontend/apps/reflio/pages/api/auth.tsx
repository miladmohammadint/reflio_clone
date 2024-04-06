import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define the signup function
export const signup = async (email: string, password: string) => {
    try {
        // Make a POST request to the Django backend API endpoint for user signup
        const response = await axios.post('http://localhost:8000/api/signup/', {
            email,
            password
        });

        // If signup is successful, return the user object received from Django
        return response.data;
    } catch (error) {
        console.error('Error during signup:', error.response?.data || error.message);
        // Throw an error if signup fails
        throw new Error('Signup failed');
    }
};

// Default request handler for the /api/auth endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { email, password } = req.body;

            // Check if email and password are provided
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Call the signup function to handle the signup process
            const userData = await signup(email, password);

            // Return the user data received from the signup function
            res.status(200).json(userData);
        } catch (error) {
            // Handle errors during signup
            res.status(500).json({ error: error.message || 'Signup failed' });
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
