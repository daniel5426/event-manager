import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvitationEmail(
  email: string,
  name: string,
  eventName: string,
  eventDate: Date,
  nid: number
) {
  // Generate QR code
  const qrData = nid.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 2,
  });
  const qrCodeBuffer = await QRCode.toBuffer(qrData, {
    width: 200,
    margin: 2,
  });
  
  // Create email HTML
  const emailHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif;">
      <h2>הזמנה לאירוע</h2>
      <p>שלום ${name},</p>
      <p>הנך מוזמן/ת לאירוע ${eventName} שיתקיים בתאריך ${eventDate}</p>
      <p>מצורף קוד QR לכניסה לאירוע:</p>
      <!-- ... other HTML ... -->
      <img src="cid:qr-code" alt="QR Code" style="width: 200px; height: 200px;"/>
      <!-- ... other HTML ... -->
      <p>נשמח לראותך!</p>
    </div>
  `;
  console.log(emailHtml);

  // Send email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `הזמנה לאירוע ${eventName}`,
    html: emailHtml,
    attachments: [{
      filename: 'qr-code.png',
      content: qrCodeBuffer,
      contentType: 'image/png',
      contentDisposition: 'inline',
      cid: 'qr-code'
    }],
  });
} 