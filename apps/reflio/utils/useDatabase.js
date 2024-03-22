import { supabaseAdmin } from './supabase-admin';
import { stripe } from './stripe';
import { toDateTime, LogSnagPost, monthsBetweenDates } from './helpers';
import { createCommission } from '@/utils/stripe-helpers';

export const upsertProductRecord = async (product) => {
  const productData = {
    product_id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error } = await supabaseAdmin
    .from('products')
    .insert([productData], { upsert: true });
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

export const upsertPriceRecord = async (price) => {
  const priceData = {
    id: price.id,
    product_id: price.product,
    active: price.active,
    currency: price.currency,
    description: price.nickname,
    type: price.type,
    unit_amount: price.unit_amount,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata
  };

  const { error } = await supabaseAdmin
    .from('prices')
    .insert([priceData], { upsert: true });
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

export const createOrRetrieveCustomer = async ({ id, teamId, email }) => {
  console.log('Running...');
  const createCustomer = async () => {
    console.log('Running create func...');
    const customerData = {
      metadata: {
        supabaseTeamId: teamId
      }
    };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await supabaseAdmin
      .from('customers')
      .upsert([
        { user_id: id, team_id: teamId, stripe_customer_id: customer.id }
      ]);
    if (supabaseError) throw supabaseError;
    console.log(`New customer created and inserted for ${teamId}.`);
    return customer.id;
  };

  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('team_id', teamId)
    .single();

  if (error || !data?.stripe_customer_id) {
    return await createCustomer();
  }

  if (data.stripe_customer_id) {
    const customer = await stripe.customers.retrieve(data.stripe_customer_id);
    console.log('Found:');
    console.log(customer);
    if (!customer?.created) {
      console.log('Could not retrieve... creating!');
      await createCustomer();
    }
  }

  if (data) return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
export const copyBillingDetailsToCustomer = async (teamId, payment_method) => {
  const customer = payment_method.customer;
  const { name, phone, address } = payment_method.billing_details;
  await stripe.customers.update(customer, { name, phone, address });
  const { error } = await supabaseAdmin
    .from('teams')
    .update({
      billing_address: address,
      payment_method: payment_method[payment_method.type]
    })
    .eq('team_id', teamId);
  if (error) throw error;
};

export const manageSubscriptionStatusChange = async (
  subscriptionId,
  customerId,
  createAction = false
) => {
  // Get customer's teamId from mapping table.
  const {
    data: { team_id: teamId, user_id: userId },
    error: noCustomerError
  } = await supabaseAdmin
    .from('customers')
    .select('team_id, user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData = {
    user_id: userId,
    id: subscription.id,
    team_id: teamId,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at)
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at)
      : null,
    current_period_start: toDateTime(subscription.current_period_start),
    current_period_end: toDateTime(subscription.current_period_end),
    created: toDateTime(subscription.created),
    ended_at: subscription.ended_at ? toDateTime(subscription.ended_at) : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start)
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end)
      : null
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .insert([subscriptionData], { upsert: true });
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for team [${teamId}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method)
    await copyBillingDetailsToCustomer(
      teamId,
      subscription.default_payment_method
    );
};

export const getCampaignData = async (companyId) => {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error) return null;

  return data;
};

export const getAccountEmail = async (id) => {
  const { data } = await supabaseAdmin
    .from('users_table')
    .select('email')
    .eq('id', id)
    .single();

  if (data) {
    return data?.email ? data?.email : null;
  } else {
    return 'error';
  }
};

export const getCompanyFromExternal = async (domain) => {
  let companyData = null;

  let { data, error } = await supabaseAdmin
    .from('companies')
    .select('company_id, domain_verified, company_url, created')
    .eq('company_url', domain)
    .order('created', { ascending: false })
    .limit(1);

  if (data?.length) {
    companyData = data[0];
  }

  if (error) return 'error getting company';

  if (companyData?.domain_verified === false) {
    let { error } = await supabaseAdmin
      .from('companies')
      .update({
        domain_verified: true
      })
      .eq('company_id', companyData?.company_id);

    if (error) return 'error updating company';
  }

  return 'success';
};

