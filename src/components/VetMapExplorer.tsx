'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageCircle, 
  SlidersHorizontal, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  Stethoscope,
  X,
  Loader2,
  Clock,
  Home,
  Flame,
  Layers,
  CircleDot
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface VetMapProps {
  vets: any[];
}

// Configuração dos estilos de mapa (Google Maps oficial sem marca d'água)
const MAP_STYLES = {
  ruas: {
    nome: 'Google Ruas',
    icon: '🗺️',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  satelite: {
    nome: 'Satélite',
    icon: '🛰️',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satélite & Imagens'
  },
  relevo: {
    nome: 'Relevo',
    icon: '🌄',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Relevo'
  }
};

// Cálculo de distância esférica (fórmula de Haversine)
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function VetMapExplorer({ vets }: VetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const coverageLayerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  // Localização padrão: Avenida Paulista / Jardins, SP
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: -23.5615,
    lng: -46.6560
  });
  const [userCity, setUserCity] = useState('São Paulo, SP');
  const [detectingGps, setDetectingGps] = useState(false);
  const [raioKm, setRaioKm] = useState<number>(15); // 15 km padrão
  const [filtroModalidade, setFiltroModalidade] = useState<'TODOS' | 'FIXO' | 'CARRO' | 'MOTO'>('TODOS');
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Controles inovadores: Estilo do Mapa, Modo Térmico, Áreas de Cobertura e Fullscreen
  const [mapStyle, setMapStyle] = useState<'ruas' | 'satelite' | 'relevo'>('ruas');
  const [modoVisualizacao, setModoVisualizacao] = useState<'MARCADORES' | 'TERMAL'>('MARCADORES');
  const [mostrarAreas, setMostrarAreas] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Helper para determinar ícone, cor e raio de atendimento do veterinário
  const getVetIconInfo = (vet: any) => {
    const isFixo = vet.tipoEstabelecimento === 'Clínica' || vet.tipoEstabelecimento === 'Consultório' || vet.tipoEstabelecimento === 'Hospital 24h';
    const meio = (vet.meioTransporte || '').toLowerCase();
    const isDomiciliar = vet.atendeDomiciliar || meio.includes('carro') || meio.includes('moto');

    if (isFixo && isDomiciliar) {
      if (meio.includes('moto')) {
        return { 
          emoji: '🏥🏍️', 
          label: 'Clínica Fixa + Vet de Moto', 
          color: '#0d9488', 
          bgClass: 'bg-teal-50 text-teal-800 border-teal-300', 
          isFixo: true, 
          isCarro: false, 
          isMoto: true,
          raioAtendimentoKm: 14
        };
      }
      return { 
        emoji: '🏥🚗', 
        label: 'Clínica Fixa + Vet de Carro', 
        color: '#0284c7', 
        bgClass: 'bg-sky-50 text-sky-800 border-sky-300', 
        isFixo: true, 
        isCarro: true, 
        isMoto: false,
        raioAtendimentoKm: 22
      };
    } else if (isDomiciliar) {
      if (meio.includes('moto')) {
        return { 
          emoji: '🏍️', 
          label: 'Vet Domiciliar (Moto Express)', 
          color: '#d97706', 
          bgClass: 'bg-amber-50 text-amber-800 border-amber-300', 
          isFixo: false, 
          isCarro: false, 
          isMoto: true,
          raioAtendimentoKm: 12
        };
      }
      return { 
        emoji: '🚗', 
        label: 'Vet Domiciliar (Carro / Móvel)', 
        color: '#2563eb', 
        bgClass: 'bg-blue-50 text-blue-800 border-blue-300', 
        isFixo: false, 
        isCarro: true, 
        isMoto: false,
        raioAtendimentoKm: 20
      };
    }
    // Somente Fixo (Consultório / Clínica)
    return { 
      emoji: '🏥', 
      label: 'Consultório / Clínica Fixa', 
      color: '#147A44', 
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300', 
      isFixo: true, 
      isCarro: false, 
      isMoto: false,
      raioAtendimentoKm: 6
    };
  };

  // Filtra veterinários válidos com coordenadas
  const vetsComCoords = vets.filter(v => {
    const end = v.enderecos?.[0];
    return end && typeof end.latitude === 'number' && typeof end.longitude === 'number';
  }).map(v => {
    const end = v.enderecos[0];
    const dist = calcularDistanciaKm(userLocation.lat, userLocation.lng, end.latitude, end.longitude);
    const info = getVetIconInfo(v);
    return { ...v, dist, end, info };
  });

  // Vets filtrados pelo raio e pela modalidade (Fixo / Carro / Moto)
  const vetsNoRaio = vetsComCoords.filter(v => {
    const dentroRaio = raioKm === 0 || v.dist <= raioKm;
    if (!dentroRaio) return false;
    if (filtroModalidade === 'FIXO') return v.info.isFixo;
    if (filtroModalidade === 'CARRO') return v.info.isCarro;
    if (filtroModalidade === 'MOTO') return v.info.isMoto;
    return true;
  });

  // Tenta obter localização real do usuário ao carregar
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setUserCity('Sua Localização Atual');
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  // Inicializa o Leaflet no cliente com Google Maps oficial
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Camada de Azulejos Google Maps oficial (Zero marca d'água)
      const currentConfig = MAP_STYLES[mapStyle];
      const tileLayer = L.tileLayer(currentConfig.url, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: currentConfig.attribution
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Círculo de Raio do Usuário
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: raioKm * 1000,
        color: '#147A44',
        fillColor: '#147A44',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '5, 7'
      }).addTo(map);
      circleInstanceRef.current = circle;

      // Grupos de Camadas Ordenados
      const coverageLayer = L.layerGroup().addTo(map);
      coverageLayerRef.current = coverageLayer;

      const heatmapLayer = L.layerGroup().addTo(map);
      heatmapLayerRef.current = heatmapLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Marcador do Usuário (Ponto Azul Pulsante)
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s infinite;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Você está aqui</b><br><span style="font-size: 11px; color: #64748b;">Ponto central de busca</span>');

      userMarkerRef.current = userMarker;

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Alterna o estilo do mapa (Google Ruas, Satélite, Relevo)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    async function changeTileLayer() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const config = MAP_STYLES[mapStyle];
      const newLayer = L.tileLayer(config.url, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: config.attribution
      }).addTo(map);

      newLayer.bringToBack();
      tileLayerRef.current = newLayer;
    }

    changeTileLayer();
  }, [mapStyle, mapReady]);

  // Atualiza marcadores, círculos de cobertura e mapa térmico
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    async function updateLayers() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // 1. Atualiza Posição do Usuário
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }

      // 2. Atualiza Raio do Usuário
      if (circleInstanceRef.current) {
        if (raioKm > 0) {
          circleInstanceRef.current.setLatLng([userLocation.lat, userLocation.lng]);
          circleInstanceRef.current.setRadius(raioKm * 1000);
          if (!map.hasLayer(circleInstanceRef.current)) {
            circleInstanceRef.current.addTo(map);
          }
        } else {
          map.removeLayer(circleInstanceRef.current);
        }
      }

      // 3. Círculos e Áreas de Cobertura de Atendimento dos Vets
      if (coverageLayerRef.current) {
        coverageLayerRef.current.clearLayers();

        if (mostrarAreas) {
          vetsNoRaio.forEach((vet) => {
            const isSelected = selectedVet?.id === vet.id;
            const raioMetros = (vet.info.raioAtendimentoKm || 10) * 1000;

            const circleArea = L.circle([vet.end.latitude, vet.end.longitude], {
              radius: raioMetros,
              color: vet.info.color,
              fillColor: vet.info.color,
              fillOpacity: isSelected ? 0.16 : 0.04,
              weight: isSelected ? 2.5 : 1,
              dashArray: isSelected ? '4, 4' : '3, 6'
            }).addTo(coverageLayerRef.current);

            if (isSelected) {
              circleArea.bindTooltip(`Área de Cobertura: até ${vet.info.raioAtendimentoKm} km`, {
                permanent: false,
                direction: 'top'
              });
            }
          });
        }
      }

      // 4. Modo Mapa Térmico (Heatmap por Concentração e Densidade)
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.clearLayers();

        if (modoVisualizacao === 'TERMAL') {
          vetsNoRaio.forEach((vet) => {
            // Anel externo de difusão térmica (Verde)
            L.circle([vet.end.latitude, vet.end.longitude], {
              radius: 4200,
              stroke: false,
              fillColor: '#10b981',
              fillOpacity: 0.12
            }).addTo(heatmapLayerRef.current);

            // Anel intermediário de calor (Âmbar/Laranja)
            L.circle([vet.end.latitude, vet.end.longitude], {
              radius: 2400,
              stroke: false,
              fillColor: '#f59e0b',
              fillOpacity: 0.22
            }).addTo(heatmapLayerRef.current);

            // Núcleo de alta intensidade térmica (Vermelho/Rosa)
            L.circle([vet.end.latitude, vet.end.longitude], {
              radius: 950,
              stroke: false,
              fillColor: '#ef4444',
              fillOpacity: 0.38
            }).addTo(heatmapLayerRef.current);

            // Ponto de pulso térmico no centro
            const thermalDotIcon = L.divIcon({
              className: 'thermal-dot',
              html: `
                <div style="position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <div style="position: absolute; width: 28px; height: 28px; background: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: ping 1.5s infinite;"></div>
                  <div style="width: 10px; height: 10px; background: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #ef4444;"></div>
                </div>
              `,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });

            const thermalMarker = L.marker([vet.end.latitude, vet.end.longitude], { icon: thermalDotIcon })
              .addTo(heatmapLayerRef.current);

            thermalMarker.on('click', () => {
              setSelectedVet(vet);
              map.flyTo([vet.end.latitude, vet.end.longitude], 14, { duration: 1 });
            });
          });
        }
      }

      // 5. Marcadores Interativos Individuais
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        if (modoVisualizacao === 'MARCADORES') {
          vetsNoRaio.forEach((vet) => {
            const isSelected = selectedVet?.id === vet.id;

            const vetIcon = L.divIcon({
              className: 'vet-pin',
              html: `
                <div style="
                  background: ${isSelected ? '#059669' : vet.info.color};
                  color: white;
                  padding: 6px 12px;
                  border-radius: 9999px;
                  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  border: 2px solid white;
                  font-family: inherit;
                  font-size: 11px;
                  font-weight: bold;
                  white-space: nowrap;
                  transform: translate(-50%, -50%);
                  cursor: pointer;
                  transition: transform 0.2s;
                ">
                  <span style="font-size: 14px;">${vet.info.emoji}</span>
                  <span>${vet.nomeCompleto.split(' ')[0]} ${vet.nomeCompleto.split(' ')[1] || ''}</span>
                </div>
              `,
              iconSize: [0, 0],
              iconAnchor: [0, 0]
            });

            const m = L.marker([vet.end.latitude, vet.end.longitude], { icon: vetIcon })
              .addTo(markersLayerRef.current);

            m.on('click', () => {
              setSelectedVet(vet);
              map.flyTo([vet.end.latitude, vet.end.longitude], 14, { duration: 1 });
            });
          });
        }
      }
    }

    updateLayers();
  }, [
    mapReady, 
    userLocation, 
    raioKm, 
    filtroModalidade, 
    vetsNoRaio.length, 
    selectedVet, 
    modoVisualizacao, 
    mostrarAreas
  ]);

  const handleRecenterGps = () => {
    if (!('geolocation' in navigator)) return;
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setUserCity('Localização GPS Detectada');
        setDetectingGps(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
        }
      },
      () => {
        setDetectingGps(false);
        alert('Não foi possível obter sua localização.');
      },
      { timeout: 10000 }
    );
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  };

  return (
    <section id="mapa-vets" className="py-14 sm:py-16 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* HEADER DA SEÇÃO DO MAPA (Texto do Pill removido conforme solicitado) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Veterinários e Clínicas no Mapa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Diferenciamos no mapa médicos em consultório fixo (🏥), atendimento de carro (🚗) ou moto (🏍️).
            </p>
          </div>

          {/* BARRA DE CONTROLES: MODALIDADE, RAIO, VISUALIZAÇÃO E GPS */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Seletor de Estilo do Mapa (Google Ruas, Satélite, Relevo) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((key) => {
                const item = MAP_STYLES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMapStyle(key)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      mapStyle === key 
                        ? 'bg-[#147A44] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden sm:inline">{item.nome}</span>
                  </button>
                );
              })}
            </div>

            {/* Alternador de Modo: Marcadores vs Mapa Térmico */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setModoVisualizacao('MARCADORES')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  modoVisualizacao === 'MARCADORES' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>📍</span>
                <span className="hidden sm:inline">Marcadores</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao('TERMAL')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  modoVisualizacao === 'TERMAL' 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🔥</span>
                <span>Mapa Térmico</span>
              </button>
            </div>

            {/* Alternador de Círculos / Áreas de Cobertura */}
            <button
              type="button"
              onClick={() => setMostrarAreas(!mostrarAreas)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                mostrarAreas 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Mostrar ou ocultar círculos de cobertura de atendimento dos veterinários"
            >
              <span>⭕</span>
              <span className="hidden sm:inline">{mostrarAreas ? 'Círculos: Ativos' : 'Círculos: Ocultos'}</span>
            </button>

            {/* Filtros por Modalidade */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setFiltroModalidade('TODOS')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filtroModalidade === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroModalidade('FIXO')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filtroModalidade === 'FIXO' ? 'bg-[#147A44] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🏥 Fixo
              </button>
              <button
                type="button"
                onClick={() => setFiltroModalidade('CARRO')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filtroModalidade === 'CARRO' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🚗 Carro
              </button>
              <button
                type="button"
                onClick={() => setFiltroModalidade('MOTO')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filtroModalidade === 'MOTO' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🏍️ Moto
              </button>
            </div>

            {/* Raio em KM */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              {[5, 15, 30, 0].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => {
                    setRaioKm(km);
                    if (mapInstanceRef.current) {
                      const zoom = km === 5 ? 14 : km === 15 ? 12 : km === 30 ? 11 : 10;
                      mapInstanceRef.current.setZoom(zoom);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    raioKm === km
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {km === 0 ? 'Sem limite' : `${km} km`}
                </button>
              ))}
            </div>

            {/* Botão Meu Local */}
            <button
              type="button"
              onClick={handleRecenterGps}
              disabled={detectingGps}
              className="px-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 text-emerald-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {detectingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {detectingGps ? 'Localizando...' : 'Meu Local'}
            </button>

          </div>
        </div>

        {/* CONTAINER DO MAPA (SUPORTA MODO TELA CHEIA) */}
        <div 
          className={`relative w-full transition-all duration-300 ${
            isFullScreen 
              ? 'fixed inset-0 z-50 rounded-none h-screen w-screen bg-slate-900' 
              : 'h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100'
          }`}
        >
          
          {/* MAPA INTERATIVO LEAFLET */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* BADGE DE CONTAGEM NO CANTO SUPERIOR ESQUERDO */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {vetsNoRaio.length} veterinário(s) {raioKm > 0 ? `até ${raioKm} km` : 'no mapa'}
            </span>
          </div>

          {/* BOTÃO MAXIMIZAR / TELA CHEIA NO CANTO SUPERIOR DIREITO */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
            title={isFullScreen ? 'Sair da Tela Cheia' : 'Expandir para Tela Cheia'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* LEGENDA DO MAPA TÉRMICO (EXIBIDA QUANDO MODO TERMAL ESTIVER ATIVO) */}
          {modoVisualizacao === 'TERMAL' && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xl text-xs flex items-center gap-3">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-600" /> Densidade:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600">Dispersa</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-600">Moderada</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-bold text-rose-600">Alta Concentração</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD FLUTUANTE DO VETERINÁRIO SELECIONADO (LATERAL DIREITA) */}
          {selectedVet && (
            <div className="absolute bottom-4 right-4 z-10 max-w-sm w-full bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedVet.fotoPerfilUrl ? (
                    <img
                      src={selectedVet.fotoPerfilUrl}
                      alt={selectedVet.nomeCompleto}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {selectedVet.nomeCompleto.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {selectedVet.nomeCompleto}
                      </h4>
                      <span title="CRMV Verificado no CFMV">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${selectedVet.info?.bgClass || 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {selectedVet.info?.label || 'Atendimento Veterinário'}
                      </span>
                      <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        📍 a {selectedVet.dist} km
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVet(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Endereço e comodidades */}
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <p className="truncate">
                  {selectedVet.end.logradouro}, {selectedVet.end.numero} - {selectedVet.end.bairro}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                  {selectedVet.atende24h && (
                    <span className="flex items-center gap-1 text-rose-600">
                      <Clock className="w-3 h-3" /> Plantão 24h
                    </span>
                  )}
                  {selectedVet.atendeDomiciliar && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Home className="w-3 h-3" /> Domicílio
                    </span>
                  )}
                  {selectedVet.info.raioAtendimentoKm && (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CircleDot className="w-3 h-3" /> Cobertura até {selectedVet.info.raioAtendimentoKm} km
                    </span>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/55${selectedVet.whatsapp.replace(/\D/g, '')}?text=Olá%20Dr(a).%20${encodeURIComponent(selectedVet.nomeCompleto)},%20encontrei%20seu%20perfil%20no%20mapa%20do%20VetBra.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <Link
                  href={`/vets/${selectedVet.slug}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  Ver Perfil <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

