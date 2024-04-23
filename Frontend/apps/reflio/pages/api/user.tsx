import axios from 'axios';

const backendBaseUrl = 'http://localhost:8000'; // Adjust the base URL to match your Django backend

// Example function to fetch user details
export const getUserDetails = async (token) => {
  try {
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
export const createCompany = async (token, companyData) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/api/company/create`, companyData, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the authentication token
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
