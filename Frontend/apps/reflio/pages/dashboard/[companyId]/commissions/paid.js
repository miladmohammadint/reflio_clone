import { SEOMeta } from '@/templates/SEOMeta'; 
import { CommissionsTemplate } from '@/components/CommissionsTemplate'; 

export default function CommissionsPaidPage() {
  return (
    <>
      <SEOMeta title="Paid Commissions"/>
      <CommissionsTemplate page="paid"/>
    </>
  );
}