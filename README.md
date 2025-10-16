# 📻 AppStream - Aplicativo de Rádio Online

Um aplicativo React Native moderno para reprodução de rádio online, desenvolvido com Expo e TypeScript.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### Para desenvolvimento móvel:
- **Android Studio** (para emulador Android)
- **Xcode** (para simulador iOS - apenas macOS)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd AppStream
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração da API (Opcional)
Crie um arquivo `.env` na raiz do projeto para configurar sua própria chave de API:
```bash
EXPO_PUBLIC_API_KEY=sua_chave_aqui
```

### 4. Verifique a configuração
```bash
# Verificar se tudo está configurado corretamente
npm run lint
```

## 🚀 Como Executar

### Desenvolvimento
```bash
# Iniciar o servidor de desenvolvimento
npm start
# ou
npx expo start
```

### Executar em plataformas específicas
```bash
# Android
npm run android
# ou
npx expo start --android

# iOS (apenas macOS)
npm run ios
# ou
npx expo start --ios

# Web
npm run web
# ou
npx expo start --web
```

### Outros comandos úteis
```bash
# Executar linter
npm run lint

# Resetar projeto (remover código de exemplo)
npm run reset-project
```

## 🏗️ Estrutura do Projeto

```
AppStream/
├── app/                          # Navegação e telas principais
│   ├── (tabs)/                   # Telas com navegação por abas
│   │   ├── index.tsx             # Tela inicial (notícias)
│   │   ├── radio.tsx             # Player de rádio
│   │   └── noticiasRadio.tsx     # Notícias da rádio
│   ├── _layout.tsx               # Layout principal
│   └── modal.tsx                 # Modal de configurações
├── components/                   # Componentes reutilizáveis
│   ├── RadioPlayer.tsx           # Player de áudio
│   ├── NewsCard.tsx              # Card de notícias
│   ├── StreamSelector.tsx        # Seletor de estações
│   └── ui/                       # Componentes de interface
├── constants/                    # Configurações e constantes
│   ├── theme.ts                  # Cores e temas
│   └── radioConfig.ts            # Configuração da API de rádio
├── services/                     # Serviços e APIs
│   ├── radioService.ts           # Serviço de rádio
│   ├── newsService.ts            # Serviço de notícias
│   └── noticiasRadioService.ts   # Serviço de notícias da rádio
├── hooks/                        # Hooks personalizados
├── assets/                       # Imagens e recursos
└── scripts/                      # Scripts de utilitários
```

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run android` | Executa no emulador Android |
| `npm run ios` | Executa no simulador iOS |
| `npm run web` | Executa no navegador web |
| `npm run lint` | Executa o linter para verificar código |
| `npm run reset-project` | Remove código de exemplo |

## 📦 Dependências Principais

- **React Native**: Framework principal
- **Expo**: Plataforma de desenvolvimento
- **TypeScript**: Tipagem estática
- **Expo Router**: Navegação baseada em arquivos
- **Expo AV**: Reprodução de áudio
- **Axios**: Cliente HTTP
- **React Navigation**: Navegação entre telas

## 🐛 Solução de Problemas

### Problemas comuns:

1. **Erro de dependências**
   ```bash
   # Limpar cache e reinstalar
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Problemas com Expo CLI**
   ```bash
   # Atualizar Expo CLI
   npm install -g @expo/cli@latest
   ```

3. **Erro de Metro bundler**
   ```bash
   # Limpar cache do Metro
   npx expo start --clear
   ```



## 🔄 Atualizações

Para manter o projeto atualizado:
```bash
# Atualizar Expo CLI
npm install -g @expo/cli@latest

# Atualizar dependências
npx expo install --fix

# Verificar atualizações do Expo
npx expo doctor
```

---
