import { manualReferralSignup } from '@/utils/useDatabase';
import { withSentry } from '@sentry/nextjs';

const manualSignupReferral = async (req, res) => {
  if (req.method === 'POST') {
    // const token = req.headers.token;
    let body = req.body;
    try {
      body = JSON.parse(body);
    } catch (error) {
      console.log('Could not parse body');
    }

    try {
      const signup = await manualReferralSignup(
        body.referralIdentifier,
        body.referralId
      );

      if (signup !== 'error') {
        return res.status(200).json({ response: signup });
      }

      return res.status(500).json({ response: 'error' });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentry(manualSignupReferral)
  : manualSignupReferral;
