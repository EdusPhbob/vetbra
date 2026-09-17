/**
 * Rate Limiter em memória para proteção contra ataques de força bruta (Brute Force)
 * Bloqueia tentativas repetidas de login após 5 falhas durante 2 minutos (120s).
 */

interface AttemptRecord {
  count: number;
  blockedUntil: number | null;
  lastAttempt: number;
}

// Map global em memória para persistir entre requisições no mesmo processo
const attemptsMap = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutos (120 segundos)

/**
 * Limpa registros expirados a cada 10 minutos para não acumular memória
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (record.blockedUntil && record.blockedUntil < now && now - record.lastAttempt > BLOCK_DURATION_MS * 2) {
      attemptsMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  blockedSeconds: number;
} {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, blockedSeconds: 0 };
  }

  // Verifica se está atualmente em bloqueio
  if (record.blockedUntil && record.blockedUntil > now) {
    const blockedSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, blockedSeconds };
  }

  // Se o bloqueio expirou, reseta o contador
  if (record.blockedUntil && record.blockedUntil <= now) {
    attemptsMap.delete(key);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, blockedSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { allowed: true, remainingAttempts: remaining, blockedSeconds: 0 };
}

export function recordFailedAttempt(key: string): {
  isBlocked: boolean;
  blockedSeconds: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  let record = attemptsMap.get(key);

  if (!record) {
    record = { count: 1, blockedUntil: null, lastAttempt: now };
    attemptsMap.set(key, record);
    return { isBlocked: false, blockedSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const blockedSeconds = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { isBlocked: true, blockedSeconds, remainingAttempts: 0 };
  }

  return {
    isBlocked: false,
    blockedSeconds: 0,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count,
  };
}

export function clearRateLimit(key: string) {
  attemptsMap.delete(key);
}
