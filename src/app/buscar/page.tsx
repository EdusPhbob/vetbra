'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VetCard from '@/components/VetCard';
import VetCompareDrawer from '@/components/VetCompareDrawer';
import { Search, Filter, ShieldCheck, MapPin, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';

function BuscarContent() {
  const searchParams = useSearchParams();

  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [estado, setEstado] = useState(searchParams.get('estado') || 'Todos');
  const [cidade, setCidade] = useState(searchParams.get('cidade') || '');
  const [especialidade, setEspecialidade] = useState(searchParams.get('especialidade') || 'Todas');
  const [atende24h, setAtende24h] = useState(searchParams.get('atende24h') === 'true');
  const [domiciliar, setDomiciliar] = useState(searchParams.get('domiciliar') === 'true');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '500');

  // Comparador de Vets (até 4)
  const [comparedVets, setComparedVets] = useState<any[]>([]);

  // Busca na API
  useEffect(() => {
    async function fetchVets() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (estado && estado !== 'Todos') params.append('estado', estado);
        if (cidade) params.append('cidade', cidade);
        if (especialidade && especialidade !== 'Todas') params.append('especialidade', especialidade);
        if (atende24h) params.append('atende24h', 'true');
        if (domiciliar) params.append('domiciliar', 'true');
        if (maxPrice) params.append('maxPrice', maxPrice);

        const res = await fetch(`/api/vets?${params.toString()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setVets(data);
        }
      } catch (err) {
        console.error('Erro ao buscar veterinários:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVets();
  }, [estado, cidade, especialidade, atende24h, domiciliar, maxPrice]);

  const toggleCompare = (vet: any) => {
    if (comparedVets.find(v => v.id === vet.id)) {
      setComparedVets(comparedVets.filter(v => v.id !== vet.id));
    } else {
      if (comparedVets.length >= 4) {
        alert('Você pode comparar no máximo 4 veterinários simultaneamente.');
        return;
      }
      setComparedVets([...comparedVets, vet]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* SEARCH BAR HEADER */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Buscar Médicos Veterinários
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Exibindo apenas profissionais com CRMV verificado e regularizado.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-[#147A44] text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> Filtro CRMV Ativo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: FILTERS + GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR DE FILTROS */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <SlidersHorizontal className="w-4 h-4 text-[#147A44]" />
                  Filtros de Busca
                </div>
                <button
                  onClick={() => {
                    setEstado('Todos');
                    setCidade('');
                    setEspecialidade('Todas');
                    setAtende24h(false);
                    setDomiciliar(false);
                    setMaxPrice('500');
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  Limpar
                </button>
              </div>

              {/* Filtro Estado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Estado (UF)</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="Todos">Todos os Estados</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="PR">Paraná (PR)</option>
                  <option value="RS">Rio Grande do Sul (RS)</option>
                  <option value="DF">Distrito Federal (DF)</option>
                  <option value="BA">Bahia (BA)</option>
                </select>
              </div>

              {/* Filtro Cidade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cidade / Bairro</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: São Paulo ou Pinheiros"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden placeholder:text-slate-400"
                />
              </div>

              {/* Filtro Especialidade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Especialidade</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="Todas">Todas as Especialidades</option>
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Oftalmologia">Oftalmologia</option>
                  <option value="Animais Exóticos e Silvestres">Silvestres & Exóticos</option>
                  <option value="Acupuntura">Acupuntura & Fisioterapia</option>
                  <option value="Cirurgia Geral">Cirurgia Geral</option>
                </select>
              </div>

              {/* Filtro Preço Máximo da Consulta */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Preço da Consulta:</span>
                  <span className="font-black text-[#147A44]">Até R$ {maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="600"
                  step="20"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Checkboxes adicionais */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={atende24h}
                    onChange={(e) => setAtende24h(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Plantão 24 Horas</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={domiciliar}
                    onChange={(e) => setDomiciliar(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Atendimento Domiciliar</span>
                </label>
              </div>

            </div>
          </aside>

          {/* LISTAGEM DE RESULTADOS */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>{vets.length} {vets.length === 1 ? 'veterinário encontrado' : 'veterinários encontrados'}</span>
              <span>Ordenado por Relevância & Destaque</span>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Buscando profissionais auditados...</span>
              </div>
            ) : vets.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Nenhum veterinário encontrado</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tente alterar ou limpar os filtros de cidade, especialidade ou faixa de preço para ver outros profissionais cadastrados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {vets.map((vet) => (
                  <VetCard
                    key={vet.id}
                    vet={vet}
                    isCompared={!!comparedVets.find(v => v.id === vet.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* DRAWER COMPARADOR FLUTUANTE */}
      <VetCompareDrawer
        vets={comparedVets}
        onRemove={(id) => setComparedVets(comparedVets.filter(v => v.id !== id))}
        onClear={() => setComparedVets([])}
      />

      <Footer />
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <BuscarContent />
    </Suspense>
  );
}