export const inviteAffiliate = async (
  user,
  companyId,
  campaignId,
  emailInvites,
  name,
  vercel_username
) => {
  const { error } = await supabaseAdmin.from('affiliates').insert({
    id: user?.id,
    team_id: user?.team_id,
    company_id: companyId,
    campaign_id: campaignId,
    invite_email: emailInvites,
    name: name,
    vercel_username: vercel_username
  });

  if (error) {
    return 'error';
  } else {
    await LogSnagPost(
      'invite-affiliate',
      `New affiliate invited for campaign ${campaignId}`
    );

    return 'success';
  }
};

export const verifyReferral = async (referralCode, companyId) => {
  let referralData = null;
  let { data } = await supabaseAdmin
    .from('affiliates')
    .select('*')
    .eq('company_id', companyId)
    .or(`referral_code.eq.${referralCode},affiliate_id.eq.${referralCode}`);

  if (data?.length) {
    referralData = data[0];
  }

  if (referralData === null) {
    return 'error';
  } else {
    return referralData;
  }
};

export const fireRecordImpression = async (id) => {
  const { error } = await supabaseAdmin.rpc('referralimpression', {
    x: 1,
    affiliateid: id
  });

  if (error) {
    return 'error';
  } else {
    return 'success';
  }
};

export const createReferral = async (details) => {
  let campaignData = null;
  let { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('campaign_id', details?.campaign_id)
    .single();

  if (error) {
    return 'error';
  }

  if (data) {
    campaignData = data;

    let dateToday = new Date();
    if (campaignData?.cookie_window) {
      dateToday.setDate(dateToday.getDate() + data?.cookie_window);
    } else {
      dateToday.setDate(dateToday.getDate() + 60);
    }
    let dateTodayIso = dateToday.toISOString();
    dateToday = dateToday.toUTCString();

    let referralData = ({ data, error } = await supabaseAdmin
      .from('referrals')
      .insert({
        id: campaignData?.id,
        team_id: campaignData?.team_id,
        affiliate_id: details?.affiliate_id,
        affiliate_code: details?.affiliate_code ?? null,
        campaign_id: campaignData?.campaign_id,
        company_id: campaignData?.company_id,
        commission_type: campaignData?.commission_type,
        commission_value: campaignData?.commission_value,
        cookie_window: campaignData?.cookie_window,
        commission_period: campaignData?.commission_period,
        minimum_days_payout: campaignData?.minimum_days_payout,
        referral_expiry: dateTodayIso,
        referral_reference_email: details?.referral_reference_email ?? null
      }));

    if (referralData?.data) {
      await LogSnagPost(
        'referral-created',
        `New referral created for campaign ${campaignData?.campaign_name}`
      );

      return {
        campaign_id: campaignData?.campaign_id,
        cookie_date: dateToday,
        campaign_name: campaignData?.campaign_name,
        affiliate_id: details?.affiliate_id,
        referral_id: referralData?.data[0].referral_id,
        commission_period: referralData?.data[0].commission_period
      };
    } else {
      return 'error';
    }
  }
};

export const campaignInfo = async (code, companyId) => {
  let campaignData = null;
  const referralVerify = await verifyReferral(code, companyId);

  if (referralVerify === 'error') return 'error';

  let { data, error } = await supabaseAdmin
    .from('campaigns')
    .select(
      'campaign_name, discount_code, discount_value, discount_type, company_id'
    )
    .eq('campaign_id', referralVerify?.campaign_id)
    .single();

  if (error) {
    return 'error';
  }

  if (data) {
    campaignData = data;
  }

  let companyData = await supabaseAdmin
    .from('companies')
    .select('company_currency')
    .eq('company_id', campaignData?.company_id)
    .single();

  if (companyData?.data !== null && companyData?.data?.company_currency) {
    campaignData.company_currency = companyData?.data?.company_currency;
  }

  return campaignData;
};

export const referralSignup = async (referralId, cookieDate, email) => {
  let referralData = await supabaseAdmin
    .from('referrals')
    .select('*')
    .eq('referral_id', referralId)
    .single();

  if (referralData?.data && cookieDate) {
    let dateToday = new Date();
    let dateTodayTimestamp = dateToday.getTime();
    let cookieExpiryDate = new Date(cookieDate);
    let cookieExpiryDateTimestamp = cookieExpiryDate.getTime();

    if (dateTodayTimestamp > cookieExpiryDateTimestamp) {
      return 'expired';
    }

    //Add email to referral object
    await supabaseAdmin
      .from('referrals')
      .update({
        referral_reference_email: email
      })
      .eq('referral_id', referralId);

    //Get stripe ID from company
    let companyData = await supabaseAdmin
      .from('companies')
      .select('stripe_id')
      .eq('company_id', referralData?.data?.company_id)
      .single();

    if (
      companyData?.data?.stripe_id &&
      companyData?.data?.stripe_id !== 'manual'
    ) {
      const customer = await stripe.customers.list(
        {
          email: email,
          limit: 1
        },
        {
          stripeAccount: companyData?.data?.stripe_id
        }
      );

      if (customer?.data?.length) {
        await stripe.customers.update(
          customer?.data[0]?.id,
          { metadata: { reflio_referral_id: referralData?.data?.referral_id } },
          { stripeAccount: companyData?.data?.stripe_id }
        );
      }
    }

    return referralData?.data;
  }

  return 'error';
};

export const manualReferralSignup = async (identifier, referralId) => {
  console.log(identifier, referralId);
  let referralData = await supabaseAdmin
    .from('referrals')
    .select('*')
    .eq('referral_id', referralId)
    .single();

  if (referralData?.data) {
    console.log('referral has data');

    //Add identifier to referral object
    await supabaseAdmin
      .from('referrals')
      .update({
        referral_reference_email: identifier
      })
      .eq('referral_id', referralId);

    //Get stripe ID from company
    let companyData = await supabaseAdmin
      .from('companies')
      .select('stripe_id')
      .eq('company_id', referralData?.data?.company_id)
      .single();

    if (
      companyData?.data?.stripe_id &&
      companyData?.data?.stripe_id !== 'manual' &&
      identifier?.includes('@')
    ) {
      const customer = await stripe.customers.list(
        {
          email: identifier,
          limit: 1
        },
        {
          stripeAccount: companyData?.data?.stripe_id
        }
      );

      if (customer?.data?.length) {
        await stripe.customers.update(
          customer?.data[0]?.id,
          { metadata: { reflio_referral_id: referralData?.data?.referral_id } },
          { stripeAccount: companyData?.data?.stripe_id }
        );
      }
    }

    return referralData?.data;
  }

  return 'error';
};

export const getReferralFromId = async (referralId, companyId) => {
  let referralData = await supabaseAdmin
    .from('referrals')
    .select(
      `
        *,
        campaign:campaign_id (campaign_name)
      `
    )
    .eq('referral_id', referralId)
    .eq('company_id', companyId)
    .single();

  if (referralData?.data) {
    let expiryDate = new Date(referralData?.data?.referral_expiry);
    expiryDate = expiryDate.toUTCString();

    return {
      campaign_id: referralData?.data?.campaign_id,
      cookie_date: expiryDate,
      campaign_name: referralData?.data?.campaign?.campaign_name,
      affiliate_id: referralData?.data?.affiliate_id,
      referral_id: referralData?.data?.referral_id
    };
  }

  return 'error';
};

export const referralCreate = async (
  user,
  companyId,
  campaignId,
  affiliateId,
  emailAddress,
  stripeAccountId,
  paymentIntentId
) => {
  if (!user || !companyId || !campaignId || !emailAddress) return 'error';

  const details = {
    affiliate_id: affiliateId,
    campaign_id: campaignId,
    referral_reference_email: emailAddress
  };

  const referral = await createReferral(details);

  if (referral !== 'error') {
    if (stripeAccountId && paymentIntentId) {
      //Check if paymentIntent exists
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        { stripeAccount: stripeAccountId }
      );

      if (paymentIntent?.id) {
        const commission = await createCommission(
          paymentIntent,
          stripeAccountId,
          referral?.referral_id
        );

        if (commission === 'success') {
          return 'commission_success';
        }
      }
    }

    return 'referral_success';
  }

  return 'error';
};

