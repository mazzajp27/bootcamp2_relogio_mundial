// script.js
// Consome a API pública TimeAPI.io (sem chave, CORS liberado)
// Documentação: https://timeapi.io

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cqagbvncyoyzzoakvzbw.supabase.co";
const SUPABASE_KEY = "sb_publishable_K6pnLwc2OePTcoK-8VkU4g_8UV816_V";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// Nome amigável da busca atual (ex: "Tóquio, Japão"), usado ao favoritar
let nomeAtual = "";

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

  const botaoFavoritar = document.createElement("button");
  botaoFavoritar.className = "botao-favoritar";
  botaoFavoritar.textContent = "⭐ Favoritar";
  botaoFavoritar.addEventListener("click", () =>
    adicionarFavorito(nomeAtual || dados.timeZone, dados.timeZone)
  );
  areaResultado.querySelector(".cartao-relogio").appendChild(botaoFavoritar);
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

  nomeAtual = fusoDigitado
    ? fusoDigitado
    : selectCidade.options[selectCidade.selectedIndex].text;
  buscarHorario(fuso);
});

// Bônus: ao escolher uma cidade no select, já limpa o campo de texto
// para deixar claro qual fonte será usada na busca.
selectCidade.addEventListener("change", () => {
  if (selectCidade.value) {
    inputFuso.value = "";
  }
});

const listaFavoritos = document.getElementById("lista-favoritos");
const avisoFavoritos = document.getElementById("aviso-favoritos");

function mostrarAviso(texto) {
  avisoFavoritos.textContent = texto;
  setTimeout(() => (avisoFavoritos.textContent = ""), 3000);
}

async function listarFavoritos() {
  const { data, error } = await supabase
    .from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error(error);
    listaFavoritos.innerHTML = "";
    const li = document.createElement("li");
    li.className = "vazio";
    li.textContent = "Não foi possível carregar os favoritos.";
    listaFavoritos.appendChild(li);
    return;
  }
  renderizarFavoritos(data);
}

function renderizarFavoritos(favoritos) {
  listaFavoritos.innerHTML = "";

  if (favoritos.length === 0) {
    const li = document.createElement("li");
    li.className = "vazio";
    li.textContent = "Nenhum favorito ainda. Busque uma cidade e clique em ⭐ Favoritar.";
    listaFavoritos.appendChild(li);
    return;
  }

  favoritos.forEach((fav) => {
    const li = document.createElement("li");
    li.className = "item-favorito";

    const botaoNome = document.createElement("button");
    botaoNome.className = "favorito-nome";
    botaoNome.dataset.fuso = fav.fuso_horario;
    botaoNome.textContent = fav.nome_item;

    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "favorito-excluir";
    botaoExcluir.dataset.id = fav.id;
    botaoExcluir.title = "Remover dos favoritos";
    botaoExcluir.textContent = "🗑️";

    li.append(botaoNome, botaoExcluir);
    listaFavoritos.appendChild(li);
  });
}

async function adicionarFavorito(nome, fuso) {
  const { error } = await supabase
    .from("favoritos")
    .insert({ nome_item: nome, fuso_horario: fuso });

  if (error) {
    // 23505 = violação de UNIQUE em fuso_horario
    if (error.code === "23505") {
      mostrarAviso("Essa cidade já está nos favoritos.");
    } else {
      console.error(error);
      mostrarAviso("Não foi possível salvar o favorito.");
    }
    return;
  }

  mostrarAviso(`${nome} adicionado aos favoritos!`);
  listarFavoritos();
}

async function excluirFavorito(id) {
  const { error } = await supabase.from("favoritos").delete().eq("id", id);

  if (error) {
    console.error(error);
    mostrarAviso("Não foi possível remover o favorito.");
    return;
  }

  listarFavoritos();
}

// Um único listener na lista trata os cliques em todos os itens
listaFavoritos.addEventListener("click", (evento) => {
  const botaoNome = evento.target.closest(".favorito-nome");
  const botaoExcluir = evento.target.closest(".favorito-excluir");

  if (botaoNome) {
    nomeAtual = botaoNome.textContent;
    buscarHorario(botaoNome.dataset.fuso);
  } else if (botaoExcluir) {
    excluirFavorito(botaoExcluir.dataset.id);
  }
});

listarFavoritos(); // carrega ao abrir a página