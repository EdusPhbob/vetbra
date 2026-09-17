'use client';

import React, { useState } from 'react';
import { 
  Star, 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Send,
  User,
  Phone
} from 'lucide-react';

interface AvaliacaoFormModalProps {
  veterinarioId: string;
  veterinarioNome: string;
  onAvaliacaoEnviada?: () => void;
}

export default function AvaliacaoFormModal({
  veterinarioId,
  veterinarioNome,
  onAvaliacaoEnviada
}: AvaliacaoFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Estados do Formulário
  const [nomeTutor, setNomeTutor] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nota, setNota] = useState<number>(5);
  const [hoverNota, setHoverNota] = useState<number>(0);
  const [dataAtendimento, setDataAtendimento] = useState('');
  const [horaAtendimento, setHoraAtendimento] = useState('');
  const [comentario, setComentario] = useState('');

  const MAX_CARACTERES = 1024;

  // Limite de 60 dias anteriores ao dia vigente
  const hoje = new Date();
  const maxDate = hoje.toISOString().split('T')[0];
  const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
  const minDate = sessentaDiasAtras.toISOString().split('T')[0];

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');

    // Não permite zero à esquerda no DDD
    while (valor.startsWith('0')) {
      valor = valor.slice(1);
    }

    // Não ultrapassa o número correto (máximo 11 dígitos: DDD de 2 números + 9 dígitos)
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    // Aplica formatação automática padrão Brasil
    let formatado = valor;
    if (valor.length > 6) {
      if (valor.length <= 10) {
        formatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
      } else {
        formatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
      }
    } else if (valor.length > 2) {
      formatado = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      formatado = `(${valor}`;
    }

    setTelefone(formatado);
  };

  const getNotaLabel = (val: number) => {
    switch (val) {
      case 1: return '1 - Muito Insatisfeito (Péssimo)';
      case 2: return '2 - Insatisfeito (Ruim)';
      case 3: return '3 - Regular / Neutro';
      case 4: return '4 - Satisfeito (Bom)';
      case 5: return '5 - Excelente! Recomendo Muito';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg(null);

    if (!nomeTutor.trim()) {
      setErroMsg('Por favor, informe seu nome.');
      return;
    }

    // Validação estrita do Telefone / WhatsApp
    if (telefone.trim()) {
      const digitos = telefone.replace(/\D/g, '');
      if (digitos.startsWith('0')) {
        setErroMsg('O DDD não pode começar com 0. Digite o DDD de 2 números (ex: 11) seguido do telefone.');
        return;
      }
      if (digitos.length < 10 || digitos.length > 11) {
        setErroMsg('O telefone/WhatsApp não pode ultrapassar o tamanho correto. Deve conter DDD com 2 números e 8 ou 9 dígitos (ex: (11) 98765-4321).');
        return;
      }
      const ddd = parseInt(digitos.slice(0, 2), 10);
      if (isNaN(ddd) || ddd < 11 || ddd > 99) {
        setErroMsg('DDD inválido. Informe um DDD de 2 dígitos entre 11 e 99 (sem zero à frente).');
        return;
      }
    }

    // Validação estrita da data de atendimento (máximo 60 dias atrás e não futura)
    if (!dataAtendimento) {
      setErroMsg('Informe a data em que o atendimento foi realizado.');
      return;
    }

    if (dataAtendimento < minDate) {
      setErroMsg(`A data do atendimento não pode ser anterior a 60 dias da data vigente (mínimo permitido: ${sessentaDiasAtras.toLocaleDateString('pt-BR')}).`);
      return;
    }

    if (dataAtendimento > maxDate) {
      setErroMsg('A data do atendimento não pode ser posterior à data de hoje.');
      return;
    }

    if (!comentario.trim() || comentario.trim().length < 5) {
      setErroMsg('Descreva sua experiência em pelo menos 5 caracteres.');
      return;
    }

    if (comentario.length > MAX_CARACTERES) {
      setErroMsg(`O comentário ultrapassou o limite de ${MAX_CARACTERES} caracteres.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId,
          nomeTutor,
          telefone,
          nota,
          dataAtendimento,
          horaAtendimento,
          comentario
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSucesso(true);
        if (onAvaliacaoEnviada) {
          onAvaliacaoEnviada();
        }
      } else {
        setErroMsg(data.error || 'Erro ao enviar avaliação.');
      }
    } catch (err) {
      console.error(err);
      setErroMsg('Erro de conexão ao enviar sua avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSucesso(false);
    setErroMsg(null);
    setNomeTutor('');
    setTelefone('');
    setNota(5);
    setDataAtendimento('');
    setHoraAtendimento('');
    setComentario('');
    setIsOpen(false);
  };

  return (
    <>
      {/* BOTÃO DISPARADOR NA PÁGINA DO PERFIL */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
      >
        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        <span>Avaliar Atendimento</span>
      </button>

      {/* MODAL INTERATIVO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto relative">
            
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={resetForm}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {sucesso ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-[#147A44] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Avaliação Registrada com Sucesso!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Obrigado pelo seu feedback sobre o atendimento com <strong>{veterinarioNome}</strong>. Ele ajuda outros tutores na escolha do profissional ideal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    window.location.reload();
                  }}
                  className="px-6 py-2.5 bg-[#147A44] hover:bg-[#11693A] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Concluir & Atualizar Perfil
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Avaliação Auditada
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    Avaliar Atendimento de {veterinarioNome}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informe os dados reais da sua consulta ou procedimento.
                  </p>
                </div>

                {erroMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{erroMsg}</span>
                  </div>
                )}

                {/* 1. SELEÇÃO DE ESTRELAS */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <label className="text-xs font-bold text-slate-700 block">
                    Sua Nota Geral para o Atendimento *
                  </label>
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const ativo = (hoverNota || nota) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setNota(starVal)}
                          onMouseEnter={() => setHoverNota(starVal)}
                          onMouseLeave={() => setHoverNota(0)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                        >
                          <Star 
                            className={`w-7 h-7 transition-colors ${
                              ativo 
                                ? 'fill-amber-400 text-amber-500' 
                                : 'text-slate-300 hover:text-amber-300'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-amber-800 block">
                    {getNotaLabel(hoverNota || nota)}
                  </span>
                </div>

                {/* 2. DADOS DO TUTOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={nomeTutor}
                      onChange={(e) => setNomeTutor(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp (Anti-Spam)
                    </label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      maxLength={15}
                      inputMode="numeric"
                      placeholder="(11) 99999-8888"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      DDD com 2 dígitos sem zero na frente (ex: 11)
                    </span>
                  </div>
                </div>

                {/* 3. DIA E HORA DO ATENDIMENTO (EXIGÊNCIA: MÁXIMO 60 DIAS ATRÁS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Dia do Atendimento *
                      </span>
                    </label>
                    <input
                      type="date"
                      value={dataAtendimento}
                      onChange={(e) => setDataAtendimento(e.target.value)}
                      required
                      min={minDate}
                      max={maxDate}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                    />
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Permitido: de {sessentaDiasAtras.toLocaleDateString('pt-BR')} até hoje
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" /> Horário Aproximado
                    </label>
                    <input
                      type="time"
                      value={horaAtendimento}
                      onChange={(e) => setHoraAtendimento(e.target.value)}
                      placeholder="14:30"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Horário estimado da consulta
                    </span>
                  </div>
                </div>

                {/* 4. COMENTÁRIO (COM LIMITE DE ATÉ 1024 CARACTERES) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Relato da Consulta / Atendimento *
                    </label>
                    <span className={`text-[10px] font-bold ${
                      comentario.length > MAX_CARACTERES ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {comentario.length} / {MAX_CARACTERES} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={MAX_CARACTERES}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Conte como foi o atendimento do profissional, como seu pet foi tratado, clareza nas orientações e pontualidade..."
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-hidden focus:border-emerald-500 leading-relaxed resize-none"
                  />
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publicar Avaliação</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