export const billingUsageDetails = async (teamId) => {
  try {
    let companyData = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    let campaignData = await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    let affiliateData = await supabaseAdmin
      .from('affiliates')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    let referralData = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    let commissionData = await supabaseAdmin
      .from('commissions')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    return {
      companies: companyData?.count,
      campaigns: campaignData?.count,
      affiliates: affiliateData?.count,
      referrals: referralData?.count,
      commissions: commissionData?.count
    };
  } catch (error) {
    console.warn(error);
    return 'error';
  }
};

export const billingGenerateInvoice = async (user, currency, commissions) => {
  if (!user || !commissions) return 'error';

  if (commissions?.data?.length > 50) {
    return 'above_50';
  }

  const customer = await createOrRetrieveCustomer({
    id: user?.id,
    teamId: user?.team_id,
    email: user?.email
  });

  let existingInvoicesList = [];
  const existingInvoices = await stripe.invoices.list({
    limit: 20,
    status: 'open',
    collection_method: 'send_invoice'
  });

  if (existingInvoices?.data?.length) {
    existingInvoices?.data?.map((invoice) => {
      if (
        invoice?.metadata?.invoice_type &&
        invoice?.metadata?.invoice_type === 'reflio_fees'
      ) {
        existingInvoicesList.push(invoice?.id);
      }
    });
  }

  if (existingInvoicesList?.length) {
    await Promise.all(
      existingInvoicesList?.map(async (invoice) => {
        await stripe.invoices.voidInvoice(invoice);
      })
    );
  }

  const commissionItemsPromise = await Promise.all(
    commissions?.data?.map(async (commission, index) => {
      let commissionAmount = (
        (9 / 100) *
        commission?.commission_sale_value
      ).toFixed(0);

      await stripe.invoiceItems.create({
        customer: customer,
        amount: parseInt(commissionAmount),
        description: `Reflio 9% commission payment for referral ID ${commission?.referral_id}.`,
        currency: currency ?? 'USD',
        metadata: { commission_id: String(commission?.commission_id) }
      });
    })
  );

  if (commissionItemsPromise?.length === commissions?.data?.length) {
    const createInvoice = await stripe.invoices.create({
      customer: customer,
      collection_method: 'send_invoice',
      days_until_due: 0,
      description: `Reflio fee invoice for ${commissions?.data?.length} commissions`,
      metadata: { timestamp: String(Date.now()), invoice_type: 'reflio_fees' }
    });
    if (!createInvoice?.id) return 'error';
    const finalizeInvoice = await stripe.invoices.finalizeInvoice(
      createInvoice?.id
    );
    if (finalizeInvoice?.hosted_invoice_url) {
      return {
        invoice_url: finalizeInvoice?.hosted_invoice_url
      };
    }
  }

  return 'error';
};

