'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCards from '@/components/PricingCards';
import { 
  ShieldCheck, 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Loader2, 
  Upload, 
  Camera, 
  Car, 
  MapPin, 
  Clock, 
  Info, 
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  Building2,
  Phone,
  FileCheck,
  Sparkles
} from 'lucide-react';

const ESTADOS_BRASIL = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

const CIDADES_POR_UF: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'São José dos Campos', 'Piracicaba'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'São Gonçalo', 'Petrópolis', 'Campos dos Goytacazes', 'Volta Redonda'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Passo Fundo'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Balneário Camboriú'],
  DF: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras', 'Guará', 'Sobradinho'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Ilhéus', 'Lauro de Freitas'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista']
};

function CadastroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoInicial = (searchParams.get('plano') || 'profissional').toUpperCase();

  const [etapa, setEtapa] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [cepConsultando, setCepConsultando] = useState(false);
  const [cep2Consultando, setCep2Consultando] = useState(false);

  // Formulário Completo
  const [form, setForm] = useState({
    // Etapa 1: Dados Pessoais & Acesso
    nomeCompleto: '',
    email: '',
    login: '',
    senha: '',
    confirmarSenha: '',
    whatsapp: '',
    fotoPerfilUrl: '',
    
    // Etapa 2: CRMV & Anti-Fraude
    crmvNumero: '',
    crmvUf: 'SP',
    crmvValidade: '',
    crmvDocumentoUrl: '',
    crmvSelfieUrl: '',

    // Etapa 3: Estabelecimento & Atendimento
    nomeClinica: '',
    tipoEstabelecimento: 'Clínica Veterinária Fixa',
    tiposEstabelecimento: ['Clínica Veterinária Fixa'],
    meiosTransporte: ['Carro / PetMóvel'],
    permiteVetMovelApp: true,
    raioAtendimentoKm: 15,
    cidadeBase: 'São Paulo',
    estadoBase: 'SP',
    atende24h: false,
    atendeDomiciliar: true,

    // Endereço 1 (Base Principal)
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'São Paulo',
    estado: 'SP',
    latitude: null as number | null,
    longitude: null as number | null,

    // Endereço 2 (Opcional - Filial/Apoio)
    temSegundoEndereco: false,
    segundoEndereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'São Paulo',
      estado: 'SP',
      latitude: null as number | null,
      longitude: null as number | null,
      raioKmAtendimento: 15
    },

    // Etapa 4: Plano
    plano: ['BASICO', 'PROFISSIONAL', 'PREMIUM'].includes(planoInicial) ? planoInicial : 'PROFISSIONAL'
  });

  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Manipulação de inputs de texto/select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manipulação dos tipos de estabelecimento (múltipla escolha / checkbox)
  const handleTipoEstabelecimentoToggle = (tipo: string) => {
    setForm(prev => {
      const existe = prev.tiposEstabelecimento.includes(tipo);
      let atualizados: string[];
      if (existe) {
        atualizados = prev.tiposEstabelecimento.filter(t => t !== tipo);
      } else {
        atualizados = [...prev.tiposEstabelecimento, tipo];
      }
      return {
        ...prev,
        tiposEstabelecimento: atualizados,
        tipoEstabelecimento: atualizados.join(', '),
        atende24h: atualizados.includes('Hospital Veterinário 24h') ? true : prev.atende24h,
        atendeDomiciliar: atualizados.includes('Atendimento Domiciliar / VetMóvel') ? true : prev.atendeDomiciliar
      };
    });
  };

  // Manipulação dos meios de transporte (múltipla escolha)
  const handleTransportToggle = (transporte: string) => {
    setForm(prev => {
      const existe = prev.meiosTransporte.includes(transporte);
      let atualizados: string[];
      if (existe) {
        atualizados = prev.meiosTransporte.filter(t => t !== transporte);
      } else {
        atualizados = [...prev.meiosTransporte, transporte];
      }
      return { ...prev, meiosTransporte: atualizados };
    });
  };

  // Consulta automática de CEP 1 via ViaCEP
  const handleCepLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepConsultando(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
            cidadeBase: data.localidade || prev.cidadeBase,
            estadoBase: data.uf || prev.estadoBase
          }));
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setCepConsultando(false);
      }
    }
  };

  // Consulta automática de CEP 2
  const handleCep2Lookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCep2Consultando(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            segundoEndereco: {
              ...prev.segundoEndereco,
              logradouro: data.logradouro || prev.segundoEndereco.logradouro,
              bairro: data.bairro || prev.segundoEndereco.bairro,
              cidade: data.localidade || prev.segundoEndereco.cidade,
              estado: data.uf || prev.segundoEndereco.estado
            }
          }));
        }
      } catch (err) {
        console.error('Erro ao consultar CEP 2:', err);
      } finally {
        setCep2Consultando(false);
      }
    }
  };

  // Upload de arquivos (CRMV, Selfie e Perfil)
  const handleFileUpload = async (file: File, fieldName: 'fotoPerfilUrl' | 'crmvDocumentoUrl' | 'crmvSelfieUrl') => {
    setUploadingField(fieldName);
    setErroMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', fieldName === 'fotoPerfilUrl' ? 'perfis' : 'crmv');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setForm(prev => ({ ...prev, [fieldName]: data.url }));
      } else {
        setErroMsg(data.error || 'Erro no upload da imagem.');
      }
    } catch (err) {
      console.error(err);
      setErroMsg('Erro de conexão ao enviar imagem.');
    } finally {
      setUploadingField(null);
    }
  };

  // Validação por Etapa
  const avancarEtapa = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg(null);

    if (etapa === 1) {
      if (!form.nomeCompleto || !form.email || !form.senha || !form.whatsapp) {
        setErroMsg('Preencha todos os campos obrigatórios da Etapa 1.');
        return;
      }
      if (form.senha.length < 6) {
        setErroMsg('A senha deve ter no mínimo 6 caracteres para segurança do seu SaaS.');
        return;
      }
      if (form.senha !== form.confirmarSenha) {
        setErroMsg('As senhas digitadas não coincidem.');
        return;
      }
      if (!form.fotoPerfilUrl) {
        setErroMsg('A foto de perfil profissional é obrigatória para gerar confiança aos tutores.');
        return;
      }
      setEtapa(2);
    } else if (etapa === 2) {
      if (!form.crmvNumero || !form.crmvUf) {
        setErroMsg('Número e Estado do CRMV são obrigatórios.');
        return;
      }
      if (!form.crmvValidade) {
        setErroMsg('Informe a data de validade da sua carteira profissional CRMV.');
        return;
      }
      if (!form.crmvDocumentoUrl) {
        setErroMsg('O envio da foto da carteira profissional CRMV é obrigatório.');
        return;
      }
      if (!form.crmvSelfieUrl) {
        setErroMsg('O envio da selfie segurando o documento é obrigatório para validação anti-fraude.');
        return;
      }
      setEtapa(3);
    } else if (etapa === 3) {
      if (!form.tiposEstabelecimento || form.tiposEstabelecimento.length === 0) {
        setErroMsg('Selecione ao menos um Tipo de Estabelecimento para continuar.');
        return;
      }
      if (form.meiosTransporte.length === 0) {
        setErroMsg('Assinale pelo menos 1 Meio de Transporte / Deslocamento.');
        return;
      }
      if (!form.cep || !form.numero) {
        setErroMsg('O CEP e o Número do endereço base são obrigatórios.');
        return;
      }
      if (form.temSegundoEndereco && (!form.segundoEndereco.cep || !form.segundoEndereco.numero)) {
        setErroMsg('Preencha o CEP e o Número do segundo endereço ou desmarque a opção.');
        return;
      }
      setEtapa(4);
    }
  };

  // Envio Final do Cadastro
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErroMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessData(data);
      } else {
        setErroMsg(data.error || 'Erro ao concluir cadastro.');
      }
    } catch (err) {
      console.error(err);
      setErroMsg('Erro de conexão ao salvar cadastro no banco.');
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    if (successData?.vet?.faturas?.[0]?.pixCopiaCola || '00020126580014BR.GOV.BCB.PIX0136vetbra-pix520400005303986540149.905802BR5906VETBRA6009SAO PAULO62070503***6304ABCD') {
      navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136vetbra-pix520400005303986540149.905802BR5906VETBRA6009SAO PAULO62070503***6304ABCD');
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* TÍTULO & BADGE DE SEGURANÇA */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#147A44] text-xs font-bold border border-emerald-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#147A44]" /> Auditoria Documental CFMV & Senhas Criptografadas
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cadastro Profissional do Veterinário
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
            Junte-se à maior rede credenciada do Brasil com perfil auditado, ícone personalizado no mapa e métricas de conversão.
          </p>
        </div>

        {/* PROGRESSO EM ETAPAS (WIZARD) */}
        {!successData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  etapa === 1 ? 'bg-[#147A44] text-white shadow-xs' : etapa > 1 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">Etapa 1</span>
                <span className="truncate w-full text-[11px]">Acesso & Foto</span>
              </button>

              <button
                type="button"
                onClick={() => etapa > 2 && setEtapa(2)}
                disabled={etapa < 2}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  etapa === 2 ? 'bg-[#147A44] text-white shadow-xs' : etapa > 2 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">Etapa 2</span>
                <span className="truncate w-full text-[11px]">CRMV & Documentos</span>
              </button>

              <button
                type="button"
                onClick={() => etapa > 3 && setEtapa(3)}
                disabled={etapa < 3}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  etapa === 3 ? 'bg-[#147A44] text-white shadow-xs' : etapa > 3 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">Etapa 3</span>
                <span className="truncate w-full text-[11px]">Local & Transporte</span>
              </button>

              <button
                type="button"
                onClick={() => etapa > 4 && setEtapa(4)}
                disabled={etapa < 4}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  etapa === 4 ? 'bg-[#147A44] text-white shadow-xs' : 'text-slate-400 bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">Etapa 4</span>
                <span className="truncate w-full text-[11px]">Plano & Ativação</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTAINER DO FORMULÁRIO */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">

          {/* MENSAGEM DE ERRO GERAL */}
          {erroMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{erroMsg}</span>
            </div>
          )}

          {/* TELA DE SUCESSO E ATIVAÇÃO */}
          {successData ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#147A44] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Cadastro Concluído com Sucesso!</h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Seus dados e documentos foram registrados de forma criptografada no PostgreSQL da VetBra.
                </p>
              </div>

              {/* CARD DE PAGAMENTO PIX PARA ATIVAÇÃO DO PLANO */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-50 border border-slate-200 text-left space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Plano Escolhido</span>
                    <h3 className="text-base font-black text-slate-900">Plano {form.plano}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Aguardando Ativação Pix
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <p>
                    Para ativar seu perfil instantaneamente no mapa e na busca, realize o pagamento via Pix:
                  </p>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-slate-700 text-[11px] truncate mr-2">
                      00020126580014BR.GOV.BCB.PIX0136vetbra-pix...
                    </span>
                    <button
                      type="button"
                      onClick={copiarPix}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      {pixCopiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {pixCopiado ? 'Copiado!' : 'Copiar Pix'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3.5 rounded-2xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Ir para o Painel do Veterinário</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Você já pode acessar o painel e adicionar procedimentos enquanto os documentos são auditados.
                  </p>
                </div>
              </div>
            </div>
          ) : (

            /* FORMULÁRIO MULTI-ETAPAS */
            <form onSubmit={etapa === 4 ? handleFinalSubmit : avancarEtapa} className="space-y-6">

              {/* ======================================================== */}
              {/* ETAPA 1: DADOS PESSOAIS, CREDENCIAIS & FOTO DE PERFIL */}
              {/* ======================================================== */}
              {etapa === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-[#147A44]" /> 1. Dados Profissionais & Acesso ao SaaS
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Suas credenciais de login serão criptografadas e protegidas pelo padrão SaaS.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nome Completo *</label>
                      <input
                        type="text"
                        name="nomeCompleto"
                        value={form.nomeCompleto}
                        onChange={handleChange}
                        placeholder="Ex: Dr. Roberto Almeida"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">E-mail Profissional *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="roberto@clinica.com.br"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Login / Nome de Usuário</label>
                      <input
                        type="text"
                        name="login"
                        value={form.login}
                        onChange={handleChange}
                        placeholder="dr.roberto (opcional, ou use seu email)"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        WhatsApp para Consultas * 
                        <span className="text-[10px] text-emerald-600 font-normal ml-1">(Cliques computados no painel)</span>
                      </label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={form.whatsapp}
                        onChange={handleChange}
                        placeholder="11999998888 (com DDD)"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Senha de Acesso *</label>
                      <input
                        type="password"
                        name="senha"
                        value={form.senha}
                        onChange={handleChange}
                        placeholder="•••••••• (mínimo 6 dígitos)"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Confirmar Senha *</label>
                      <input
                        type="password"
                        name="confirmarSenha"
                        value={form.confirmarSenha}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* UPLOAD FOTO DE PERFIL (OBRIGATÓRIO) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Foto de Perfil Profissional *</span>
                        <span className="text-[11px] text-slate-500">
                          Obrigatória. Use uma foto clara de jaleco ou atendimento veterinário.
                        </span>
                      </div>
                      {form.fotoPerfilUrl && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-300">
                          <img src={form.fotoPerfilUrl} alt="Foto Perfil" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        {uploadingField === 'fotoPerfilUrl' ? 'Enviando...' : form.fotoPerfilUrl ? 'Trocar Foto de Perfil' : 'Selecionar Foto de Perfil'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'fotoPerfilUrl')}
                        />
                      </label>
                      {form.fotoPerfilUrl && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Foto carregada com sucesso
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span>Avançar para CRMV & Documentos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* ETAPA 2: DADOS DO CRMV & UPLOAD DE COMPROVANTES ANTI-FRAUDE */}
              {/* ======================================================== */}
              {etapa === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#147A44]" /> 2. Registro no CRMV & Validação Anti-Fraude
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Como o CFMV não disponibiliza API pública aberta de consulta, nosso time jurídico realiza a validação documental.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Número de Registro CRMV *</label>
                      <input
                        type="text"
                        name="crmvNumero"
                        value={form.crmvNumero}
                        onChange={handleChange}
                        placeholder="Ex: 14839"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Estado (UF) *</label>
                      <select
                        name="crmvUf"
                        value={form.crmvUf}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                      >
                        {ESTADOS_BRASIL.map(est => (
                          <option key={est.uf} value={est.uf}>{est.uf} - {est.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* VALIDADE DO CRMV (COM ALERTA AUTOMÁTICO DE 30 DIAS) */}
                  <div className="space-y-1 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" /> Data de Validade da Carteira CRMV *
                    </label>
                    <p className="text-[11px] text-amber-800">
                      O sistema monitora esta data e emitirá um alerta por e-mail e popup no seu painel com <strong>30 dias de antecedência</strong> do vencimento para atualização.
                    </p>
                    <input
                      type="date"
                      name="crmvValidade"
                      value={form.crmvValidade}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full sm:w-64 px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* UPLOADS ANTI-FRAUDE OBRIGATÓRIOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    
                    {/* 1. FOTO DO DOCUMENTO CRMV */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">1. Foto da Carteira CRMV *</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Fotografe sua carteira profissional (frente e verso nítidos, sem cortes ou reflexos).
                      </p>

                      {form.crmvDocumentoUrl && (
                        <div className="h-28 rounded-xl overflow-hidden border border-emerald-300 bg-white">
                          <img src={form.crmvDocumentoUrl} alt="CRMV Documento" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <label className="cursor-pointer w-full py-2.5 px-3 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        {uploadingField === 'crmvDocumentoUrl' ? 'Enviando Documento...' : form.crmvDocumentoUrl ? 'Substituir Foto CRMV' : 'Enviar Foto do CRMV'}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'crmvDocumentoUrl')}
                        />
                      </label>
                    </div>

                    {/* 2. SELFIE SEGURANDO O DOCUMENTO (ANTI-FRAUDE) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                      <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-700" /> 2. Selfie Segurando o Documento *
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Tire uma foto sua segurando sua carteira CRMV ao lado do seu rosto para confirmação de titularidade.
                      </p>

                      {form.crmvSelfieUrl && (
                        <div className="h-28 rounded-xl overflow-hidden border border-emerald-300 bg-white">
                          <img src={form.crmvSelfieUrl} alt="Selfie com CRMV" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <label className="cursor-pointer w-full py-2.5 px-3 bg-white border border-emerald-300 hover:border-emerald-600 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 transition-all">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        {uploadingField === 'crmvSelfieUrl' ? 'Enviando Selfie...' : form.crmvSelfieUrl ? 'Substituir Selfie' : 'Enviar Selfie com Documento'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'crmvSelfieUrl')}
                        />
                      </label>
                    </div>

                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setEtapa(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span>Avançar para Local & Transporte</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* ETAPA 3: ESTABELECIMENTO, DESLOCAMENTO & MAPA */}
              {/* ======================================================== */}
              {etapa === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#147A44]" /> 3. Estabelecimento, Deslocamento & Endereço
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Esses dados definem o seu ícone no mapa interativo e os filtros de distância para os tutores.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nome do Consultório ou Nome Fantasia</label>
                    <input
                      type="text"
                      name="nomeClinica"
                      value={form.nomeClinica}
                      onChange={handleChange}
                      placeholder="Ex: Clínica Veterinária São Francisco / Dr. Roberto Home Care"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* TIPO DE ESTABELECIMENTO (MÚLTIPLA ESCOLHA / CHECKBOXES) */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 block">
                        Tipo de Estabelecimento *
                        <span className="text-[10px] text-slate-400 font-normal ml-1">(Você pode ticar mais de uma opção)</span>
                      </label>
                      {form.tiposEstabelecimento.length === 0 && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Selecione pelo menos 1 opção
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { id: 'Clínica Veterinária Fixa', label: '🏥 Clínica Veterinária Fixa', desc: 'Estrutura física completa com consultórios e exames' },
                        { id: 'Consultório Fixo', label: '🩺 Consultório Fixo', desc: 'Atendimento ambulatorial e consultas com hora marcada' },
                        { id: 'Hospital Veterinário 24h', label: '🏨 Hospital Veterinário 24h', desc: 'Pronto atendimento emergencial e internação 24 horas' },
                        { id: 'Atendimento Domiciliar / VetMóvel', label: '🚗 Atendimento Domiciliar / VetMóvel', desc: 'Visitas em domicílio, vacinas e cuidados no local' }
                      ].map(item => {
                        const checked = form.tiposEstabelecimento.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              checked ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTipoEstabelecimentoToggle(item.id)}
                              className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm"
                            />
                            <div>
                              <span className="text-xs font-bold block">{item.label}</span>
                              <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* ABA EXPLICATIVA VETMÓVEL */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <Car className="w-4 h-4 text-blue-700" />
                      <span>Integração VetMóvel App (Pré-Configurado para Apps de Transporte Pet)</span>
                    </div>
                    <p className="text-blue-800 leading-relaxed text-[11px]">
                      A VetBra está preparando a funcionalidade VetMóvel com parceiros de transporte e ambulâncias pet sob demanda. Seu perfil já fica preparado para receber chamados de deslocamento rápido.
                    </p>
                  </div>

                  {/* MEIOS DE TRANSPORTE / DESLOCAMENTO (CHECKBOXES OBRIGATÓRIOS) */}
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800 block">
                      Meio de Transporte / Deslocamento (Ícone no Mapa) *
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Assinale pelo menos 1 obrigatório)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { id: 'Carro / PetMóvel', label: '🚗 Carro / PetMóvel', desc: 'Atendimento com veículo próprio para visitas' },
                        { id: 'Carro / Ambulância Particular', label: '🚑 Carro / Ambulância Particular', desc: 'Equipado para urgências e remoção pet' },
                        { id: 'Moto (Rápido)', label: '🏍️ Moto (Vet Express Rápido)', desc: 'Deslocamento ágil para consultas e vacinas' },
                        { id: 'Atendimento Fixo', label: '🏥 Atendimento Fixo no Local', desc: 'Atendimento exclusivo na clínica / consultório' }
                      ].map(item => {
                        const checked = form.meiosTransporte.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              checked ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTransportToggle(item.id)}
                              className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm"
                            />
                            <div>
                              <span className="text-xs font-bold block">{item.label}</span>
                              <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* CIDADE BASE & RAIO DE ATENDIMENTO */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Estado Base *</label>
                      <select
                        name="estadoBase"
                        value={form.estadoBase}
                        onChange={(e) => {
                          const uf = e.target.value;
                          setForm(prev => ({
                            ...prev,
                            estadoBase: uf,
                            cidadeBase: CIDADES_POR_UF[uf]?.[0] || 'Capital'
                          }));
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                      >
                        {ESTADOS_BRASIL.map(est => (
                          <option key={est.uf} value={est.uf}>{est.uf} - {est.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cidade Base Selecionada *</label>
                      <input
                        type="text"
                        name="cidadeBase"
                        value={form.cidadeBase}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Raio de Atendimento (Filtro do Mapa)</label>
                      <select
                        name="raioAtendimentoKm"
                        value={form.raioAtendimentoKm}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[#147A44] font-bold rounded-xl text-xs focus:outline-hidden cursor-pointer"
                      >
                        <option value="5">Raio de 5 km (Bairro e arredores)</option>
                        <option value="15">Raio de 15 km (Zona expandida - Recomendado)</option>
                        <option value="30">Raio de 30 km (Toda a Região Metropolitana)</option>
                        <option value="99999">Sem Limites (Atende todo o Estado / Brasil)</option>
                      </select>
                    </div>
                  </div>

                  {/* ENDEREÇO PRINCIPAL (BASE) COM CONSULTA AUTOMÁTICA DE CEP */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" /> Endereço Principal / Base do Consultório *
                      </span>
                      {cepConsultando && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando no ViaCEP...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-600">CEP *</label>
                        <input
                          type="text"
                          name="cep"
                          value={form.cep}
                          onChange={(e) => {
                            handleChange(e);
                            handleCepLookup(e.target.value);
                          }}
                          placeholder="01424-001"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">Logradouro (Rua / Av.) *</label>
                        <input
                          type="text"
                          name="logradouro"
                          value={form.logradouro}
                          onChange={handleChange}
                          placeholder="Avenida Paulista"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[11px] font-bold text-rose-700">Número * (Obrigatório)</label>
                        <input
                          type="text"
                          name="numero"
                          value={form.numero}
                          onChange={handleChange}
                          placeholder="Ex: 1500"
                          required
                          className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Complemento / Apto</label>
                        <input
                          type="text"
                          name="complemento"
                          value={form.complemento}
                          onChange={handleChange}
                          placeholder="Sala 42 / Bloco B"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Bairro *</label>
                        <input
                          type="text"
                          name="bairro"
                          value={form.bairro}
                          onChange={handleChange}
                          placeholder="Bela Vista"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Cidade / UF *</label>
                        <input
                          type="text"
                          value={`${form.cidade} - ${form.estado}`}
                          readOnly
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OPÇÃO DE 2º ENDEREÇO (FILIAL / PONTO EXTRA) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="temSegundoEndereco"
                        checked={form.temSegundoEndereco}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 rounded-sm"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Possuo um Segundo Endereço (Filial, Consultório Parceiro ou Ponto de Apoio)
                      </span>
                    </label>

                    {form.temSegundoEndereco && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-600">CEP da Filial</label>
                            <input
                              type="text"
                              value={form.segundoEndereco.cep}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm(prev => ({
                                  ...prev,
                                  segundoEndereco: { ...prev.segundoEndereco, cep: val }
                                }));
                                handleCep2Lookup(val);
                              }}
                              placeholder="04538-133"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-hidden"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-bold text-slate-600">Logradouro da Filial</label>
                            <input
                              type="text"
                              value={form.segundoEndereco.logradouro}
                              onChange={(e) => setForm(prev => ({
                                ...prev,
                                segundoEndereco: { ...prev.segundoEndereco, logradouro: e.target.value }
                              }))}
                              placeholder="Rua da Filial"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-600">Número Filial</label>
                            <input
                              type="text"
                              value={form.segundoEndereco.numero}
                              onChange={(e) => setForm(prev => ({
                                ...prev,
                                segundoEndereco: { ...prev.segundoEndereco, numero: e.target.value }
                              }))}
                              placeholder="100"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CHECKBOXES ADICIONAIS: 24H E HOME CARE */}
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        name="atende24h"
                        checked={form.atende24h}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 rounded-sm"
                      />
                      <span>Atendimento / Plantão 24 Horas</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        name="atendeDomiciliar"
                        checked={form.atendeDomiciliar}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 rounded-sm"
                      />
                      <span>Realizo Atendimento Domiciliar / Home Care</span>
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setEtapa(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span>Avançar para Escolha do Plano</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* ETAPA 4: PLANO PROFISSIONAL & ATIVAÇÃO */}
              {/* ======================================================== */}
              {etapa === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" /> 4. Escolha do Plano Profissional (Obrigatório)
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Selecione o plano desejado para sua clínica ou atuação autônoma. O pagamento é facilitado por Pix ou Boleto.
                    </p>
                  </div>

                  {/* CARDS DE PLANOS */}
                  <PricingCards
                    mode="select"
                    selectedPlan={form.plano}
                    onSelectPlan={(p) => setForm(prev => ({ ...prev, plano: p }))}
                  />

                  {/* RESUMO DE COBRANÇA PIX / BOLETO */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">Forma de Cobrança & Ativação:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Ao concluir o cadastro, será gerado o código <strong>Pix Copia e Cola</strong> e o link para <strong>Boleto Bancário</strong>. Assim que o pagamento for liquidado pelo banco, seu perfil é ativado automaticamente no portal VetBra.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setEtapa(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#147A44] to-[#1B85B8] hover:from-[#11693A] hover:to-[#16709C] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {loading ? 'Salvando no Banco de Dados...' : 'Finalizar Cadastro & Gerar Ativação'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <CadastroContent />
    </Suspense>
  );
}
