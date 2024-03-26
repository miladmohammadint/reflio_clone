import { useState } from 'react';
import Button from '@/components/Button';
import LoadingDots from '@/components/LoadingDots';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';

export const CampaignForm = ({ edit, setupMode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading === true) {
      return false;
    }

    const formData = new FormData(e.target);
    const data = {};

    for (let entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }

    setLoading(true);

    try {
      const response = await fetch('/api/campaigns/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (setupMode) {
            router.replace(`/dashboard/${router?.query?.companyId}/setup/add`);
          } else {
            router.replace(`/dashboard/${router?.query?.companyId}/campaigns`);
          }
        } else {
          toast.error('There was an error when creating your campaign, please try again later.');
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('There was an error when creating your campaign, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {
        <form
          className="rounded-xl bg-white max-w-2xl overflow-hidden shadow-lg border-4 border-gray-300"
          action="#"
          method="POST"
          onSubmit={handleSubmit}
        >
          {/* Form fields */}
          {/* Submit button */}
          <Button large primary disabled={loading}>
            <span>{loading ? (edit ? 'Editing Campaign...' : 'Creating Campaign...') : (edit ? 'Save Changes' : 'Create Campaign')}</span>
          </Button>
        </form>
      }
      <ReactTooltip />
    </div>
  );
};

export default CampaignForm;