export const invoicePaidCheck = async (invoice) => {
  if (
    !invoice?.metadata?.invoice_type &&
    !invoice?.metadata?.invoice_type === 'reflio_fees'
  )
    return false;

  if (invoice?.lines?.data?.length) {
    await Promise.all(
      invoice?.lines?.data?.map(async (item) => {
        if (item?.metadata?.commission_id) {
          await supabaseAdmin
            .from('commissions')
            .update({
              reflio_commission_paid: true
            })
            .eq('commission_id', item?.metadata?.commission_id);
        }
      })
    );
  }

  return true;
};

export const manualCommissionCreate = async (
  referralReference,
  commissionInfo
) => {
  if (!referralReference) {
    return 'param_not_found_error';
  }

  //Check if referral is valid in DB
  let referralFromId = await supabaseAdmin
    .from('referrals')
    .select('*')
    .eq('referral_reference_email', referralReference)
    .order('created', { ascending: false });

  //If referral is not found, return error
  if (referralFromId?.data === null) {
    return 'referral_not_found_error';
  }

  //Only use first item in array
  if (referralFromId?.data?.length) {
    referralFromId = referralFromId?.data[0];
  }

  let continueProcess = true;

  //Check if there is an earlier commission with the same referral ID... if so, check if payment limit has been reached
  let earliestCommission = await supabaseAdmin
    .from('commissions')
    .select('created')
    .eq('referral_id', referralFromId?.referral_id)
    .order('created', { ascending: true })
    .limit(1);

  if (earliestCommission?.data !== null) {
    let commissionFound = earliestCommission?.data[0];

    //Checks if commission period has passed (months)
    if (commissionFound?.created) {
      let dateToday = new Date();
      let earliestCommissionDate = new Date(commissionFound?.created);
      let monthsBetween = monthsBetweenDates(dateToday, earliestCommissionDate);

      if (referralFromId?.commission_period < monthsBetween) {
        continueProcess = false;
      }
    }
  }

  //If commission period is not over, continue
  if (continueProcess === true) {
    if (commissionInfo?.commission_sale_value) {
      let invoiceTotal = commissionInfo?.commission_sale_value;
      let dueDate = new Date();
      if (referralFromId?.minimum_days_payout) {
        dueDate.setDate(
          dueDate.getDate() + referralFromId?.minimum_days_payout
        );
      } else {
        dueDate.setDate(dueDate.getDate() + 30);
      }
      let dueDateIso = dueDate.toISOString();
      let commissionAmount =
        invoiceTotal > 0
          ? referralFromId?.commission_type === 'fixed'
            ? (referralFromId?.commission_value * 100).toFixed(0)
            : parseInt(
                ((parseFloat(invoiceTotal / 100) *
                  parseFloat(referralFromId?.commission_value)) /
                  100) *
                  100
              )
          : 0;

      let newCommissionValues = await supabaseAdmin.from('commissions').insert({
        id: referralFromId?.id,
        team_id: referralFromId?.team_id,
        company_id: referralFromId?.company_id,
        campaign_id: referralFromId?.campaign_id,
        affiliate_id: referralFromId?.affiliate_id,
        referral_id: referralFromId?.referral_id,
        payment_intent_id: null,
        commission_sale_value: invoiceTotal,
        commission_total: commissionAmount,
        commission_due_date: dueDateIso,
        commission_description: commissionInfo?.line_items ?? null
      });

      if (newCommissionValues?.data) {
        await supabaseAdmin
          .from('referrals')
          .update({
            referral_converted: true
          })
          .eq('referral_id', referralFromId?.referral_id);

        return {
          commission_id: newCommissionValues?.data[0]?.commission_id,
          referral_id: newCommissionValues?.data[0]?.referral_id,
          affiliate_id: newCommissionValues?.data[0]?.affiliate_id,
          commission_sale_value:
            newCommissionValues?.data[0]?.commission_sale_value,
          commission_total: newCommissionValues?.data[0]?.commission_total,
          commission_due_date: newCommissionValues?.data[0]?.commission_due_date
        };
      } else {
        return 'commission_create_error';
      }
    }

    return 'error';
  }
};
