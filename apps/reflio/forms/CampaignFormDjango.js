// pages/campaigns.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    axios.get('/api/campaigns/')
      .then(response => {
        setCampaigns(response.data);
      })
      .catch(error => {
        console.error('Error fetching campaigns:', error);
      });
  }, []);

  return (
    <div>
      <h1>Campaigns</h1>
      <ul>
        {campaigns.map(campaign => (
          <li key={campaign.id}>{campaign.campaign_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignsPage;