# 📖 Documentação Técnica & Arquitetura do Sistema VetBra

**Plataforma:** VetBra — Portal Nacional de Veterinários & Consultórios Auditados  
**Banco de Dados:** PostgreSQL (Hospedado no Coolify) via Prisma ORM  
**Framework:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS  
**Segurança:** Criptografia de Senhas com `bcryptjs` (Salt 10 Rounds)  

---

## 1. Visão Geral da Arquitetura

O **VetBra** é um sistema SaaS de busca, credenciamento e agendamento para médicos veterinários e clínicas de todo o Brasil. O ecossistema é projetado com 4 pilares estratégicos:
1. **Segurança Anti-Fraude do CRMV:** Validação biométrica documental (Foto do CRMV + Selfie do profissional com o documento ao lado do rosto) para suprir a ausência de API pública aberta no CFMV.
2. **Telemetria de Conversão:** Computação de cada visualização de perfil e de cada clique no botão do WhatsApp (`CliqueWhatsappLog` e `contatosWhatsappCount`), permitindo ao veterinário mensurar o retorno do seu investimento no plano.
3. **Inteligência de Mercado no Banco de Dados:** Registro contínuo de buscas por CEP, bairro, cidade, tipo de pet e especialidade (`BuscaLeadLog`) para mapear a demanda de serviços veterinários por região geográfica.
4. **Geolocalização & Mobilidade (Mapa VetBra):** Filtros de distância (5, 15, 30 km ou Sem Limites) e ícones de diferenciação de transporte no mapa (Carro/PetMóvel, Ambulância Particular, Moto Vet Express, Atendimento Fixo e gancho para o futuro **VetMóvel App**).

---

## 2. Dicionário de Dados do Banco de Dados (PostgreSQL / Prisma)

### 2.1. Modelo `User` (Autenticação Segura)
Armazena as credenciais de acesso ao painel do veterinário e administradores.

| Campo | Tipo | Descrição | Regra de Segurança |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária única. | Gerado automaticamente. |
| `email` | `String` | E-mail profissional único. | `@unique`, validação de unicidade. |
| `login` | `String?` | Nome de usuário único para login alternativo ao email. | `@unique`, case-insensitive. |
| `senhaHash` | `String` | Senha do usuário criptografada. | **`bcryptjs` com salt rounds = 10**. Nunca salvo em texto puro. |
| `nome` | `String` | Nome cadastral da conta. | |
| `role` | `Enum (Role)` | Papel de acesso: `VET` ou `ADMIN`. | Padrão: `VET`. |
| `createdAt` | `DateTime` | Data e hora de criação da conta. | Padrão: `now()`. |
| `updatedAt` | `DateTime` | Data da última alteração de senha/dados. | Atualizado automaticamente. |

---

### 2.2. Modelo `Veterinario` (Perfil Profissional & Anti-Fraude)
Contém a identidade pública, parâmetros de mobilidade, status de auditoria e métricas.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária do perfil veterinário. |
| `userId` | `String` | Chave estrangeira referenciando `User.id` (relação 1:1, onDelete: Cascade). |
| `slug` | `String` | URL amigável para SEO (ex: `dr-roberto-almeida-sp-14839`). |
| `nomeCompleto` | `String` | Nome legal do profissional. **Travado contra edição no painel**. |
| `nomeSocialOuClinica` | `String?` | Nome Fantasia do consultório ou clínica. Editável pelo veterinário. |
| `cpfCnpj` | `String?` | Documento fiscal do profissional/estabelecimento. |
| `whatsapp` | `String` | Número para recebimento de consultas dos tutores. |
| `telefone` | `String?` | Telefone comercial fixo ou secundário. |
| `bio` | `String?` | Texto de apresentação e currículo do profissional. |
| `tempoExperienciaAnos`| `Int` | Anos de atuação na medicina veterinária. |
| `fotoPerfilUrl` | `String?` | **Obrigatória no cadastro**. Foto profissional com jaleco ou atendimento. |
| `bannerUrl` | `String?` | Imagem panorâmica de cabeçalho do perfil. |

