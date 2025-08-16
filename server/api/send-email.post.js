// ~/server/api/send-email.post.js
import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (
    !body.name ||
    !body.phone ||
    !body.email ||
    !body.startDate ||
    !body.endDate ||
    !body.totalPrice
  ) {
    return {
      success: false,
      error: "Puuttuvat tiedot. Sähköpostia ei lähetetty.",
    };
  }

  const resend = new Resend(process.env.NUXT_RESEND_API_KEY);

  // Sähköposti varauksen omistajalle
  const mailToYou = {
    from: "onboarding@resend.dev",
    to: "miska9657@gmail.com", // VAIHDA TÄMÄ OMAAN OSOITTEESEESI!
    subject: `Uusi varaus teltalle: ${body.name}`,
    html: `
      <h2>Uusi varaus!</h2>
      <p>Hei,</p>
      <p>Teltalle on tehty uusi varaus:</p>
      <ul>
        <li><strong>Varaajan nimi:</strong> ${body.name}</li>
        <li><strong>Puhelinnumero:</strong> ${body.phone}</li>
        <li><strong>Sähköposti:</strong> ${body.email}</li>
        <li><strong>Varauksen kesto:</strong> ${body.startDate} - ${body.endDate}</li>
        <li><strong>Kokonaishinta:</strong> ${body.totalPrice}€</li>
      </ul>
      <p>Ota yhteyttä asiakkaaseen sopiaksesi noudosta ja maksusta.</p>
    `,
  };

  // // Sähköposti asiakkaalle
  // const mailToCustomer = {
  //   from: "onboarding@resend.dev",
  //   to: body.email,
  //   subject: "Varausvahvistus - Ruotsin armeijan puolijoukkueteltta",
  //   html: `
  //     <h2>Hei, ${body.name}!</h2>
  //     <p>Kiitos varauksestasi! Se on vahvistettu ajalle **${body.startDate} - ${body.endDate}**.</p>
  //     <p>Kokonaishinta: ${body.totalPrice}€.</p>
  //     <p>Ota yhteyttä numeroon +358 40 193 7715 sopiaksesi teltan noudosta ja maksusta. Jos herää kysymyksiä niin voitte soittaa numeroon **${body.phone}**.</p>
  //     <p>Kiitos!</p>
  //   `,
  // };

  try {
    await resend.emails.send(mailToYou);
    return { success: true, message: "Vahvistusviestit lähetetty." };
  } catch (error) {
    console.error("Sähköpostin lähetysvirhe:", error);
    return { success: false, error: "Sähköpostien lähetys epäonnistui." };
  }
});
