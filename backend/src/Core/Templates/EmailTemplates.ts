import { ShipmentNotificationMessage } from '../DTOs/Notifications';

const STATUS_ACCENT_COLOR: Record<string, string> = {
  'Entregado a servicio delivery': '#2563eb',
  'Entregado al cliente final': '#16a34a',
};

const DEFAULT_ACCENT_COLOR = '#1f2937';

export function buildShipmentStatusEmailSubject(data: ShipmentNotificationMessage): string {
  return `shopCart - Actualizacion de tu pedido ${data.invoiceNumber}`;
}

export function buildShipmentStatusEmailHtml(data: ShipmentNotificationMessage): string {
  const accentColor = STATUS_ACCENT_COLOR[data.statusName] ?? DEFAULT_ACCENT_COLOR;

  const guideRow = data.shippmentGuide
    ? `<tr>
         <td style="padding:12px 0 0;color:#6b7280;font-size:14px;">Guia de envio</td>
         <td style="padding:12px 0 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${data.shippmentGuide}</td>
       </tr>`
    : '';

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color:${accentColor};padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">shopCart</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Hola ${data.toName},</p>
                <h1 style="margin:0 0 16px;color:#111827;font-size:20px;line-height:1.3;">Tu pedido tiene una actualizacion</h1>
                <span style="display:inline-block;background-color:${accentColor};color:#ffffff;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:20px;">
                  ${data.statusName}
                </span>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;margin-top:16px;">
                  <tr>
                    <td style="padding:16px 0 0;color:#6b7280;font-size:14px;">Numero de factura</td>
                    <td style="padding:16px 0 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${data.invoiceNumber}</td>
                  </tr>
                  ${guideRow}
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb;padding:20px 32px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">Este es un correo automatico, por favor no respondas a este mensaje.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