#### Sub-bloco: Auditoria do CRMV & Validade
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `crmvNumero` | `String` | Número da carteira profissional. **Travado contra edição**. |
| `crmvUf` | `String` | Estado do registro (ex: SP, RJ, MG). **Travado contra edição**. |
| `crmvStatus` | `Enum` | `PENDENTE`, `VERIFICADO`, `EM_ANALISE`, `SUSPENSO`, `REJEITADO`. |
| `crmvValidade` | `DateTime?` | Data de expiração da carteira CRMV informada pelo profissional. |
| `crmvDocumentoUrl` | `String?` | Foto nítida da carteira CRMV enviada no cadastro (`/uploads/crmv/`). |
| `crmvSelfieUrl` | `String?` | **Selfie segurando o CRMV ao lado do rosto** (biometria documental). |
| `crmvAlerta30diasEnviado` | `Boolean` | Flag indicando se o alerta automático de 30 dias já foi disparado. |
| `crmvUltimaVerificacao` | `DateTime?` | Data da última checagem pela equipe de auditoria do VetBra. |
| `crmvNotasAuditoria` | `String?` | Parecer interno sobre os documentos enviados. |

#### Sub-bloco: Atendimento, Mobilidade & Mapa
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `tipoEstabelecimento` | `String` | `Clínica Fixa`, `Consultório Fixo`, `Hospital 24h`, `Atendimento Domiciliar / VetMóvel`. |
| `meiosTransporte` | `String[]` | Array com transportes: `Carro / PetMóvel`, `Carro / Ambulância`, `Moto`, `Fixo`. |
| `raioAtendimentoKm` | `Int?` | Distância máxima de atendimento: 5, 15, 30 km ou 99999 (Sem Limites). |
| `cidadeBase` | `String?` | Cidade oficial selecionada para busca e filtros de raio. |
| `estadoBase` | `String?` | UF base do atendimento. |
| `permiteVetMovelApp` | `Boolean` | Flag habilitada para futura integração com app parceiro de transporte pet. |
| `atende24h` | `Boolean` | Indica se possui plantão veterinário noturno / 24 horas. |
| `atendeDomiciliar` | `Boolean` | Indica se realiza atendimento domiciliar (Home Care). |
| `horarioFuncionamento` | `String?` | Ex: "Segunda a Sexta - 08:00 às 18:00". |
| `tiposPets` | `String[]` | Espécies atendidas: `["Cães", "Gatos", "Aves", "Silvestres"]`. |

#### Sub-bloco: Telemetria & Monetização
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `plano` | `Enum (PlanoTipo)`| `BASICO` (R$ 79,90), `PROFISSIONAL` (R$ 149,90), `PREMIUM` (R$ 299,90). |
| `statusAssinatura` | `Enum` | `ATIVO`, `PENDENTE`, `CANCELADO`, `INADIMPLENTE`. |
| `visualizacoesCount` | `Int` | Contador acumulado de acessos à página do profissional. |
| `contatosWhatsappCount`| `Int` | Contador de cliques reais no botão *"Agendar no WhatsApp"*. |

---

### 2.3. Modelo `Endereco` (Múltiplos Endereços / Filiais)
Permite cadastrar a **Base Principal** e um **Segundo Endereço (Filial / Ponto de Apoio)**.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária. |
| `veterinarioId` | `String` | Chave estrangeira para `Veterinario.id` (onDelete: Cascade). |
| `tipoEndereco` | `String` | `PRINCIPAL` ou `FILIAL`. |
| `cep` | `String` | CEP formatado (ex: `01424-001`). Preenchido via ViaCEP. |
| `logradouro` | `String` | Rua, Avenida, Alameda. |
| `numero` | `String` | **Obrigatório no cadastro**. Número do imóvel ou sala comercial. |
| `complemento` | `String?` | Apto, Sala, Bloco, Casa. |
| `bairro` | `String` | Bairro do consultório. |
| `cidade` | `String` | Cidade do endereço. |
| `estado` | `String` | UF (SP, RJ, etc.). |
| `latitude` / `longitude` | `Float?` | Coordenadas GPS para plotagem exata no mapa interativo. |
| `raioKmAtendimento` | `Int?` | Raio específico de atendimento a partir deste endereço. |

