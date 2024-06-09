import Cors from 'cors';
import { withSentry } from '@sentry/nextjs';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const signupReferral = async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors);

  let body = req.body;
  try {
    body = JSON.parse(body);
  } catch (error) {
    console.log('Could not parse body');
  }

  try {
    if (body?.referralId && body?.cookieDate && body?.email) {
      // Call the new Django endpoint
      const response = await fetch('http://your-django-backend.com/api/signup-referral/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralId: body.referralId,
          cookieDate: body.cookieDate,
          email: body.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json({ statusCode: 200, signup_details: data });
      } else {
        return res.status(500).json({ statusCode: 500, error: data });
      }
    }

    return res.status(400).json({ statusCode: 400, error: 'Invalid request body' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: { statusCode: 500 } });
  }
};

export default process.env.SENTRY_AUTH_TOKEN ? withSentry(signupReferral) : signupReferral;
