import { Resend } from "resend";

const resend = new Resend(process.env.NUXT_RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    return { success: false, error: "Method not allowed" };
  }

  try {
    const body = await readBody(event);
    const { name, email, phone, startDate, endDate, totalPrice } = body;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "miska9657@gmail.com",
      subject: `Uusi varaus: ${name}`,
      html: `
        <p>Varauksen tiedot:</p>
        <ul>
          <li>Nimi: ${name}</li>
          <li>Sähköposti: ${email}</li>
          <li>Puhelin: ${phone}</li>
          <li>Alkaa: ${startDate}</li>
          <li>Päättyy: ${endDate}</li>
          <li>Hinta: ${totalPrice}€</li>
        </ul>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});