---

### 2.4. Modelo `CliqueWhatsappLog` (Rastreamento Detalhado de Conversão)
Registra cada clique efetuado por tutores nos botões de WhatsApp do site.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária do evento. |
| `veterinarioId` | `String` | Veterinário que recebeu a intenção de contato. |
| `origem` | `String` | Local do clique: `PERFIL_TOP`, `CARD_BUSCA`, `MAPA_POPUP`. |
| `ip` | `String?` | Endereço IP do visitante (anonimizado/truncado conforme LGPD). |
| `userAgent` | `String?` | Navegador e sistema do usuário (Mobile vs Desktop). |
| `cidadeTutor` | `String?` | Cidade estimada do tutor que clicou. |
| `createdAt` | `DateTime` | Data e hora exata do clique (armazenamento histórico). |

---

### 2.5. Modelo `BuscaLeadLog` (Inteligência de Mercado por CEP e Região)
Capta a intenção de busca dos tutores na plataforma para gerar relatórios estratégicos.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária da busca. |
| `termo` | `String?` | Texto pesquisado pelo usuário. |
| `cep` | `String?` | CEP de 8 dígitos consultado pelo tutor. |
| `cidade` / `estado` | `String?` | Município e UF onde há demanda de atendimento. |
| `tipoPet` | `String?` | Espécie buscada: Cão, Gato, Ave, Exótico. |
| `especialidade` | `String?` | Especialidade: Ortopedia, Oftalmo, Dermatologia, etc. |
| `ip` | `String?` | IP do visitante. |
| `createdAt` | `DateTime` | Data do registro (para gráficos de tendências sazonais). |

---

### 2.6. Modelo `FaturaCobranca` (Cobrança Pix & Boleto SaaS)
Responsável pelo fluxo de ativação dos cadastros e mensalidades.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Chave primária da fatura. |
| `veterinarioId` | `String` | Veterinário titular da cobrança. |
| `plano` | `Enum` | `BASICO`, `PROFISSIONAL` ou `PREMIUM`. |
| `valor` | `Float` | Valor em reais (R$ 79,90, R$ 149,90 ou R$ 299,90). |
| `status` | `Enum` | `PENDENTE`, `PAGO`, `EXPIRADO`, `CANCELADO`. |
| `metodo` | `Enum` | `PIX`, `BOLETO`, `CARTAO`. |
| `pixCopiaCola` | `String?` | Chave Pix no padrão EMV BR Code para pagamento instantâneo. |
| `pixQrCodeUrl` | `String?` | Imagem do QR Code Pix. |
| `boletoCodigoBarras` | `String?` | Código de barras do boleto bancário. |
| `dataVencimento` | `DateTime` | Prazo limite para liquidação. |
| `dataPagamento` | `DateTime?` | Data em que o pagamento foi identificado pelo webhook. |

---

### 2.7. Modelo `PasswordResetToken` (Recuperação de Senha)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `String (UUID)` | Identificador do token. |
| `email` | `String` | E-mail vinculado à solicitação. |
| `codigo` | `String` | **Código numérico de 6 dígitos** (enviado por e-mail ou WhatsApp). |
| `token` | `String` | Hash seguro para link direto de redefinição. |
| `expiraEm` | `DateTime` | Prazo de validade (15 minutos). |
| `usado` | `Boolean` | Impede reuso do mesmo código. |

