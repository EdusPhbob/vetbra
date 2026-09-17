/**
 * Cliente de Integração com a API do Asaas (v3)
 * Suporta Pix Dinâmico e Boleto Bancário com baixa automática.
 * Documentação: https://docs.asaas.com/reference/
 */

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox'; // 'sandbox' ou 'production'

const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3';

export interface CustomerParams {
  name: string;
  email: string;
  cpfCnpj?: string | null;
  phone?: string | null;
}

export interface CreatePaymentParams {
  customerId: string;
  billingType: 'PIX' | 'BOLETO';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference: string; // ID ou Número da Fatura VetBra
}

export interface PaymentResult {
  id: string;
  status: string;
  billingType: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixCopiaCola?: string;
  pixQrCodeUrl?: string;
  boletoCodigoBarras?: string;
  boletoLinhaDigitavel?: string;
  boletoPdfUrl?: string;
}

const headers = {
  'Content-Type': 'application/json',
  access_token: ASAAS_API_KEY || '',
};

/**
 * Cria ou busca um cliente existente no Asaas
 */
export async function getOrCreateAsaasCustomer(params: CustomerParams): Promise<string> {
  if (!ASAAS_API_KEY) {
    // Modo simulação / desenvolvimento sem chave de API
    return `cus_mock_${Date.now()}`;
  }

  try {
    // 1. Busca por e-mail ou CPF
    const searchUrl = `${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(params.email)}`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }

    // 2. Cria novo cliente
    const createRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        cpfCnpj: params.cpfCnpj ? params.cpfCnpj.replace(/\D/g, '') : undefined,
        mobilePhone: params.phone ? params.phone.replace(/\D/g, '') : undefined,
      }),
    });

    const createData = await createRes.json();
    if (createData.errors) {
      throw new Error(`Erro Asaas Customer: ${JSON.stringify(createData.errors)}`);
    }

    return createData.id;
  } catch (error) {
    console.error('Erro ao integrar cliente Asaas:', error);
    throw error;
  }
}

/**
 * Cria uma cobrança (Pix ou Boleto) no Asaas
 */
export async function createAsaasPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  if (!ASAAS_API_KEY) {
    // Retorno simulado realista para testes locais e desenvolvimento
    const isPix = params.billingType === 'PIX';
    return {
      id: `pay_mock_${Date.now()}`,
      status: 'PENDING',
      billingType: params.billingType,
      value: params.value,
      dueDate: params.dueDate,
      pixCopiaCola: isPix ? `00020126580014br.gov.bcb.pix0136${params.externalReference}520400005303986540${params.value.toFixed(2)}5802BR5925VETBRA SAAS TECNOLOGIA6009SAO PAULO62070503***6304` : undefined,
      pixQrCodeUrl: isPix ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=vetbra-mock-pix-${params.externalReference}` : undefined,
      boletoCodigoBarras: !isPix ? '34191790010104351004791020150008489000000' + Math.floor(params.value * 100) : undefined,
      boletoLinhaDigitavel: !isPix ? '34191.79001 01043.510047 91020.150008 4 89000000' : undefined,
      boletoPdfUrl: !isPix ? `https://sandbox.asaas.com/b/pdf/mock-${params.externalReference}` : undefined,
    };
  }

  try {
    const res = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: params.customerId,
        billingType: params.billingType,
        value: params.value,
        dueDate: params.dueDate,
        description: params.description,
        externalReference: params.externalReference,
        postalService: false,
      }),
    });

    const payment = await res.json();
    if (payment.errors) {
      throw new Error(`Erro ao criar cobrança Asaas: ${JSON.stringify(payment.errors)}`);
    }

    const result: PaymentResult = {
      id: payment.id,
      status: payment.status,
      billingType: payment.billingType,
      value: payment.value,
      dueDate: payment.dueDate,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
    };

    // Se for Pix, busca imediatamente os dados do QR Code Pix
    if (params.billingType === 'PIX') {
      const pixRes = await fetch(`${ASAAS_BASE_URL}/payments/${payment.id}/pixQrCode`, { headers });
      const pixData = await pixRes.json();
      if (pixData.payload) {
        result.pixCopiaCola = pixData.payload;
        result.pixQrCodeUrl = pixData.encodedImage
          ? `data:image/png;base64,${pixData.encodedImage}`
          : undefined;
      }
    }

    // Se for Boleto, extrai os códigos de barra
    if (params.billingType === 'BOLETO') {
      const codeRes = await fetch(`${ASAAS_BASE_URL}/payments/${payment.id}/identificationField`, { headers });
      const codeData = await codeRes.json();
      if (codeData.identificationField) {
        result.boletoLinhaDigitavel = codeData.identificationField;
        result.boletoCodigoBarras = codeData.barCode;
        result.boletoPdfUrl = payment.bankSlipUrl;
      }
    }

    return result;
  } catch (error) {
    console.error('Erro na criação de cobrança Asaas:', error);
    throw error;
  }
}

/**
 * Consulta o status atualizado de uma cobrança no Asaas (usado para Conciliação Diária)
 */
export async function checkAsaasPaymentStatus(paymentId: string): Promise<{
  id: string;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED';
  value: number;
  paymentDate?: string;
} | null> {
  if (!ASAAS_API_KEY || paymentId.startsWith('pay_mock_')) {
    return null;
  }

  try {
    const res = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      value: data.value,
      paymentDate: data.paymentDate || data.clientPaymentDate,
    };
  } catch (error) {
    console.error(`Erro ao consultar status da cobrança ${paymentId} no Asaas:`, error);
    return null;
  }
}
