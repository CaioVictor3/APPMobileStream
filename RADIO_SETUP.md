# Configuração do Player de Rádio

Este projeto foi adaptado do teste web para React Native, incluindo um player de rádio online.

## Funcionalidades Implementadas

### ✅ Componentes Criados
- **RadioPlayer**: Componente principal do player de rádio
- **RadioService**: Serviço para comunicação com a API de streams
- **Tela de Rádio**: Tela dedicada integrada à navegação do app

### ✅ Funcionalidades
- Busca automática de URLs de stream da API
- Reprodução de áudio em streaming
- Controles de play/pause/stop
- Tratamento de erros e fallbacks
- Interface responsiva e intuitiva
- Reprodução em segundo plano

## Configuração Necessária

### 1. Chave da API
A chave da API já está configurada no projeto:

- **Chave atual**: `AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO`
- **Arquivo de configuração**: `constants/radioConfig.ts`
- **API**: https://audieappapi.playlistsolutions.com

### 2. Variável de Ambiente (Opcional)
Para usar uma variável de ambiente, crie um arquivo `.env` na raiz do projeto:
```bash
EXPO_PUBLIC_API_KEY=AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO
```

## Como Usar

1. **Iniciar o App**: Execute `npm start` ou `expo start`
2. **Navegar para Rádio**: Toque na aba "Rádio" na navegação inferior
3. **Carregar Stream**: Toque em "Carregar Stream" para buscar a estação
4. **Reproduzir**: Use os controles para reproduzir/pausar/parar o áudio

## Estrutura dos Arquivos

```
├── components/
│   └── RadioPlayer.tsx          # Componente principal do player
├── services/
│   └── radioService.ts          # Serviço da API de rádio
├── constants/
│   └── radioConfig.ts           # Configurações da API
├── app/(tabs)/
│   └── radio.tsx                # Tela do player de rádio
└── Teste/                       # Código original do teste web
```

## Diferenças do Teste Original

### Teste Web (Teste/)
- Interface HTML/CSS/JavaScript
- Servidor Node.js com Express
- Player de áudio HTML5
- Proxy CORS para streams

### App React Native
- Interface nativa com React Native
- Serviço direto para API (sem proxy)
- Player de áudio com Expo AV
- Integração com navegação do app
- Reprodução em segundo plano

## Dependências Adicionadas

- `expo-av`: Para reprodução de áudio em streaming

## Próximos Passos

Para expandir o player de rádio, você pode:
- Adicionar mais estações de rádio
- Implementar favoritos
- Adicionar equalizador
- Criar playlists
- Implementar busca de estações
