// auth.tsx

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the key for storing the token in localStorage
const TOKEN_KEY = 'authToken';

// Function to save the token to localStorage
const saveTokenToLocalStorage = (token) => {
    console.log('Token saved to localStorage:', token);
    localStorage.setItem(TOKEN_KEY, token);
  };

// Function to retrieve the token from localStorage
const getTokenFromLocalStorage = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Define the signup function
export const signup = async (username: string, password: string) => {
    try {
        const response = await axios.post('http://localhost:8000/api/signup/', {
            username,
            password
        });
        const { data } = response;
        console.log('Signup response data:', response.data); // Log the response data
        // Save the token to localStorage
        saveTokenToLocalStorage(data.token);
        return data;
    } catch (error) {
        console.error('Error during signup:', error.response?.data || error.message);
        throw new Error('Signup failed');
    }
};

// Define the signin function
export const signin = async (username: string, password: string) => {
    axios.defaults.withCredentials = true;
    try {
        const response = await axios.post('http://localhost:8000/api/signin/', {
            username,
            password
        });
        const { data } = response;
        console.log('Signin response data:', data); // Log the response data
        // Save the token to localStorage
        saveTokenToLocalStorage(data.token);
        return data;
    } catch (error) {
        console.error('Error during signin:', error.response?.data || error.message);
        throw new Error('Signin failed');
    }
};

// Define the signout function
export const signout = async () => {
    axios.defaults.withCredentials = true;
    try {
        // Make a POST request to the Django backend API endpoint for user signout
        await axios.post('http://localhost:8000/api/signout/');
        // Remove the token from localStorage
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error during signout:', error.response?.data || error.message);
        throw new Error('Signout failed');
    }
};

// Function to fetch user details
export const getUserDetails = async () => {
    try {
      const token = getTokenFromLocalStorage(); // Retrieve the token from localStorage
      if (!token) {
        throw new Error('Token not found in localStorage');
      }
      const response = await axios.get(`${backendBaseUrl}/api/user/details`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authentication token
        },
      });
      if (response.data.error) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
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
