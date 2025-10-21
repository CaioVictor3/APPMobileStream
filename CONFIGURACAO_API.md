# Configuração Centralizada de API

## 📋 Visão Geral

Todas as configurações de API do projeto agora estão centralizadas no arquivo `constants/radioConfig.ts`. Isso garante:

- ✅ **Configuração única**: Uma única fonte de verdade para todas as chaves e URLs de API
- ✅ **Validação automática**: O sistema valida se as configurações estão corretas antes de fazer chamadas
- ✅ **Erro visual claro**: Se a API key não estiver configurada, o app exibe um erro visual bonito
- ✅ **Código dinâmico**: Nada está fixo no código - tudo vem das configurações centralizadas

## 🔧 Estrutura da Configuração

### Arquivo: `constants/radioConfig.ts`

```typescript
export const RADIO_CONFIG = {
  // Chave de API principal (OBRIGATÓRIA)
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'SUA_CHAVE_AQUI',
  
  // Base URLs das APIs
  API_BASE_URL: 'https://audieappapi.playlistsolutions.com/api/v1',
  
  // Endpoints específicos
  URLS_ENDPOINT: '/Url',
  NEWS_ENDPOINT: '/Url',
  PROMOTIONS_ENDPOINT: '/Promotion',
  
  // Configurações de requisição
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  
  // IDs de tipos de conteúdo
  TYPE_ID: {
    RADIO_STREAM: 1,
    ONLINE_STREAM: 12,
    NEWS: 3,
  },
}
```

## 🚀 Como Configurar

### 1. Primeira vez (Novo Projeto)

Se você está configurando o projeto pela primeira vez:

```bash
# Copie o arquivo de exemplo
cp constants/radioConfigexample.ts constants/radioConfig.ts

# Edite e adicione sua API key
# Substitua 'SUA_CHAVE_API_AQUI' pela sua chave real
```

### 2. Configuração Manual

Abra `constants/radioConfig.ts` e configure:

```typescript
export const RADIO_CONFIG = {
  API_KEY: 'SUA_CHAVE_API_REAL_AQUI', // ⚠️ IMPORTANTE: Substitua isso!
  API_BASE_URL: 'https://audieappapi.playlistsolutions.com/api/v1',
  // ... resto das configurações
}
```

### 3. Usando Variáveis de Ambiente (Recomendado)

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_KEY=SUA_CHAVE_API_AQUI
```

O sistema irá usar automaticamente a variável de ambiente se disponível.

## 📝 Services Atualizados

Todos os services agora importam as configurações de `radioConfig.ts`:

### ✅ `services/newsService.ts`
- Usa `RADIO_CONFIG.API_KEY`
- Usa `RADIO_CONFIG.API_BASE_URL + RADIO_CONFIG.NEWS_ENDPOINT`
- Usa `RADIO_CONFIG.TYPE_ID.NEWS` para filtrar notícias
- Valida configuração antes de fazer chamadas

### ✅ `services/promocoesRadioService.ts`
- Usa `RADIO_CONFIG.API_KEY`
- Usa `RADIO_CONFIG.API_BASE_URL + RADIO_CONFIG.PROMOTIONS_ENDPOINT`
- Valida configuração antes de fazer chamadas

### ✅ `services/radioService.ts`
- Usa `RADIO_CONFIG.API_KEY`
- Usa `RADIO_CONFIG.API_BASE_URL + RADIO_CONFIG.URLS_ENDPOINT`
- Usa `RADIO_CONFIG.TYPE_ID.RADIO_STREAM` e `RADIO_CONFIG.TYPE_ID.ONLINE_STREAM`
- Função `getRadioCentralUrl()` agora é dinâmica (não busca estação específica)
- Valida configuração antes de fazer chamadas

## ⚠️ Validação de Configuração

O sistema valida automaticamente se a configuração está correta:

### Função: `validateApiConfig()`

```typescript
const validation = validateApiConfig();
if (!validation.isValid) {
  // Exibe erro visual bonito
  return <ApiConfigError errorMessage={validation.error} />;
}
```

### Validações Realizadas:

1. ✅ Verifica se `API_KEY` está definida
2. ✅ Verifica se `API_KEY` não é a string de exemplo
3. ✅ Verifica se `API_BASE_URL` está definida

## 🎨 Componente de Erro

### `components/ApiConfigError.tsx`

Exibe um erro visual bonito quando a configuração está incorreta:

**Características:**
- 🎨 Design bonito e profissional
- 📋 Instruções passo a passo de como corrigir
- ℹ️ Informações claras sobre o problema
- 🔧 Guia de resolução visual

## 📱 Telas Atualizadas

Todas as telas agora validam a configuração antes de carregar:

### ✅ `app/(tabs)/index.tsx` (Notícias)
### ✅ `app/(tabs)/promocoes.tsx` (Promoções)
### ✅ `app/(tabs)/radio.tsx` (Rádio)

Todas seguem o mesmo padrão:

```typescript
const [configError, setConfigError] = useState<string | null>(null);

