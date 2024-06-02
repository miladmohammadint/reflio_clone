import Cors from 'cors';
import { withSentry } from '@sentry/nextjs';
import { backendBaseUrl } from '../user';

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
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const campaignDetails = async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors);

  let body = req.body;
  try {
    body = JSON.parse(body);
    console.log("Could parse body");
  } catch (error) {
    console.log("Could not parse body")
  }

  try {
    if (body?.referralCode && body?.companyId) {
      // Replace this block with code to fetch campaign details from the Django backend
      // Use fetch or any other HTTP client library to make a request to your Django endpoint
      const apiUrl = `${backendBaseUrl}/api/campaign-details`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: body.referralCode,
          companyId: body.companyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign details');
      }

      const data = await response.json();
      return res.status(200).json({ statusCode: 200, campaign_details: data });
    }

    return res.status(500).json({ statusCode: 500, verified: false });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: { statusCode: 500, verified: false } });
  }
};

export default process.env.SENTRY_AUTH_TOKEN ? withSentry(campaignDetails) : campaignDetails;
