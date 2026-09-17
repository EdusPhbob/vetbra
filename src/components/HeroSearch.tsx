'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Home, 
  Sparkles,
  X
} from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  const [tipoPet, setTipoPet] = useState('Todos');
  const [especialidade, setEspecialidade] = useState('Todas');
  const [localizacao, setLocalizacao] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Pergunta suavemente se o usuário deseja usar a localização no primeiro acesso
  useEffect(() => {
    const hasAsked = sessionStorage.getItem('vetbra_location_asked');
    if (!hasAsked && 'geolocation' in navigator) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Obter localização via GPS do Navegador
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Geolocalização não suportada neste navegador.');
      return;
    }

    setLoadingLocation(true);
    setShowLocationPrompt(false);
    sessionStorage.setItem('vetbra_location_asked', 'true');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Geocodificação reversa via API pública gratuita
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const cidade = addr.city || addr.town || addr.municipality || addr.village || 'São Paulo';
          const estado = addr.state_code || addr.state || 'SP';
          const ufSigla = estado.length > 2 ? 'SP' : estado;

          const localFinal = `${cidade}, ${ufSigla}`;
          setLocalizacao(localFinal);
          setLocationStatus(`📍 Localização detectada: ${localFinal}`);
        } catch (err) {
          console.error('Erro na geocodificação:', err);
          setLocalizacao('São Paulo, SP');
          setLocationStatus('Localização aproximada definida: São Paulo, SP');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.warn('Permissão de geolocalização negada ou erro:', error.message);
        setLoadingLocation(false);
        setLocationStatus('Permissão negada. Você pode digitar o CEP ou Cidade abaixo.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Detecção e preenchimento automático de CEP em tempo real
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalizacao(val);

    const digitos = val.replace(/\D/g, '');
    // Se digitou exatamente 8 dígitos de um CEP brasileiro
    if (digitos.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const resultado = `${data.localidade}, ${data.uf} (${data.bairro})`;
          setLocalizacao(resultado);
          setLocationStatus(`✓ CEP Encontrado: ${data.bairro}, ${data.localidade}/${data.uf}`);
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tipoPet && tipoPet !== 'Todos') {
      params.append('tipoPet', tipoPet);
    }
    if (especialidade && especialidade !== 'Todas') {
      params.append('especialidade', especialidade);
    }
    if (localizacao.trim()) {
      // Extrair nome da cidade se tiver parênteses ou vírgula
      const cleanLoc = localizacao.split('(')[0].split(',')[0].trim();
      params.append('cidade', cleanLoc);
    }
    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div className="pt-6 max-w-4xl mx-auto space-y-3">
      
      {/* BANNER FLUTUANTE DE SOLICITAÇÃO AMIGÁVEL DE LOCALIZAÇÃO */}
      {showLocationPrompt && (
        <div className="bg-emerald-[#147A44]/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Deseja encontrar veterinários próximos à sua localização?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
            >
              Sim, detectar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLocationPrompt(false);
                sessionStorage.setItem('vetbra_location_asked', 'true');
              }}
              className="p-1 hover:bg-white/10 rounded-md text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL DE BUSCA CENTRALIZADO E CLEAN */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
      >
        {/* Campo Qual é o seu pet? */}
        <div className="space-y-1 px-3 py-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Qual é o seu pet?
          </label>
          <select 
            value={tipoPet}
            onChange={(e) => setTipoPet(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="Todos">Todos os pets 🐾</option>
            <option value="Caes">Cães 🐶</option>
            <option value="Gatos">Gatos 🐱</option>
            <option value="Aves">Aves 🦜</option>
            <option value="Exoticos">Silvestres & Exóticos 🐇</option>
            <option value="Roedores">Roedores 🐹</option>
            <option value="Repteis">Répteis 🦎</option>
            <option value="Equinos">Equinos 🐴</option>
            <option value="Outros">Outros Pets 🐾</option>
          </select>
        </div>

        {/* Campo Especialidade */}
        <div className="space-y-1 px-3 py-1 sm:border-l border-slate-200">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            O que precisa?
          </label>
          <select 
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="Todas">Todas Especialidades</option>
            <option value="Clínica Geral">Clínica Geral</option>
            <option value="Cardiologia">Cardiologia</option>
            <option value="Dermatologia">Dermatologia Pet</option>
            <option value="Ortopedia">Ortopedia</option>
            <option value="Oftalmologia">Oftalmologia</option>
            <option value="Medicina Felina">Medicina Felina</option>
            <option value="Nutrição Animal">Nutrologia / Nutrição</option>
            <option value="Animais Exóticos e Silvestres">Silvestres & Exóticos</option>
            <option value="Cirurgia Geral">Cirurgia Geral</option>
          </select>
        </div>

        {/* Campo Localização / CEP */}
        <div className="space-y-1 px-3 py-1 lg:border-l border-slate-200 relative">
          <div className="flex items-center justify-between min-h-[16px]">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={loadingLocation}
              className="text-[10px] font-bold text-[#147A44] hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
              title="Detectar automaticamente minha cidade ou bairro"
            >
              {loadingLocation ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-600" />
              ) : (
                <Navigation className="w-2.5 h-2.5 text-emerald-600" />
              )}
              {loadingLocation ? 'Detectando...' : 'Meu local'}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={localizacao}
              onChange={handleLocationChange}
              placeholder="Digite o CEP ou Cidade..."
              className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden placeholder:text-slate-400/90 placeholder:italic"
            />
            {cepLoading && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
            )}
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="flex items-center">
          <button
            type="submit"
            className="w-full h-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#147A44] to-[#1B85B8] hover:from-[#11693A] hover:to-[#16709C] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Buscar Vets
          </button>
        </div>
      </form>

      {/* FEEDBACK DE LOCALIZAÇÃO / CEP DETECTADO */}
      {locationStatus && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200/80 w-fit mx-auto animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locationStatus}</span>
        </div>
      )}

    </div>
  );
}
