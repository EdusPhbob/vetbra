'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Stethoscope,
  KeyRound,
  X
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const reason = searchParams.get('reason');

  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate Limiter / Bloqueio
  const [blockedSeconds, setBlockedSeconds] = useState<number | null>(null);

  // Modal Esqueceu a Senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [resetCodigo, setResetCodigo] = useState('');
  const [resetNovaSenha, setResetNovaSenha] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Contador regressivo para desbloqueio
  useEffect(() => {
    if (blockedSeconds === null || blockedSeconds <= 0) return;
    const timer = setInterval(() => {
      setBlockedSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setErrorMsg(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockedSeconds && blockedSeconds > 0) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginOrEmail, senha }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Bloqueio por força bruta (Rate Limiting)
        setErrorMsg(data.error);
        if (data.blockedSeconds) {
          setBlockedSeconds(data.blockedSeconds);
        }
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao realizar login.');
        return;
      }

      // Sucesso no login! Redirecionamento completo do navegador para atualizar os cookies de sessão
      let destino = '/dashboard';
      if (data.user?.role === 'ADMIN') {
        // Administrador autenticado: transfere imediatamente para a área administrativa
        destino = (redirectParam && redirectParam.startsWith('/admin')) ? redirectParam : '/admin';
      } else {
        // Veterinário comum
        destino = (redirectParam && redirectParam !== '/login' && redirectParam !== '/' && !redirectParam.startsWith('/admin'))
          ? redirectParam
          : (data.redirectTo || '/dashboard');
      }

      window.location.href = destino;
    } catch (err: any) {
      console.error('Erro de conexão no login:', err);
      setErrorMsg('Falha de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Solicitar código de recuperação
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg(data.message || 'Código de recuperação enviado.');
        setForgotStep('reset');
      } else {
        setForgotError(data.error || 'Erro ao solicitar código.');
      }
    } catch {
      setForgotError('Erro de conexão ao solicitar recuperação.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Confirmar redefinição com código de 6 dígitos
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier,
          codigo: resetCodigo,
          novaSenha: resetNovaSenha,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg('Senha redefinida com sucesso! Você já pode entrar com a nova senha.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep('request');
        }, 2000);
      } else {
        setForgotError(data.error || 'Código inválido ou expirado.');
      }
    } catch {
      setForgotError('Erro de conexão ao redefinir senha.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          
          {/* Top Branding Card */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-[#147A44] shadow-xs mb-4">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Área do Veterinário
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Acesse seu painel profissional, métricas e dados cadastrais no portal VetBra.
            </p>
          </div>

          {/* Aviso se foi redirecionado por falta de login */}
          {reason === 'auth_required' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Por segurança, faça login na sua conta para acessar o painel profissional.</span>
            </div>
          )}

          {reason === 'admin_required' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>A página de moderação de CRMV exige acesso administrativo autenticado.</span>
            </div>
          )}

          {/* Box de Bloqueio por Força Bruta */}
          {blockedSeconds !== null && blockedSeconds > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 text-center space-y-2 animate-pulse">
              <div className="inline-flex p-2 bg-rose-100 rounded-full text-rose-700 mb-1">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-rose-900">
                Acesso Temporariamente Bloqueado
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                Múltiplas tentativas incorretas foram detectadas. Para proteger as contas da plataforma, o acesso está pausado.
              </p>
              <div className="pt-2 text-lg font-black text-rose-800 tracking-wider">
                Desbloqueio em: {Math.floor(blockedSeconds / 60)}:{String(blockedSeconds % 60).padStart(2, '0')} min
              </div>
            </div>
          )}

          {/* Card Principal de Login */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {errorMsg && !blockedSeconds && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Campo Login / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail ou Login Profissional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginOrEmail}
                    onChange={(e) => setLoginOrEmail(e.target.value)}
                    disabled={blockedSeconds !== null && blockedSeconds > 0}
                    placeholder="exemplo@vetbra.com ou login"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#147A44]/30 focus:border-[#147A44] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-[#147A44] hover:text-emerald-800 font-semibold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={blockedSeconds !== null && blockedSeconds > 0}
                    placeholder="Sua senha segura"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#147A44]/30 focus:border-[#147A44] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading || (blockedSeconds !== null && blockedSeconds > 0)}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-[#147A44] hover:bg-[#0f6035] transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciais...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel Profissional</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divisória e Cadastro */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600 mb-3">
                Ainda não tem cadastro no portal VetBra?
              </p>
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                Cadastrar Minha Clínica ou Consultório
              </Link>
            </div>
          </div>

          {/* Selo de Segurança */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conexão criptografada com verificação de segurança</span>
          </div>

        </div>
      </main>

      {/* MODAL DE ESQUECEU A SENHA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#147A44] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recuperação de Senha</h3>
              <p className="text-xs text-slate-500 mt-1">
                {forgotStep === 'request'
                  ? 'Informe seu e-mail cadastrado para receber o código de 6 dígitos.'
                  : 'Digite o código recebido no seu e-mail e sua nova senha.'}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                {forgotError}
              </div>
            )}

            {forgotMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail ou Login</label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="exemplo@vetbra.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#147A44]/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[#147A44] hover:bg-[#0f6035] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Enviando código...' : 'Enviar Código de Segurança'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código de 6 Dígitos</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCodigo}
                    onChange={(e) => setResetCodigo(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147A44]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={resetNovaSenha}
                    onChange={(e) => setResetNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#147A44]/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[#147A44] hover:bg-[#0f6035] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Salvando...' : 'Confirmar e Trocar Senha'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#147A44]"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
