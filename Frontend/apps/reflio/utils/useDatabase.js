export const referralSignup = async (referralId, cookieDate, email) => {
  try {
    const response = await fetch('http://your-django-backend.com/api/signup-referral/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralId,
        cookieDate,
        email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error('Error:', data);
      return 'error';
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error';
  }
};
