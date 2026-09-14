// script.js
// Consome a API pública TimeAPI.io (sem chave, CORS liberado)
// Documentação: https://timeapi.io

const DIAS_SEMANA_PT = {
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

const selectCidade = document.getElementById("select-cidade");
const inputFuso = document.getElementById("input-fuso");
const botaoBuscar = document.getElementById("botao-buscar");
const areaResultado = document.getElementById("resultado");

async function buscarHorario(fuso) {
  areaResultado.innerHTML = `<p class="carregando">Carregando horário de ${fuso}...</p>`;

  try {
    const url = `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(
      fuso
    )}`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Fuso horário não encontrado ou API indisponível.");
    }

    const dados = await resposta.json();
    exibirResultado(dados);
  } catch (erro) {
    exibirErro();
  }
}

function exibirResultado(dados) {
  const diaSemanaPt = DIAS_SEMANA_PT[dados.dayOfWeek] || dados.dayOfWeek;
  const horaFormatada = `${String(dados.hour).padStart(2, "0")}:${String(
    dados.minute
  ).padStart(2, "0")}:${String(dados.seconds).padStart(2, "0")}`;

  const classeDst = dados.dstActive ? "selo-dst" : "selo-dst inativo";
  const textoDst = dados.dstActive
    ? "☀️ Horário de verão ativo"
    : "🌙 Horário de verão inativo";

  areaResultado.innerHTML = `
    <div class="cartao-relogio">
      <h2>${dados.timeZone}</h2>
      <div class="hora-grande">${horaFormatada}</div>
      <div class="info-extra">
        <span>📅 ${dados.date}</span>
        <span>${diaSemanaPt}</span>
      </div>
      <span class="${classeDst}">${textoDst}</span>
    </div>
  `;
}

function exibirErro() {
  areaResultado.innerHTML = `
    <div class="mensagem-erro">
      ⚠️ Não foi possível encontrar esse horário. Verifique o fuso digitado
      (formato IANA, ex: <strong>America/Sao_Paulo</strong>) ou tente novamente
      em instantes.
    </div>
  `;
}

botaoBuscar.addEventListener("click", () => {
  const fusoDigitado = inputFuso.value.trim();
  const fusoSelecionado = selectCidade.value;

  // Prioriza o campo de texto, se o usuário tiver digitado algo
  const fuso = fusoDigitado || fusoSelecionado;

  if (!fuso) {
    areaResultado.innerHTML = `<p class="dica">Selecione uma cidade ou digite um fuso horário antes de buscar.</p>`;
    return;
  }

  buscarHorario(fuso);
});

// Bônus: ao escolher uma cidade no select, já limpa o campo de texto
// para deixar claro qual fonte será usada na busca.
selectCidade.addEventListener("change", () => {
  if (selectCidade.value) {
    inputFuso.value = "";
  }
});
