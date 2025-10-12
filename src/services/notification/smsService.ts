
// Optional Twilio SMS abstraction
import Twilio from 'twilio';

let twilioClient: Twilio.Twilio | null = null;

function getClient() {
  if (twilioClient) return twilioClient;
  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
    throw new Error('Twilio credentials missing');
  }
  twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  return twilioClient;
}

export async function sendSms(to: string, body: string) {
  const client = getClient();
  return client.messages.create({
    to,
    body,
    from: process.env.TWILIO_FROM
  });
}