---

## 3. Segurança Anti-Fraude & Protocolo do CRMV

Como o Conselho Federal de Medicina Veterinária (CFMV) não possui API aberta de consulta instantânea em tempo real, a VetBra adota o seguinte protocolo de segurança:

```
[Cadastro do Veterinário]
       │
       ├── 1. Upload da Carteira Profissional CRMV (Frente & Verso)
       ├── 2. Upload de Selfie segurando o CRMV ao lado do rosto (Biometria assistida)
       ├── 3. Foto de Perfil Profissional (Obrigatória)
       └── 4. Registro da Data de Validade do CRMV
              │
              ▼
[Fila de Auditoria VetBra] ────► Status Inicial: PENDENTE
       │
       ├── Equipe jurídica confere se o nome da selfie bate com o documento
       ├── Se aprovado ─────────► Status atualizado para: VERIFICADO (Selo Verde)
       └── Se reprovado ────────► Status atualizado para: REJEITADO (Notificação com motivo)
```

### Regras de Bloqueio no Painel do Veterinário
Para impedir falsidade ideológica ou transferência ilícita de contas verificadas:
- **Campos Travados na Edição:** Nome Completo, CRMV e Estado (UF) são somente-leitura (`disabled`).
- **Tentativa de Alteração não autorizada via API:** A rota `PATCH /api/dashboard/perfil` rejeita requisições com código `403 Forbidden`.
- **Alerta de 30 Dias:** O sistema calcula `validade - hoje`. Se faltarem <= 30 dias, exibe um banner/popup prioritário solicitando a nova carteira renovada.

---

## 4. Rastreamento e Inteligência de Conversão

1. **Botão do WhatsApp Telemetrizado (`src/components/WhatsAppContactButton.tsx`):**
   - Ao invés de um link fixo comum, o componente dispara uma chamada rápida assíncrona (`fetch('/api/analytics/whatsapp-click', { keepalive: true })`) antes de abrir o aplicativo do WhatsApp.
   - Incrementa o contador `contatosWhatsappCount` e salva o log com IP e horário.
2. **Visualizações do Perfil:**
   - Cada acesso à página `/vets/[slug]` incrementa atomicamente `visualizacoesCount` no banco.
3. **Painel do Profissional (`/dashboard`):**
   - O veterinário tem acesso imediato ao número de tutores que visitaram sua página e quantos efetivamente clicaram para agendar no WhatsApp, demonstrando a taxa de conversão do perfil.

---

## 5. Resumo das Rotas da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Cadastro do profissional com hash bcrypt, 2 endereços, foto e fatura Pix. |
| `POST` | `/api/auth/login` | Login seguro com validação de senha via bcrypt. |
| `POST` | `/api/auth/forgot-password` | Geração de código de 6 dígitos para recuperação via Email/WhatsApp. |
| `POST` | `/api/auth/reset-password` | Validação do código de 6 dígitos e redefinição da senha criptografada. |
| `POST` | `/api/upload` | Upload seguro de documentos do CRMV, selfies e fotos de perfil. |
| `GET` | `/api/dashboard/perfil` | Carregamento dos dados do veterinário, métricas e alerta de 30 dias do CRMV. |
| `PATCH`| `/api/dashboard/perfil` | Atualização cadastral protegida contra alteração de dados sensíveis. |
| `POST` | `/api/analytics/whatsapp-click`| Telemetria de cliques no WhatsApp para computação no dashboard. |
| `POST` | `/api/analytics/search-lead` | Registro analítico de pesquisas por CEP, cidade e tipo de pet. |
| `GET/POST`| `/api/dashboard/procedimentos`| Gestão da tabela de preços e serviços do consultório. |
| `GET/POST`| `/api/dashboard/artigos` | Publicação e gerenciamento de artigos no blog da plataforma. |

---

*Documento gerado para controle interno e auditoria do sistema VetBra.*
