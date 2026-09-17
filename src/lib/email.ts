/**
 * Serviço de Envio de E-mails Transacionais do VetBra
 * Suporta Resend API e fallback de desenvolvimento.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'VetBra <nao-responda@vetbra.com.br>';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia um e-mail transacional via Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL DEV MOCK] Para: ${to} | Assunto: "${subject}"`);
    return { success: true, id: `mock-${Date.now()}`, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Erro Resend API:', data);
      throw new Error(`Falha no envio do e-mail: ${JSON.stringify(data)}`);
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Erro ao enviar e-mail transacional:', error);
    return { success: false, error };
  }
}

/**
 * E-mail de Recuperação de Senha com Código de 6 dígitos
 */
export async function sendPasswordResetEmail({
  to,
  nome,
  codigo,
}: {
  to: string;
  nome: string;
  codigo: string;
}) {
  const subject = `Código de Segurança: ${codigo} - VetBra`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #147A44; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">VetBra</h1>
        <p style="color: #A7F3D0; margin: 4px 0 0 0; font-size: 13px;">Portal & SaaS Veterinário do Brasil</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Olá, ${nome}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Recebemos uma solicitação de redefinição de senha para a sua conta profissional no portal VetBra.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <span style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 14px 28px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #147A44;">
            ${codigo}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          Este código expira em <strong>15 minutos</strong>. Se você não solicitou a alteração da sua senha, desconsidere este e-mail.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} VetBra Tecnologia Veterinária Ltda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html, text: `Seu código de redefinição de senha no VetBra é: ${codigo}` });
}

/**
 * E-mail de Alerta de 30 Dias antes do Vencimento do CRMV
 */
export async function sendCrmvRenewalWarningEmail({
  to,
  nome,
  crmvNumero,
  crmvUf,
  validade,
}: {
  to: string;
  nome: string;
  crmvNumero: string;
  crmvUf: string;
  validade: Date;
}) {
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(validade);
  const subject = `⚠️ Atenção: Sua Carteira CRMV-${crmvUf} vence em breve - VetBra`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #b45309; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">VetBra</h1>
        <p style="color: #fde68a; margin: 4px 0 0 0; font-size: 13px;">Alerta de Auditoria & Conformidade Regulatória</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Dr(a). ${nome},</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Identificamos no nosso controle de conformidade que o seu registro <strong>CRMV ${crmvNumero}/${crmvUf}</strong> possui data de validade prevista para:
        </p>
        <div style="margin: 20px 0; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; text-align: center;">
          <span style="font-size: 16px; font-weight: bold; color: #b45309;">
            Data de Validade: ${dataFormatada}
          </span>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Para garantir que o seu perfil continue com o <strong>Selo de Verificado</strong> e ativo nas buscas por tutores no mapa, recomendamos solicitar a renovação junto ao seu CRMV regional.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Assim que emitir o novo comprovante ou carteira atualizada, acesse o seu painel do VetBra e envie a foto da renovação.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="https://vetbra.com.br/dashboard" style="display: inline-block; background-color: #147A44; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Acessar Meu Painel Profissional
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} VetBra Tecnologia Veterinária Ltda.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * E-mail de Boas-vindas e Confirmação de Assinatura Ativa
 */
export async function sendPaymentConfirmedEmail({
  to,
  nome,
  planoNome,
  valor,
  proximoVencimento,
}: {
  to: string;
  nome: string;
  planoNome: string;
  valor: number;
  proximoVencimento: Date;
}) {
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(proximoVencimento);
  const subject = `🎉 Pagamento Confirmado! Seu ${planoNome} está ativo - VetBra`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #147A44; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">VetBra</h1>
        <p style="color: #A7F3D0; margin: 4px 0 0 0; font-size: 13px;">Confirmação de Pagamento & Ativação de Plano</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Parabéns, Dr(a). ${nome}!</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Confirmamos o recebimento do pagamento da sua assinatura no portal VetBra. Seu perfil já está com destaque ativo e disponível para tutores em todo o mapa da sua região.
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10px; padding: 18px; margin: 24px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #166534; font-size: 13px;">Plano Ativo:</span>
            <strong style="color: #14532d; font-size: 14px;">${planoNome}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #166534; font-size: 13px;">Valor Liquidado:</span>
            <strong style="color: #14532d; font-size: 14px;">R$ ${valor.toFixed(2).replace('.', ',')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #166534; font-size: 13px;">Próxima Renovação:</span>
            <strong style="color: #14532d; font-size: 14px;">${dataFormatada}</strong>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://vetbra.com.br/dashboard" style="display: inline-block; background-color: #147A44; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Ir para o Meu Dashboard
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} VetBra Tecnologia Veterinária Ltda.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}
