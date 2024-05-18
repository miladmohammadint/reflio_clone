import axios from 'axios';
import { getTokenFromLocalStorage } from './auth'; // Import the getTokenFromLocalStorage function

const backendBaseUrl = 'http://localhost:8000'; // Adjust the base URL to match your Django backend

// Set Axios defaults to send credentials (including cookies) with requests
axios.defaults.withCredentials = true;

// Set Axios defaults for CSRF token handling
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Function to get CSRF token from cookies
export const getCSRFToken = () => {
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  } else {
    console.error('CSRF token not found in cookies');
    return null;
  }
};

// Function to fetch user details
export const getUserDetails = async () => {
  try {
    const token = getTokenFromLocalStorage(); // Retrieve the token from localStorage
    const response = await axios.get(`${backendBaseUrl}/api/user/details/`, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the retrieved authentication token
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Example function to update user information
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${backendBaseUrl}/api/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Example function to delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${backendBaseUrl}/api/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Function to create a new company
export const createCompany = async (companyData) => {
  try {
    // Retrieve CSRF token from cookies using the getCSRFToken function
    const csrfToken = getCSRFToken();

    // Check if CSRF token is valid
    if (!csrfToken || csrfToken.length !== 32) {
      console.error('Invalid CSRF token:', csrfToken);
      throw new Error('Invalid CSRF token');
    }

    // Send request with CSRF token in headers
    const response = await axios.post(`${backendBaseUrl}/api/company/create`, companyData, {
      headers: {
        'X-CSRFToken': csrfToken, // Include the CSRF token in the headers
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Function to fetch team details
export const getTeam = async () => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/team`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team details:', error);
    throw error;
  }
};

// Function to fetch subscription details
export const getSubscription = async () => {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/subscription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};
