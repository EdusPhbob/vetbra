export interface ProcedimentoCatalogo {
  nome: string;
  categoria: 'Consulta' | 'Vacinação' | 'Cirurgia' | 'Exame' | 'Emergência' | 'Estética';
  tempo: string;
  valorSugerido?: string;
  descricaoRapida?: string;
}

export const CATALOGO_PROCEDIMENTOS: ProcedimentoCatalogo[] = [
  // A
  { nome: 'Aplicação de Medicamentos / Injeção', categoria: 'Consulta', tempo: '15', valorSugerido: '40,00' },
  { nome: 'Aplicação de Microchip', categoria: 'Consulta', tempo: '20', valorSugerido: '120,00' },
  { nome: 'Atendimento Emergencial Noturno', categoria: 'Emergência', tempo: '45', valorSugerido: '280,00' },
  { nome: 'Avaliação Cardiológica', categoria: 'Exame', tempo: '45', valorSugerido: '220,00' },
  { nome: 'Avaliação Comportamental', categoria: 'Consulta', tempo: '60', valorSugerido: '180,00' },
  { nome: 'Avaliação Dermatológica', categoria: 'Consulta', tempo: '45', valorSugerido: '190,00' },
  { nome: 'Avaliação Nutricional e Dieta Clínica', categoria: 'Consulta', tempo: '45', valorSugerido: '160,00' },
  { nome: 'Avaliação Odontológica', categoria: 'Consulta', tempo: '30', valorSugerido: '130,00' },
  { nome: 'Avaliação Oftalmológica', categoria: 'Consulta', tempo: '45', valorSugerido: '200,00' },
  { nome: 'Avaliação Ortopédica', categoria: 'Consulta', tempo: '45', valorSugerido: '220,00' },
  { nome: 'Avaliação Pré-Anestésica', categoria: 'Consulta', tempo: '30', valorSugerido: '140,00' },
  { nome: 'Avaliação Pré-Cirúrgica', categoria: 'Consulta', tempo: '30', valorSugerido: '140,00' },

  // B
  { nome: 'Biópsia Cutânea / Lesão de Pele', categoria: 'Cirurgia', tempo: '30', valorSugerido: '250,00' },
  { nome: 'Biópsia por Punção Aspirativa (PAAF)', categoria: 'Exame', tempo: '20', valorSugerido: '180,00' },

  // C
  { nome: 'Castração de Cão Fêmea (OSH Canina)', categoria: 'Cirurgia', tempo: '90', valorSugerido: '450,00' },
  { nome: 'Castração de Cão Macho (Orquiectomia Canina)', categoria: 'Cirurgia', tempo: '60', valorSugerido: '350,00' },
  { nome: 'Castração de Gato Fêmea (OSH Felina)', categoria: 'Cirurgia', tempo: '60', valorSugerido: '320,00' },
  { nome: 'Castração de Gato Macho (Orquiectomia Felina)', categoria: 'Cirurgia', tempo: '40', valorSugerido: '220,00' },
  { nome: 'Cesariana de Emergência', categoria: 'Emergência', tempo: '120', valorSugerido: '950,00' },
  { nome: 'Citologia Auricular / Vaginal / Cutânea', categoria: 'Exame', tempo: '20', valorSugerido: '90,00' },
  { nome: 'Consulta Cardiológica Especializada', categoria: 'Consulta', tempo: '60', valorSugerido: '250,00' },
  { nome: 'Consulta Clínica Geral', categoria: 'Consulta', tempo: '30', valorSugerido: '130,00' },
  { nome: 'Consulta Dermatológica Especializada', categoria: 'Consulta', tempo: '45', valorSugerido: '220,00' },
  { nome: 'Consulta Domiciliar (Atendimento em Domicílio)', categoria: 'Consulta', tempo: '60', valorSugerido: '200,00' },
  { nome: 'Consulta Emergencial / Plantão 24h', categoria: 'Emergência', tempo: '45', valorSugerido: '250,00' },
  { nome: 'Consulta Felina (Cat Friendly)', categoria: 'Consulta', tempo: '45', valorSugerido: '160,00' },
  { nome: 'Consulta Geriátrica (Animais Idosos)', categoria: 'Consulta', tempo: '45', valorSugerido: '160,00' },
  { nome: 'Consulta Nutricional', categoria: 'Consulta', tempo: '45', valorSugerido: '160,00' },
  { nome: 'Consulta Odontológica Especializada', categoria: 'Consulta', tempo: '45', valorSugerido: '180,00' },
  { nome: 'Consulta Oftalmológica Especializada', categoria: 'Consulta', tempo: '45', valorSugerido: '220,00' },
  { nome: 'Consulta Oncológica', categoria: 'Consulta', tempo: '60', valorSugerido: '280,00' },
  { nome: 'Consulta Ortopédica Especializada', categoria: 'Consulta', tempo: '60', valorSugerido: '240,00' },
  { nome: 'Consulta Pediátrica (Primeira Consulta Filhote)', categoria: 'Consulta', tempo: '45', valorSugerido: '140,00' },
  { nome: 'Consulta Retorno', categoria: 'Consulta', tempo: '20', valorSugerido: '80,00' },
  { nome: 'Corte de Unhas e Limpeza Otológica', categoria: 'Estética', tempo: '20', valorSugerido: '60,00' },
  { nome: 'Curativo Simples / Troca de Bandagem', categoria: 'Consulta', tempo: '20', valorSugerido: '70,00' },

  // D
  { nome: 'Desobstrução Uretral Felina', categoria: 'Emergência', tempo: '60', valorSugerido: '380,00' },
  { nome: 'Drenagem de Abscesso / Hematoma', categoria: 'Cirurgia', tempo: '40', valorSugerido: '220,00' },

  // E
  { nome: 'Ecocardiograma com Doppler', categoria: 'Exame', tempo: '45', valorSugerido: '250,00' },
  { nome: 'Eletrocardiograma (ECG)', categoria: 'Exame', tempo: '30', valorSugerido: '150,00' },
  { nome: 'Endoscopia Digestiva Veterinária', categoria: 'Exame', tempo: '60', valorSugerido: '650,00' },
  { nome: 'Enucleação Ocular', categoria: 'Cirurgia', tempo: '90', valorSugerido: '800,00' },
  { nome: 'Eutanásia Assistida e Acolhimento', categoria: 'Emergência', tempo: '45', valorSugerido: '350,00' },
  { nome: 'Exame Coproparasitológico (Fezes)', categoria: 'Exame', tempo: '20', valorSugerido: '50,00' },
  { nome: 'Exame de Urina Tipo 1 (Urina I)', categoria: 'Exame', tempo: '20', valorSugerido: '60,00' },

  // F
  { nome: 'Fluidoterapia Intravenosa / Suporte', categoria: 'Emergência', tempo: '120', valorSugerido: '150,00' },

  // H
  { nome: 'Hemograma Completo com Plaquetas', categoria: 'Exame', tempo: '15', valorSugerido: '70,00' },
  { nome: 'Herniorrafia Umbilical / Inguinal', categoria: 'Cirurgia', tempo: '60', valorSugerido: '500,00' },

  // I
  { nome: 'Implante de Microchip com Cadastro', categoria: 'Consulta', tempo: '20', valorSugerido: '130,00' },
  { nome: 'Internação Clínica (Diária)', categoria: 'Emergência', tempo: '1440', valorSugerido: '280,00' },

  // L
  { nome: 'Lavagem Gástrica de Emergência', categoria: 'Emergência', tempo: '60', valorSugerido: '350,00' },
  { nome: 'Limpeza de Feridas e Debridamento', categoria: 'Cirurgia', tempo: '30', valorSugerido: '140,00' },
  { nome: 'Limpeza de Tártaro (Profilaxia com Ultrassom)', categoria: 'Cirurgia', tempo: '60', valorSugerido: '380,00' },

  // M
  { nome: 'Mastectomia Parcial / Total', categoria: 'Cirurgia', tempo: '120', valorSugerido: '850,00' },

  // O
  { nome: 'Otorrinolaringologia / Lavagem Otológica Profunda', categoria: 'Consulta', tempo: '30', valorSugerido: '120,00' },
  { nome: 'Oxigenoterapia de Emergência', categoria: 'Emergência', tempo: '60', valorSugerido: '180,00' },

  // P
  { nome: 'Painel Bioquímico Renal e Hepático', categoria: 'Exame', tempo: '20', valorSugerido: '130,00' },
  { nome: 'Parasitológico de Raspado Cutâneo', categoria: 'Exame', tempo: '20', valorSugerido: '70,00' },
  { nome: 'Parto Assistido Veterinário', categoria: 'Emergência', tempo: '120', valorSugerido: '600,00' },
  { nome: 'Perfil Geriátrico Completo (Sangue + Imagem)', categoria: 'Exame', tempo: '30', valorSugerido: '350,00' },
  { nome: 'Plantão Noturno / Emergência', categoria: 'Emergência', tempo: '45', valorSugerido: '260,00' },

  // R
  { nome: 'Raio-X Digital (Por Projeção / Região)', categoria: 'Exame', tempo: '30', valorSugerido: '140,00' },
  { nome: 'Remoção de Corpo Estranho Intestinal', categoria: 'Cirurgia', tempo: '120', valorSugerido: '1200,00' },
  { nome: 'Remoção de Nódulo / Neoplasia Cutânea', categoria: 'Cirurgia', tempo: '60', valorSugerido: '480,00' },
  { nome: 'Retirada de Pontos Cirúrgicos', categoria: 'Consulta', tempo: '15', valorSugerido: '50,00' },

  // S
  { nome: 'Sedação para Procedimentos', categoria: 'Cirurgia', tempo: '30', valorSugerido: '180,00' },
  { nome: 'Sondagem Uretral / Vesical', categoria: 'Emergência', tempo: '30', valorSugerido: '160,00' },
  { nome: 'Sutura de Ferimento / Laceração', categoria: 'Cirurgia', tempo: '40', valorSugerido: '200,00' },

  // T
  { nome: 'Teste Rápido FIV / FeLV (Gatos)', categoria: 'Exame', tempo: '15', valorSugerido: '120,00' },
  { nome: 'Teste Rápido Leishmaniose Canina', categoria: 'Exame', tempo: '15', valorSugerido: '110,00' },
  { nome: 'Teste Rápido Parvovirose / Cinomose', categoria: 'Exame', tempo: '15', valorSugerido: '110,00' },
  { nome: 'Tomografia Computadorizada Veterinária', categoria: 'Exame', tempo: '60', valorSugerido: '900,00' },
  { nome: 'Transfusão Sanguínea Felina / Canina', categoria: 'Emergência', tempo: '120', valorSugerido: '650,00' },
  { nome: 'Tratamento de Otite Clínica', categoria: 'Consulta', tempo: '30', valorSugerido: '110,00' },

  // U
  { nome: 'Ultrassonografia Abdominal Completa', categoria: 'Exame', tempo: '40', valorSugerido: '200,00' },
  { nome: 'Ultrassonografia Gestacional', categoria: 'Exame', tempo: '30', valorSugerido: '180,00' },
  { nome: 'Ultrassonografia Ocular', categoria: 'Exame', tempo: '30', valorSugerido: '180,00' },

  // V
  { nome: 'Vacina Antirrábica', categoria: 'Vacinação', tempo: '15', valorSugerido: '70,00' },
  { nome: 'Vacina Bronchiguard / Gripe Canina', categoria: 'Vacinação', tempo: '15', valorSugerido: '90,00' },
  { nome: 'Vacina Giardia (Cães)', categoria: 'Vacinação', tempo: '15', valorSugerido: '110,00' },
  { nome: 'Vacina Leishmaniose Canina', categoria: 'Vacinação', tempo: '15', valorSugerido: '160,00' },
  { nome: 'Vacina Quádrupla Felina (V4)', categoria: 'Vacinação', tempo: '20', valorSugerido: '110,00' },
  { nome: 'Vacina Quíntupla Felina (V5)', categoria: 'Vacinação', tempo: '20', valorSugerido: '130,00' },
  { nome: 'Vacina Tríplice Felina (V3)', categoria: 'Vacinação', tempo: '15', valorSugerido: '95,00' },
  { nome: 'Vacina V8 Canina (Óctupla)', categoria: 'Vacinação', tempo: '20', valorSugerido: '95,00' },
  { nome: 'Vacina V10 Canina (Décupla)', categoria: 'Vacinação', tempo: '20', valorSugerido: '110,00' },
];

export const LETRAS_ALFABETO = Array.from(
  new Set(CATALOGO_PROCEDIMENTOS.map(p => p.nome.trim()[0].toUpperCase()))
).sort();
