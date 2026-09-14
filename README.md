# Relógio Mundial

## Autor
João Pedro Venturoso Mazza — Matrícula 22302176

## Descrição
Aplicação web que exibe a hora atual, data, dia da semana e status de horário de verão de cidades ao redor do mundo. Útil para quem precisa consultar rapidamente o horário em outro fuso, seja para agendar reuniões internacionais ou simplesmente por curiosidade.

## API utilizada
- [TimeAPI.io](https://timeapi.io) — API pública e gratuita, sem necessidade de chave de autenticação
- Endpoint consumido: `GET https://timeapi.io/api/time/current/zone?timeZone={fuso_horario}`

## Funcionalidades
- Selecionar uma cidade pré-cadastrada em um menu suspenso
- Digitar manualmente qualquer fuso horário no formato IANA (ex: `Asia/Kolkata`)
- Visualizar hora atual, data, dia da semana (traduzido para português) e status de horário de verão
- Receber mensagem de erro amigável caso o fuso não seja encontrado ou a API esteja indisponível

## Como executar localmente
1. Clone o repositório: `git clone https://github.com/mazzajp27/bootcamp2_relogio_mundial.git`
2. Abra o arquivo `index.html` no navegador (ou use a extensão Live Server do VS Code)

## Links
- **Aplicação no ar (GitHub Pages):** https://mazzajp27.github.io/bootcamp2_relogio_mundial/
- **Repositório:** https://github.com/mazzajp27/bootcamp2_relogio_mundial
