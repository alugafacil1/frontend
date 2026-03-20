# 🏠 Aluga Fácil

O **Aluga Fácil** é uma plataforma moderna e intuitiva desenvolvida para simplificar a gestão e locação de imóveis. O sistema conecta agências imobiliárias, corretores, proprietários e inquilinos em um ecossistema unificado, digitalizando desde a captação do imóvel até a vitrine para o cliente final.

Equipe:
- Luann Ferreira, Inês Alessandra, Carla Daniela, Rodrigo Leandro, Lucas Messias, José Everton, Jenilson Moraes.
---

## 📋 Resumo do Sistema

A plataforma possui controle de acesso baseado em perfis (Roles) para garantir fluxos de trabalho seguros e organizados:

* **Inquilinos:** Acesso à vitrine de imóveis ativos (aba "Explorar"), visualização de detalhes (mapas, fotos, regras) e sistema de favoritos.
* **Proprietários e Corretores :** Criação de anúncios detalhados, upload de imagens e gerenciamento de status (Pausado, Alugado). Os anúncios criados por corretores entram em um fluxo de aprovação.
* **Gestão de Agência (Agency Admins):** Painel de moderação para revisar, aprovar ou rejeitar (com feedback) os imóveis cadastrados pelos corretores vinculados, além de visão geral do portfólio da agência.

## 🔗 Links Úteis

- 🌐 **Deploy da Aplicação:** [Acessar Aluga Fácil (Deploy)](https://frontend-sesu.onrender.com/)
- 📄 **Documentação:** [Acessar Docs (Google Drive)](https://drive.google.com/drive/folders/1auJ-cXFoOzSm4AAu2Qirz1wNK_vqs6i3?usp=sharing)
- 🎥 **Pitch do Projeto:** [Assistir ao Pitch](#) *(A ser adicionado)*

## 🛠️ Tecnologias Utilizadas

Este projeto foi inicializado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) e utiliza as seguintes tecnologias:

* **Framework:** [Next.js](https://nextjs.org) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** CSS Customizado e utilitários
* **Ícones:** [Heroicons](https://heroicons.com/)
* **Gerenciamento de Estado/Rotas:** React Hooks, Next Navigation
* **Integração de Mapas/Geolocalização:** Custom Hooks (`useGeolocation`, `useCep`)

## 🚀 Como rodar o projeto localmente

**1. Pré-requisitos:**
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina e o Backend (API Spring Boot) rodando localmente.

**2. Clone o repositório:**
```bash
git clone https://github.com/alugafacil1/frontend
cd aluga-facil-frontend
```

**3. Instale as dependências:**
```bash
npm install
 ou
yarn install
```

**4. Variáveis de Ambiente:**

Crie um arquivo .env na raiz do projeto se não existir e adicione a URL base da sua API:

Snippet de código
```bash
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

**5. Inicie o servidor de desenvolvimento:**
```bash
npm run dev
 ou
yarn dev
```

Abra http://localhost:3000 no seu navegador para ver o resultado. As páginas são atualizadas automaticamente conforme você edita os arquivos.

Desenvolvido com 💙 para modernizar o mercado imobiliário.
