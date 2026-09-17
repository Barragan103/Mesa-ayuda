// backend/src/utils/mail.ts
import SendGrid from '@sendgrid/mail';
SendGrid.setApiKey(process.env.SENDGRID_API_KEY!);

export interface HelpRequestData {
  id: number;
  nombre: string;
  apellido: string;
  area: string;
}

export async function sendHelpRequestNotification(data: HelpRequestData) {
  // 1) destinatarios: sólo admins
  const to = process.env.ADMIN_EMAILS!
    .split(',')
    .map(e => e.trim());

  // 2) asunto y contenido
  const subject = `Nueva solicitud de ayuda #${data.id}`;
  const html = `
    <p>🔔 Se ha creado la solicitud <strong>#${data.id}</strong> de 
       <strong>${data.nombre} ${data.apellido}</strong></p>
    <p><strong>Área:</strong> ${data.area}</p>
    <p>Accede al panel de administración para verla en detalle.</p>
  `;

  // 3) disparar envío
  await SendGrid.send({
    to,
    from: {
      email: process.env.EMAIL_FROM!,
      name:  process.env.EMAIL_FROM_NAME,
    },
    subject,
    html,
  });
}
