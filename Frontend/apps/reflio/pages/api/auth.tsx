// auth.tsx

import axios from 'axios';

// Define the signup function
export const signup = async (username: string, password: string) => {
    try {
        // Make a POST request to the Django backend API endpoint for user signup
        const response = await axios.post('http://localhost:8000/api/signup/', {
            username, // Change 'email' to 'username' to match Django's UserCreationForm
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

// Define the signin function
export const signin = async (username: string, password: string) => {
    try {
        // Make a POST request to the Django backend API endpoint for user signin
        const response = await axios.post('http://localhost:8000/api/signin/', {
            username, // Change 'email' to 'username' to match Django's authentication logic
            password
        });

        // If signin is successful, return the user object received from Django
        return response.data;
    } catch (error) {
        console.error('Error during signin:', error.response?.data || error.message);
        // Throw an error if signin fails
        throw new Error('Signin failed');
    }
};

// Default request handler for the /api/auth endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { username, password, type } = req.body;

            // Check if username and password are provided
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            let userData;
            // Call the appropriate function based on the type (signup or signin)
            if (type === 'signup') {
                userData = await signup(username, password);
            } else if (type === 'signin') {
                userData = await signin(username, password);
            } else {
                return res.status(400).json({ error: 'Invalid authentication type' });
            }

            // Return the user data received from the authentication function
            res.status(200).json(userData);
        } catch (error) {
            // Handle errors during authentication
            res.status(500).json({ error: error.message || 'Authentication failed' });
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
