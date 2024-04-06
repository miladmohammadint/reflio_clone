// /api/user.tsx

import axios from 'axios';

// Example function to fetch user details
export const getUserDetails = async () => {
  try {
    const response = await axios.get('/api/user/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Example function to update user information
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`/api/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Example function to delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
