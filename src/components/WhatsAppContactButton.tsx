'use client';

import React, { useState } from 'react';
import { MessageCircle, Check, Loader2 } from 'lucide-react';

interface WhatsAppContactButtonProps {
  veterinarioId: string;
  whatsappNumber: string;
  veterinarioNome: string;
  origem?: string;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WhatsAppContactButton({
  veterinarioId,
  whatsappNumber,
  veterinarioNome,
  origem = 'PERFIL',
  className = '',
  label = 'Agendar no WhatsApp',
  size = 'md'
}: WhatsAppContactButtonProps) {
  const [clicked, setClicked] = useState(false);

  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Olá Dr(a). ${veterinarioNome}, encontrei seu perfil no portal VetBra e gostaria de consultar informações/horários para atendimento do meu pet.`
  );
  const whatsappUrl = `https://wa.me/55${cleanNumber}?text=${message}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setClicked(true);
    // Dispara telemetria de clique para computar no banco de dados
    try {
      fetch('/api/analytics/whatsapp-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId,
          origem
        }),
        keepalive: true
      }).catch(err => console.error('Erro silencioso na telemetria:', err));
    } catch (e) {
      // Falha não impede a conversa
    }

    setTimeout(() => {
      setClicked(false);
    }, 3000);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-3 text-xs sm:text-sm rounded-2xl gap-2',
    lg: 'px-7 py-4 text-sm sm:text-base rounded-2xl gap-2.5'
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-bold text-white shadow-md hover:shadow-lg transition-all transform active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ${sizeClasses[size]} ${className}`}
    >
      {clicked ? (
        <>
          <Check className="w-4 h-4 animate-bounce" />
          <span>Abrindo WhatsApp...</span>
        </>
      ) : (
        <>
          <MessageCircle className="w-4 h-4 text-white shrink-0" />
          <span>{label}</span>
        </>
      )}
    </a>
  );
}
