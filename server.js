const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Resend-Client
const resend = new Resend(process.env.RESEND_API_KEY);

// Kontaktformular
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // 🔐 Basic Check für Email
  if (!email || !email.includes('@')) {
    console.error('❌ Ungültige E-Mail-Adresse:', email);
    return res.status(400).json({ success: false, error: 'Ungültige E-Mail-Adresse' });
  }

  try {
    // 📩 1. Mail an dich
    await resend.emails.send({
      from: 'kontakt@sjs-webdesign.de',
      to: 'steffenjoachim.schanze@gmail.com',
      subject: 'Neue Kontaktanfrage',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Nachricht:</strong> ${message}</p>
      `,
    });

    // ✅ 2. Mail an Nutzer (Bestätigung)
    await resend.emails.send({
      from: 'kontakt@sjs-webdesign.de',
      to: email, // ← Hier wird die E-Mail aus dem Formular verwendet
      subject: 'Kontaktformular: Bestätigungsmail',
      html: `
        <p>Hallo ${name},</p>
        <p>vielen Dank für Deine Nachricht. Wir melden uns so bald wie möglich bei Dir.</p>
        <p>Beste Grüße<br>SJS-Webdesign<br>Steffen Schanze</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.listen(port, () => {
  console.log(`✅ Server läuft auf http://localhost:${port}`);
});
