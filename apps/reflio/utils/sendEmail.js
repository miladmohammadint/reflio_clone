import emailBuilderServer from './email-builder-server';

export const sendEmail = async (logoUrl, subject, content, to, type, settings, campaignId, companyHandle) => {
  const SibApiV3Sdk = require('sib-api-v3-sdk');
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.SIB_API_KEY;
  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  const emailHtml = emailBuilderServer(type, logoUrl, subject, content, settings, campaignId, companyHandle);
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = emailHtml;
  sendSmtpEmail.sender = {"name": settings, "email":"affiliate@reflio.com"};
  sendSmtpEmail.to = [{"email": to}];

  if(type === 'invite'){    
    sendSmtpEmail.params = {"parameter":"AffiliateInvite","subject":"AffiliateInvite"};
  }
  
  await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('running email')
    return "success";
  }, function(error) {
    console.log(error);
    return "error";
  });

  return "success";
};