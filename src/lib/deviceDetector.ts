export interface ParsedDeviceInfo {
  icone: string;
  tipo: 'computador' | 'celular' | 'tablet' | 'outro';
  aparelho: string;
  sistema: string;
  navegador: string;
  descricaoCompleta: string;
}

export function parseUserAgent(ua?: string | null): ParsedDeviceInfo {
  if (!ua || ua === 'desconhecido' || ua === 'Navegador Web') {
    return {
      icone: '🌐',
      tipo: 'outro',
      aparelho: 'Dispositivo Web',
      sistema: 'Sistema Indefinido',
      navegador: 'Navegador Web',
      descricaoCompleta: 'Navegador Web (Dispositivo não identificado)'
    };
  }

  // 1. Detectar Navegador
  let navegador = 'Navegador Web';
  if (/edg\//i.test(ua)) {
    navegador = 'Microsoft Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    navegador = 'Opera';
  } else if (/samsungbrowser/i.test(ua)) {
    navegador = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) {
    navegador = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    navegador = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    navegador = 'Apple Safari';
  }

  // 2. Detectar Tipo, Aparelho e Sistema Operacional
  let tipo: 'computador' | 'celular' | 'tablet' | 'outro' = 'computador';
  let aparelho = 'Computador PC';
  let sistema = 'Windows';
  let icone = '💻';

  if (/iphone/i.test(ua)) {
    tipo = 'celular';
    icone = '📱';
    aparelho = 'Apple iPhone';
    sistema = 'iOS';
    const match = ua.match(/os\s([0-9_]+)/i);
    if (match) sistema += ' ' + match[1].replace(/_/g, '.');
  } else if (/ipad/i.test(ua)) {
    tipo = 'tablet';
    icone = '📱';
    aparelho = 'Apple iPad';
    sistema = 'iPadOS';
  } else if (/android/i.test(ua)) {
    const isTablet = /tablet/i.test(ua) || !/mobile/i.test(ua);
    tipo = isTablet ? 'tablet' : 'celular';
    icone = isTablet ? '📱' : '📱';
    aparelho = isTablet ? 'Tablet Android' : 'Celular Android';
    sistema = 'Android';
    const match = ua.match(/android\s([0-9\.]+)/i);
    if (match) sistema += ' ' + match[1];
  } else if (/macintosh|mac os x/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'MacBook / Mac';
    sistema = 'macOS Apple';
  } else if (/windows nt 10\.0/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'Computador PC / Notebook';
    sistema = 'Windows 10 / 11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'Computador PC';
    sistema = 'Windows 8.1';
  } else if (/windows nt 6\.1/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'Computador PC';
    sistema = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'Computador PC';
    sistema = 'Windows';
  } else if (/linux/i.test(ua)) {
    tipo = 'computador';
    icone = '💻';
    aparelho = 'Computador Linux';
    sistema = 'Linux';
  }

  // Bits
  if (/x64|win64|wow64|x86_64/i.test(ua) && tipo === 'computador') {
    sistema += ' (64-bit)';
  }

  return {
    icone,
    tipo,
    aparelho,
    sistema,
    navegador,
    descricaoCompleta: `${aparelho} (${sistema}) • ${navegador}`
  };
}

export function formatOrigem(origem?: string | null) {
  switch (origem?.toUpperCase()) {
    case 'PERFIL_TOP':
      return {
        label: 'Botão do Topo (Destaque)',
        badge: 'Topo do Perfil',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dotColor: 'bg-emerald-500',
        descricao: 'Tutor clicou no botão verde principal de agendamento no topo do perfil público.'
      };
    case 'CARD_BUSCA':
      return {
        label: 'Card na Lista de Busca',
        badge: 'Busca Geral',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        dotColor: 'bg-blue-500',
        descricao: 'Tutor clicou no botão de WhatsApp diretamente no card da página de busca.'
      };
    case 'MAPA_POPUP':
      return {
        label: 'Alfinete do Mapa Interativo',
        badge: 'Mapa Interativo',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dotColor: 'bg-amber-500',
        descricao: 'Tutor clicou na localização do mapa interativo da cidade.'
      };
    case 'PERFIL':
    default:
      return {
        label: 'Página do Perfil',
        badge: 'Perfil Público',
        color: 'text-slate-700 bg-slate-50 border-slate-200',
        dotColor: 'bg-slate-500',
        descricao: 'Tutor navegou pelo perfil completo e acionou o WhatsApp.'
      };
  }
}
