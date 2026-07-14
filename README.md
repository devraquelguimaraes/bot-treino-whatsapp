# Bot de Registro de Treino no WhatsApp

Bot que te deixa escolher o treino do dia (A a E, conforme seu protocolo) e
registrar cada série — tipo (warm-up/feeder/top-set), repetições, carga e se
falhou — direto numa planilha do Google Sheets, organizada por semana, para
seu personal acompanhar.

Custo: **R$ 0**. Usa a API oficial do WhatsApp (Meta), que é gratuita para
esse volume de uso, e o Google Sheets, também gratuito.

## Como funciona (visão geral)

```
Você (WhatsApp) → WhatsApp Cloud API → seu servidor (Render, grátis) → Google Sheets
```

Você conversa normalmente com um número de WhatsApp. O servidor recebe a
mensagem, interpreta o que você mandou e grava a linha na aba da semana
certa na planilha.

---

## Passo 1 — Criar a planilha e a "chave" do Google (gratuito)

1. Crie uma planilha nova no [Google Sheets](https://sheets.new). Dê um nome,
   ex: "Treino Raquel - Registro de Cargas". Guarde o **ID da planilha**
   (fica na URL: `.../d/ESSE_PEDAÇO/edit`).
2. Vá em [Google Cloud Console](https://console.cloud.google.com/), crie um
   projeto novo (grátis).
3. Em "APIs e serviços" → "Biblioteca", ative a **Google Sheets API**.
4. Em "APIs e serviços" → "Credenciais" → "Criar credenciais" → **Conta de
   serviço**. Dê um nome, conclua.
5. Abra a conta de serviço criada → aba "Chaves" → "Adicionar chave" → JSON.
   Isso baixa um arquivo `credentials.json`.
6. **Compartilhe a planilha** (botão "Compartilhar") com o e-mail da conta de
   serviço (algo como `xxx@yyy.iam.gserviceaccount.com`, encontrado dentro do
   `credentials.json`), com permissão de **Editor**. Compartilhe também com o
   e-mail do seu personal (Leitor ou Editor, como preferir).
7. Converta o `credentials.json` para base64 (para colocar numa variável de
   ambiente com segurança):
   ```bash
   base64 -w0 credentials.json
   # no Mac: base64 -i credentials.json | tr -d '\n'
   ```
   Guarde essa string enorme — vai virar `GOOGLE_SERVICE_ACCOUNT_B64`.

## Passo 2 — Criar o app no WhatsApp (Meta) — gratuito

1. Acesse [developers.facebook.com](https://developers.facebook.com/) e crie
   uma conta de desenvolvedor (grátis).
2. "Meus Apps" → "Criar app" → tipo **Negócios**.
3. Dentro do app, adicione o produto **WhatsApp**.
4. A Meta te dá automaticamente um **número de teste gratuito** e um
   **token temporário** (válido por 24h) — perfeito para começar.
   Guarde o `Phone number ID` que aparece na tela.
5. Em "Números de telefone de teste", adicione **seu próprio número** como
   destinatário verificado (a Meta manda um código por WhatsApp pra
   confirmar). No modo de desenvolvimento você pode mandar mensagens
   gratuitamente para até 5 números verificados assim — o suficiente pro seu
   uso pessoal.
6. Para não precisar renovar o token a cada 24h: em "Configurações do
   negócio" → "Usuários do sistema", crie um usuário de sistema, gere um
   **token permanente** com a permissão `whatsapp_business_messaging`. Isso
   continua 100% gratuito (a cobrança da Meta só começa a partir de um volume
   de conversas muito maior do que uso pessoal gera).

## Passo 3 — Publicar o servidor gratuitamente

Você pode rodar isso de duas formas gratuitas:

**Opção simples (recomendada): Render.com free tier**
1. Suba esta pasta para um repositório no GitHub.
2. Em [render.com](https://render.com), crie um **Web Service** gratuito
   apontando para o repositório.
3. Build command: `npm install` — Start command: `npm start`.
4. Em "Environment", cole todas as variáveis do `.env.example` preenchidas
   (token do WhatsApp, phone number id, ID da planilha, o base64 da service
   account, a data de início do protocolo, e escolha uma palavra qualquer
   para `WEBHOOK_VERIFY_TOKEN`).
5. Depois do deploy, você terá uma URL pública tipo
   `https://seu-bot.onrender.com`.

   > No plano gratuito o serviço "dorme" depois de um tempo sem uso — a
   > primeira mensagem depois de um período parado pode demorar ~30s para
   > responder. Para uso pessoal isso é só um detalhe.

**Opção alternativa:** rodar na sua própria máquina/Raspberry Pi com
[ngrok](https://ngrok.com) (túnel gratuito) apontando para a porta local —
mais trabalho para manter sempre ligado.

## Passo 4 — Conectar o Webhook

1. No painel do app da Meta, vá em WhatsApp → Configuração → Webhook.
2. URL de callback: `https://seu-bot.onrender.com/webhook`
3. Verify token: o mesmo valor que você colocou em `WEBHOOK_VERIFY_TOKEN`.
4. Clique em "Verificar e salvar".
5. Inscreva-se no campo **messages**.

## Passo 5 — Testar

Mande "menu" pelo WhatsApp para o número de teste. O bot deve responder com
a lista de treinos (A a E).

---

## Como usar no dia a dia

| Você envia | O bot faz |
|---|---|
| `menu` | mostra os treinos A–E |
| `A` | mostra a lista de exercícios do Treino A |
| `2` | escolhe o exercício 2 para começar a registrar séries |
| `topset 8 40kg nao` | registra: top-set, 8 reps, 40kg, sem falha |
| `feeder 10 30kg sim` | registra uma série feeder que falhou |
| `proximo` | vai para o próximo exercício da lista |
| `voltar` | volta para a lista de exercícios |
| `resumo` | mostra as últimas séries registradas na semana |
| `fim` | encerra o registro do treino |
| `ajuda` | mostra todos os comandos |

Formato da série: `<tipo> <reps> <carga> <falhou?>`
- tipo: `warmup`, `feeder` ou `topset`
- falhou: `sim` ou `nao` (opcional)

Cada linha gravada na planilha tem: Data, Hora, Treino, Exercício, Tipo de
Série, Repetições, Carga, Falhou?. Uma aba nova é criada automaticamente
para cada semana ("Semana 1" a "Semana 8"), com base na
`PROGRAM_START_DATE` que você define no `.env`.

---

## Sobre a alternativa não-oficial (whatsapp-web.js)

Existe uma biblioteca chamada `whatsapp-web.js` que conecta direto no seu
WhatsApp pessoal via QR code, sem precisar de conta na Meta. É mais rápida
de configurar, mas **não é oficial** — ela simula o WhatsApp Web, o que viola
os termos de uso e traz risco (pequeno, mas real) de o seu número ser
banido. Por isso a abordagem acima, com a API oficial da Meta, é a
recomendada — e continua 100% gratuita para o seu volume de uso.

## Estrutura do projeto

```
bot-treino-whatsapp/
├── src/
│   ├── server.js      # servidor Express + webhook do WhatsApp
│   ├── session.js     # máquina de estados da conversa
│   ├── sheets.js      # leitura/escrita no Google Sheets
│   ├── whatsapp.js    # envio de mensagens
│   ├── workouts.js    # dados dos treinos A-E do seu protocolo
│   └── utils.js       # cálculo da semana atual do programa
├── package.json
└── .env.example
```