useEffect(() => {
  const validation = validateApiConfig();
  if (!validation.isValid) {
    setConfigError(validation.error || 'Erro de configuração');
    setLoading(false);
  }
}, []);

if (configError) {
  return <ApiConfigError errorMessage={configError} />;
}
```

## 🔄 Fluxo Dinâmico da Aba de Rádio

A aba de rádio agora funciona de forma **100% dinâmica**:

### Antes (❌ Fixo):
```typescript
// Buscava uma estação específica hardcoded
const radioCentralItem = activeUrls.find(url =>
  url.description === 'Radio Central 91.9 (Hits 1964-1989)'
);
```

### Depois (✅ Dinâmico):
```typescript
// Busca todas as estações disponíveis
const radioStreams = await RadioService.getRadioStreams();

// Usa a primeira como padrão
if (radioStreams.length > 0 && !selectedStream) {
  setSelectedStream(radioStreams[0]);
}
```

**Resultado:** O sistema carrega automaticamente todas as estações disponíveis na API, sem código fixo!

## 🛠️ Mudanças Técnicas Principais

### 1. Centralização de Configurações
- ✅ Todas as API keys em um único lugar
- ✅ Todas as URLs base em um único lugar
- ✅ Todos os IDs de tipo centralizados

### 2. Validação Automática
- ✅ Validação antes de cada chamada de API
- ✅ Erro visual claro se configuração inválida
- ✅ Instruções de como corrigir

### 3. Código Dinâmico
- ✅ Nenhuma referência fixa a estações de rádio
- ✅ Nenhum ID hardcoded (usa `RADIO_CONFIG.TYPE_ID`)
- ✅ Sistema se adapta automaticamente aos dados da API

## 📚 Exemplos de Uso

### Adicionando um Novo Endpoint

```typescript
// 1. Adicione em radioConfig.ts
export const RADIO_CONFIG = {
  // ... configurações existentes
  PODCASTS_ENDPOINT: '/Podcast', // Novo endpoint
}

// 2. Use no service
import { RADIO_CONFIG } from '@/constants/radioConfig';

const API_URL = `${RADIO_CONFIG.API_BASE_URL}${RADIO_CONFIG.PODCASTS_ENDPOINT}`;
```

### Adicionando um Novo Tipo de Conteúdo

```typescript
// 1. Adicione em radioConfig.ts
TYPE_ID: {
  RADIO_STREAM: 1,
  ONLINE_STREAM: 12,
  NEWS: 3,
  PODCAST: 4, // Novo tipo
}

// 2. Use no código
const podcasts = items.filter(item => 
  item.typeId === RADIO_CONFIG.TYPE_ID.PODCAST
);
```

## 🔐 Segurança

### ⚠️ IMPORTANTE:

1. **Nunca commite** o arquivo `constants/radioConfig.ts` com chaves reais
2. Use variáveis de ambiente (`EXPO_PUBLIC_API_KEY`)
3. Adicione `constants/radioConfig.ts` ao `.gitignore`
4. Mantenha apenas `constants/radioConfigexample.ts` no Git

## 📖 Documentação Adicional

Para mais informações:
- Veja `constants/radioConfigexample.ts` para um exemplo completo
- Veja `components/ApiConfigError.tsx` para o componente de erro
- Veja qualquer service em `services/` para exemplos de uso

## ✅ Checklist de Migração

Se você está migrando de um projeto antigo:

- [ ] Copie `radioConfigexample.ts` para `radioConfig.ts`
- [ ] Configure sua `API_KEY` real
- [ ] Verifique se `API_BASE_URL` está correto
- [ ] Teste todas as telas (Notícias, Promoções, Rádio)
- [ ] Adicione `constants/radioConfig.ts` ao `.gitignore`
- [ ] Configure variáveis de ambiente se necessário

