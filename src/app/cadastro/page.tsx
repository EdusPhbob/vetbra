'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Stethoscope, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

function CadastroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoInicial = searchParams.get('plano') || 'profissional';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    whatsapp: '',
    crmvNumero: '',
    crmvUf: 'SP',
    nomeClinica: '',
    cep: '',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoEstabelecimento: 'Clínica',
    atende24h: false,
    atendeDomiciliar: false,
    plano: planoInicial.toUpperCase()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#147A44] text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4" /> Cadastro com Auditoria de CRMV
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cadastrar Consultório / Veterinário</h1>
            <p className="text-xs text-slate-500 font-medium">
              Receba novos pacientes e tenha um perfil com selo de verificação oficial no portal VetBra.
            </p>
          </div>

          {success ? (
            <div className="py-12 text-center space-y-3 bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold text-emerald-900">Cadastro Realizado com Sucesso!</h2>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Seu cadastro foi salvo no PostgreSQL e enviado para a fila de auditoria do CRMV. Redirecionando para o seu painel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* BLOCO 1: DADOS PESSOAIS E ACESSO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  1. Dados do Profissional & Acesso
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nome Completo</label>
                    <input
                      type="text"
                      name="nomeCompleto"
                      value={form.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Dr. João Silva"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">E-mail Profissional</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="joao@veterinaria.com.br"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Senha de Acesso</label>
                    <input
                      type="password"
                      name="senha"
                      value={form.senha}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">WhatsApp para Consultas</label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="11999998888"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO 2: DADOS DO CRMV */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  2. Dados do CRMV para Auditoria no CFMV
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Número de Registro CRMV</label>
                    <input
                      type="text"
                      name="crmvNumero"
                      value={form.crmvNumero}
                      onChange={handleChange}
                      placeholder="Ex: 14839"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Estado (UF)</label>
                    <select
                      name="crmvUf"
                      value={form.crmvUf}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="SP">SP - São Paulo</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="DF">DF - Distrito Federal</option>
                      <option value="BA">BA - Bahia</option>
                      <option value="SC">SC - Santa Catarina</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: CLÍNICA & LOCALIZAÇÃO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  3. Consultório & Local de Atendimento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nome do Consultório ou Clínica</label>
                    <input
                      type="text"
                      name="nomeClinica"
                      value={form.nomeClinica}
                      onChange={handleChange}
                      placeholder="Clínica Veterinária Silva"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tipo de Estabelecimento</label>
                    <select
                      name="tipoEstabelecimento"
                      value={form.tipoEstabelecimento}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="Clínica">Clínica Veterinária</option>
                      <option value="Consultório">Consultório Particular</option>
                      <option value="Hospital 24h">Hospital Veterinário 24h</option>
                      <option value="Autônomo Domiciliar">Atendimento Domiciliar / Home Care</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={form.cep}
                      onChange={handleChange}
                      placeholder="01424-001"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={form.cidade}
                      onChange={handleChange}
                      placeholder="São Paulo"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="atende24h"
                      checked={form.atende24h}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 rounded-sm"
                    />
                    <span>Atendimento / Plantão 24 Horas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="atendeDomiciliar"
                      checked={form.atendeDomiciliar}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 rounded-sm"
                    />
                    <span>Realizo Atendimento Domiciliar</span>
                  </label>
                </div>
              </div>

              {/* BLOCO 4: PLANO ESCOLHIDO */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Plano Selecionado</label>
                <select
                  name="plano"
                  value={form.plano}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[#147A44] font-bold rounded-xl text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="BASICO">Plano Básico (R$ 79,90/mês)</option>
                  <option value="PROFISSIONAL">Plano Profissional (R$ 149,90/mês) - Recomendado</option>
                  <option value="PREMIUM">Plano Premium (R$ 299,90/mês) - Destaque Máximo</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#147A44] to-[#1B85B8] hover:from-[#11693A] hover:to-[#16709C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Processando Cadastro...' : 'Finalizar Cadastro e Ir para o Painel'}
              </button>

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
