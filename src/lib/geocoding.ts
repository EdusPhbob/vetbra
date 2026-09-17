/**
 * Utilitário de Geocodificação Automática
 * Converte endereço textual brasileiro em coordenadas Latitude / Longitude
 * Utiliza o OpenStreetMap Nominatim com fallback para Cidade/Estado
 */

export async function geocodeAddress(params: {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}): Promise<{ latitude: number | null; longitude: number | null }> {
  const { logradouro, numero, bairro, cidade, estado } = params;

  if (!cidade || !estado) {
    return { latitude: null, longitude: null };
  }

  try {
    // 1. Tenta geocodificação com endereço detalhado
    const queryDetalhada = [logradouro, numero, bairro, cidade, estado, 'Brasil']
      .filter(Boolean)
      .join(', ');

    const res1 = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryDetalhada)}`,
      { headers: { 'User-Agent': 'VetBra-Platform/1.0 (contato@vetbra.duosat.com.br)' } }
    );

    if (res1.ok) {
      const data1 = await res1.json();
      if (Array.isArray(data1) && data1[0]?.lat && data1[0]?.lon) {
        return {
          latitude: parseFloat(data1[0].lat),
          longitude: parseFloat(data1[0].lon)
        };
      }
    }

    // 2. Fallback: geocodificação por Cidade + Estado
    const queryCidade = `${cidade}, ${estado}, Brasil`;
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryCidade)}`,
      { headers: { 'User-Agent': 'VetBra-Platform/1.0 (contato@vetbra.duosat.com.br)' } }
    );

    if (res2.ok) {
      const data2 = await res2.json();
      if (Array.isArray(data2) && data2[0]?.lat && data2[0]?.lon) {
        return {
          latitude: parseFloat(data2[0].lat),
          longitude: parseFloat(data2[0].lon)
        };
      }
    }
  } catch (err) {
    console.error('Falha ao obter coordenadas no Nominatim:', err);
  }

  return { latitude: null, longitude: null };
}
