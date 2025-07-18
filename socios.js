// script.js

const API = "http://localhost:3000";

function openSection(section) {
  const popup = document.getElementById("popup");
  const title = document.getElementById("popup-title");
  const content = document.getElementById("popup-content");

  title.textContent = section.charAt(0).toUpperCase() + section.slice(1);

  if (section === "socio") loadSocios(content);
  else if (section === "dependentes") loadDependentes(content);
  else if (section === "pagamentos") loadPagamentos(content);

  popup.style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

//funções para carregar listagem de sócios, para criar um sócio, editar e excluir e realizar pesquisa de um sócio pelo nome

async function loadSocios(container) {
  try {
    const res = await fetch(`${API}/socios`);
    const socios = await res.json();

    container.innerHTML = `
      <h3>Lista de Sócios</h3>
      <button onclick="showSocioForm()">+ Novo Sócio</button>

      <form onsubmit="buscarSocios(event)" style="margin-top: 16px;">
        <input type="text" name="nome" placeholder="Buscar por nome" style="margin-right: 8px;">
        <button type="submit">Buscar</button>
      </form>

      <div id="resultado-socios">
        <div class="scroll-container">
          <ul class="item-list">
            ${socios.map(s => `
              <li class="item">
                <strong>${s.nome}</strong> - CPF: ${s.cpf}
                <button onclick="editSocio(${s.id})">Editar</button>
                <button onclick="deleteSocio(${s.id})">Excluir</button>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao carregar sócios.";
    console.error("Erro ao buscar sócios:", err);
  }
}


async function buscarSocios(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const params = new URLSearchParams(data);
  const container = document.getElementById("resultado-socios");

  container.innerHTML = "Buscando...";

  try {
    const res = await fetch(`${API}/socios?${params}`);
    const socios = await res.json();

    if (socios.length === 0) {
      container.innerHTML = "<p>Nenhum sócio encontrado.</p>";
      return;
    }

    container.innerHTML = `
      <div class="scroll-container">
        <ul class="item-list">
          ${socios.map(s => `
            <li class="item">
              <strong>${s.nome}</strong> - CPF: ${s.cpf}
              <button onclick="editSocio(${s.id})">Editar</button>
              <button onclick="deleteSocio(${s.id})">Excluir</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao buscar sócios.";
    console.error("Erro:", err);
  }
}

async function showSocioForm() {
  const content = document.getElementById("popup-content");

  try {
    const res = await fetch(`${API}/ocupacoes`);
    const ocupacoes = await res.json();

    const ocupacaoOptions = ocupacoes.map(o => `
      <option value="${o.id}">
        ${o.titulo} — ${o.descricao} (${o.categoria})
      </option>
    `).join('');

    content.innerHTML = `
      <h3>Novo Sócio</h3>
      <form onsubmit="createSocio(event)">
        <input name="nome" placeholder="Nome" required>
        <input name="cpf" placeholder="CPF" required>
        <input name="numero_associacao" placeholder="Número de Associação" type="number" required>
        <input name="data_nascimento" type="date" required>
        <label for="sexo">Sexo:</label>
      <select name="sexo" required>
        <option value="">Selecione o sexo</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select>
        <input name="endereco" placeholder="Endereço" required>

        <label for="ocupacao_id">Ocupação:</label>
        <select name="ocupacao_id" required>
          <option value="">Selecione uma ocupação</option>
          ${ocupacaoOptions}
        </select>

        <input name="mes_ingresso" placeholder="Mês de Ingresso" type="number" required>
        <input name="ano_ingresso" placeholder="Ano de Ingresso" type="number" required>
        <button type="submit">Salvar</button>
        <div id="erro-socio" style="color: red; margin-top: 8px;"></div>
      </form>
    `;
  } catch (err) {
    content.innerHTML = `<p>Erro ao carregar o formulário de sócio: ${err.message}</p>`;
    console.error("Erro ao buscar ocupações:", err);
  }
}

async function createSocio(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await fetch(`${API}/socios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  openSection("socio");
}

async function editSocio(id) {
  const res = await fetch(`${API}/socios/${id}`);
  if (!res.ok) {
    alert("Sócio não encontrado.");
    return;
  }

  const socio = await res.json();
  const content = document.getElementById("popup-content");

  content.innerHTML = `
    <h3>Editar Sócio</h3>
    <form onsubmit="updateSocio(event, ${id})">
      <input name="nome" value="${socio.nome}" required>
      <input name="cpf" value="${socio.cpf}" required>
      <input name="numero_associacao" value="${socio.numero_associacao}" required>
      <input name="data_nascimento" value="${socio.data_nascimento}" type="date" required>
      <label for="sexo">Sexo:</label>
      <select name="sexo" required>
        <option value="">Selecione o sexo</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select>
      <input name="endereco" value="${socio.endereco}" required>
      <input name="mes_ingresso" value="${socio.mes_ingresso}" type="number" required>
      <input name="ano_ingresso" value="${socio.ano_ingresso}" type="number" required>

      <select name="ocupacao_id" required>
        <option value="">Selecione...</option>
        ${ocupacoes.map(o => `
          <option value="${o.id}" ${socio.ocupacao_id === o.id ? "selected" : ""}>
            ${o.titulo} — ${o.descricao} (${o.categoria})
          </option>
        `).join('')}
      </select>

      <button type="submit">Salvar Alterações</button>
      <div id="erro-edicao-socio" style="color: red; margin-top: 8px;"></div>
    </form>
  `;
  
}

window.editSocio = async function(id) {
  try {
    // Busca os dados do sócio
    const resSocio = await fetch(`${API}/socios/${id}`);
    if (!resSocio.ok) {
      alert("Sócio não encontrado.");
      return;
    }
    const socio = await resSocio.json();

    // Busca a lista de ocupações
    const resOcupacoes = await fetch(`${API}/ocupacoes`);
    const ocupacoes = await resOcupacoes.json();

    // Monta as opções do select
    const ocupacaoOptions = ocupacoes.map(o => `
      <option value="${o.id}" ${socio.ocupacao_id === o.id ? "selected" : ""}>
        ${o.titulo} — ${o.descricao} (${o.categoria})
      </option>
    `).join('');

    // Formata a data
    const formatDate = date => new Date(date).toISOString().split("T")[0];

    // Renderiza o formulário
    const content = document.getElementById("popup-content");
    content.innerHTML = `
      <h3>Editar Sócio</h3>
      <form onsubmit="updateSocio(event, ${id})">
        <input name="nome" value="${socio.nome}" required>
        <input name="cpf" value="${socio.cpf}" required>
        <input name="numero_associacao" value="${socio.numero_associacao}" required>
        <input name="data_nascimento" value="${formatDate(socio.data_nascimento)}" type="date" required>
        <label for="sexo">Sexo:</label>
      <select name="sexo" required>
        <option value="">Selecione o sexo</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select>
        <input name="endereco" value="${socio.endereco}" required>

        <label for="ocupacao_id">Ocupação:</label>
        <select name="ocupacao_id" required>
          <option value="">Selecione...</option>
          ${ocupacaoOptions}
        </select>

        <input name="mes_ingresso" value="${socio.mes_ingresso}" type="number" required>
        <input name="ano_ingresso" value="${socio.ano_ingresso}" type="number" required>
        <button type="submit">Salvar Alterações</button>
        <div id="erro-edicao-socio" style="color: red; margin-top: 8px;"></div>
      </form>
    `;
  } catch (err) {
    console.error("Erro ao carregar dados do sócio:", err);
    alert("Erro ao carregar dados do sócio.");
  }
};



async function deleteSocio(id) {
  if (!confirm("Deseja excluir este sócio?")) return;
  await fetch(`${API}/socios/${id}`, { method: "DELETE" });
  openSection("socio");
}

//funções para carregar listagem de dependentes, para criar um dependente, editar e excluir e realizar pesquisa de um dependente pelo nome ou ano de nascimento


async function loadDependentes(container) {
  try {
    const res = await fetch(`${API}/dependentes`);
    const dependentes = await res.json();

    container.innerHTML = `
      <h3>Dependentes</h3>
      <button onclick="showDependenteForm()">+ Novo Dependente</button>

      <form onsubmit="buscarDependentes(event)" style="margin-top: 16px;">
        <input type="text" name="nome" placeholder="Nome do dependente" style="margin-right: 8px;">
        <input type="number" name="ano" placeholder="Ano de nascimento" style="margin-right: 8px;">
        <button type="submit">Buscar</button>
      </form>

      <div id="resultado-dependentes">
        <div class="scroll-container">
          <ul class="item-list">
            ${dependentes.map(d => `
              <li class="item">
                <strong>${d.nome}</strong> (${d.grau_parentesco}) - Titular: <em>${d.nome_socio}</em>
                <button onclick="editDependente(${d.id})">Editar</button>
                <button onclick="deleteDependente(${d.id})">Excluir</button>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao carregar dependentes.";
    console.error("Erro:", err);
  }
}

async function buscarDependentes(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const params = new URLSearchParams(data);
  const container = document.getElementById("resultado-dependentes");

  container.innerHTML = "Buscando...";

  try {
    const res = await fetch(`${API}/dependentes?${params}`);
    const dependentes = await res.json();

    if (dependentes.length === 0) {
      container.innerHTML = "<p>Nenhum dependente encontrado.</p>";
      return;
    }

    container.innerHTML = `
      <ul>
        ${dependentes.map(d => `
          <li>
            <strong>${d.nome}</strong> — Nasc.: ${formatDate(d.data_nascimento)} — Sócio: ${d.nome_socio}
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao buscar dependentes.";
    console.error("Erro:", err);
  }
}


async function showDependenteForm() {
  const content = document.getElementById("popup-content");
  const socios = await fetch(`${API}/socios`).then(r => r.json());

  content.innerHTML = `
    <h3>Novo Dependente</h3>
    <form onsubmit="createDependente(event)">
      <select name="socio_id" required>
        <option value="">Selecione o sócio</option>
        ${socios.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
      </select>

      <input name="nome" placeholder="Nome" required>
      <input name="data_nascimento" placeholder="Data de Nascimento" type="date" required>

      <label for="sexo">Sexo:</label>
      <select name="sexo" required>
        <option value="">Selecione o sexo</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select>

      <label for="grau_parentesco">Parentesco:</label>
      <select name="grau_parentesco" required>
        <option value="">Selecione o grau de parentesco</option>
        <option value="Filho(a)">Filho(a)</option>
        <option value="Pai">Pai</option>
        <option value="Mãe">Mãe</option>
        <option value="Cônjuge">Cônjuge</option>
        <option value="Irmão/Irmã">Irmão/Irmã</option>
        <option value="Avó">Avó</option>
        <option value="Avô">Avô</option>
        <option value="Neto">Neto(a)</option>
        <option value="Sobrinha(o)">Sobrinha(o)</option>
      </select>

      <input name="mes_ingresso" placeholder="Mês de Ingresso" type="number" required>
      <input name="ano_ingresso" placeholder="Ano de Ingresso" type="number" required>
      <button type="submit">Salvar</button>
      <div id="erro-dependente" style="color: red; margin-top: 8px;"></div>
    </form>
  `;
}


async function createDependente(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch(`${API}/dependentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const erro = await res.json();
      alert("Erro: " + (erro.erro || "Erro ao cadastrar dependente."));
      return;
    }

    openSection("dependentes");
  } catch (err) {
    alert("Erro de conexão ou inesperado.");
  }
}

window.editDependente = async function(id) {
  try {
    // Busca os dados do dependente
    const resDependente = await fetch(`${API}/dependentes/${id}`);
    if (!resDependente.ok) {
      alert("Dependente não encontrado.");
      return;
    }
    const dependente = await resDependente.json();

    // Busca a lista de sócios para o campo de titular
    const resSocios = await fetch(`${API}/socios`);
    const socios = await resSocios.json();

    // Monta opções do select de titulares
    const socioOptions = socios.map(s => `
      <option value="${s.id}" ${dependente.socio_id === s.id ? "selected" : ""}>
        ${s.nome}
      </option>
    `).join('');

    // Formata a data
    const formatDate = date => new Date(date).toISOString().split("T")[0];

    // Renderiza o formulário de edição
    const content = document.getElementById("popup-content");
    content.innerHTML = `
      <h3>Editar Dependente</h3>
      <form onsubmit="updateDependente(event, ${id})">
        <input name="nome" value="${dependente.nome}" required>
        <input name="data_nascimento" value="${formatDate(dependente.data_nascimento)}" type="date" required>
        <input name="sexo" value="${dependente.sexo}" required>

        <select name="grau_parentesco" required>
          <option value="">Grau de Parentesco...</option>
          <option value="Filho(a)" ${dependente.grau_parentesco === "Filho(a)" ? "selected" : ""}>Filho(a)</option>
          <option value="Cônjuge" ${dependente.grau_parentesco === "Cônjuge" ? "selected" : ""}>Cônjuge</option>
          <option value="Pai" ${dependente.grau_parentesco === "Pai" ? "selected" : ""}>Pai</option>
          <option value="Mãe" ${dependente.grau_parentesco === "Mãe" ? "selected" : ""}>Mãe</option>
          <option value="Irmão/Irmã" ${dependente.grau_parentesco === "Irmão/Irmã" ? "selected" : ""}>Irmão/Irmã</option>
          <option value="Avó" ${dependente.grau_parentesco === "Avó" ? "selected" : ""}>Avó</option>
          <option value="Avô" ${dependente.grau_parentesco === "Avô" ? "selected" : ""}>Avô</option>
          <option value="Neto" ${dependente.grau_parentesco === "Neto" ? "selected" : ""}>Neto</option>
          <option value="Sobrinha(o)" ${dependente.grau_parentesco === "Sobrinha(o)" ? "selected" : ""}>Sobrinha(o)</option>
          </select>

        <label for="socio_id">Titular:</label>
        <select name="socio_id" required>
          ${socioOptions}
        </select>

        <button type="submit">Salvar Alterações</button>
        <div id="erro-edicao-dependente" style="color: red; margin-top: 8px;"></div>
      </form>
    `;
  } catch (err) {
    console.error("Erro ao carregar dados do dependente:", err);
    alert("Erro ao carregar dados do dependente.");
  }
}



async function deleteDependente(id) {
  if (!confirm("Deseja excluir este dependente?")) return;
  await fetch(`${API}/dependentes/${id}`, { method: "DELETE" });
  openSection("dependentes");
}

// função para formatar a data 
function formatDate(dateString) {
  if (!dateString) return "Data não disponível";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR"); // Ex: 28/09/1975
}

//funções para carregar listagem de pagamentos, para criar um pagamento, editar e excluir e realizar pesquisa de um pagamento por nome do sócio ou ano
async function buscarPagamentos(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const params = new URLSearchParams(data);
  const container = document.getElementById("resultado-pagamentos");

  try {
    const res = await fetch(`${API}/pagamentos?${params}`);
    const pagamentos = await res.json();

    container.innerHTML = `
      <ul>
        ${pagamentos.map(p => {
          const valor = Number(p.valor_total) || 0;
          return `
            <li>
              <strong>${p.nome_socio}</strong> — Ano: ${p.ano} — Valor: R$ ${valor.toFixed(2)} — Pago em: ${formatDate(p.data_pagamento)}
            </li>
          `;
        }).join('')}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao buscar pagamentos.";
    console.error("Erro:", err);
  }
}

function renderPagamentoBusca(container) {
  container.innerHTML = `
    <h3>Buscar Pagamentos</h3>
    <form onsubmit="buscarPagamentos(event)">
      <input type="text" name="nome" placeholder="Nome do sócio">
      <input type="number" name="ano" placeholder="Ano de referência">
      <button type="submit">Buscar</button>
    </form>
    <div id="resultado-pagamentos"></div>
  `;
}


async function loadPagamentos(container) {
  try {
    const res = await fetch(`${API}/pagamentos`);
    const pagamentos = await res.json();

    container.innerHTML = `
    <h3>Lista de Pagamentos</h3>
    <button onclick="showPagamentoForm()">+ Novo Pagamento</button>

    <form onsubmit="buscarPagamentos(event)">
      <input type="text" name="nome" placeholder="Nome do sócio">
      <input type="number" name="ano" placeholder="Ano de referência">
      <button type="submit">Buscar</button>
    </form>

  <div id="resultado-pagamentos" class="scroll-container">
    <ul class=""item-list"">
      ${pagamentos.map(p => {
        const valor = Number(p.valor_total) || 0;
        return `
          <li class="item">
            <strong>${p.nome_socio}</strong> — Ano: ${p.ano} — Valor: R$ ${valor.toFixed(2)} — Pago em: ${formatDate(p.data_pagamento)}
            <button onclick="editPagamento(${p.id})">Editar</button>
            <button onclick="deletePagamento(${p.id})">Excluir</button>

          </li>
        `;
      }).join('')}
    </ul>
  </div>
`;

  } catch (err) {
    container.innerHTML = "Erro ao carregar pagamentos.";
    console.error("Erro ao buscar pagamentos:", err);
  }
}



window.showPagamentoForm = async function() {
  const content = document.getElementById("popup-content");

  const res = await fetch(`${API}/socios`);
  const socios = await res.json();

  const socioOptions = socios.map(s => `
    <option value="${s.id}">${s.nome}</option>
  `).join('');

  content.innerHTML = `
    <h3>Registrar Pagamento</h3>
    <form onsubmit="registrarPagamento(event)">
      <label for="socio_id">Sócio:</label>
      <select name="socio_id" required>
        <option value="">Selecione...</option>
        ${socioOptions}
      </select>

      <input name="ano" type="number" placeholder="Ano de Referência" required>
      <input type="date" name="data_nascimento">


      <button type="submit">Salvar Pagamento</button>
      <div id="erro-pagamento" style="color: red; margin-top: 8px;"></div>
    </form>
  `;
};


async function registrarPagamento(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const erroDiv = document.getElementById("erro-pagamento");
  erroDiv.textContent = "";
  

  try {
    const res = await fetch(`${API}/pagamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await res.json();


    if (!res.ok) {
      erroDiv.textContent = json.erro || "Erro ao registrar pagamento.";
      return;
    }

    erroDiv.style.color = "green";
    erroDiv.textContent = `Pagamento registrado com sucesso. Valor: R$ ${Number(json.valor_total).toFixed(2)}`;
  } catch (err) {
    erroDiv.textContent = "Erro de conexão.";
  }
}

window.editPagamento = async function(id) {
  try {
    // Busca os dados do pagamento
    const resPagamento = await fetch(`${API}/pagamentos/${id}`);
    if (!resPagamento.ok) {
      alert("Pagamento não encontrado.");
      return;
    }
    const pagamento = await resPagamento.json();

    // Busca todos os sócios para o select
    const resSocios = await fetch(`${API}/socios`);
    const socios = await resSocios.json();

    // Formata data
    const formatDate = date => new Date(date).toISOString().split("T")[0];

    // Opções do select de sócio
    const socioOptions = socios.map(s => `
      <option value="${s.id}" ${pagamento.socio_id === s.id ? "selected" : ""}>
        ${s.nome}
      </option>
    `).join("");

    const content = document.getElementById("popup-content");
    content.innerHTML = `
      <h3>Editar Pagamento</h3>
      <form onsubmit="updatePagamento(event, ${id})">
        <label for="socio_id">Sócio:</label>
        <select name="socio_id" required>
          ${socioOptions}
        </select>

        <input name="ano" type="number" value="${pagamento.ano}" required>
        <input name="valor_total" type="number" value="${pagamento.valor_total}" step="0.01" required>
        <input name="data_pagamento" type="date" value="${formatDate(pagamento.data_pagamento)}" required>

        <button type="submit">Salvar Alterações</button>
        <div id="erro-edicao-pagamento" style="color: red; margin-top: 8px;"></div>
      </form>
    `;
  } catch (err) {
    console.error("Erro ao carregar dados do pagamento:", err);
    alert("Erro ao carregar dados.");
  }
}


async function updatePagamento(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const erroDiv = document.getElementById("erro-edicao-pagamento");

  try {
    const res = await fetch(`${API}/pagamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (!res.ok) {
      erroDiv.textContent = json.erro || "Erro ao atualizar pagamento.";
      return;
    }

    alert("Pagamento atualizado com sucesso.");
    closePopup();

    // Atualiza a lista após edição
    const container = document.getElementById("resultado-pagamentos") || document.getElementById("pagamentos-container");
    loadPagamentos(container);
  } catch (err) {
    console.error("Erro ao atualizar pagamento:", err);
    erroDiv.textContent = "Erro de conexão com o servidor.";
  }
}



async function deletePagamento(id) {
  if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

  try {
    const res = await fetch(`${API}/pagamentos/${id}`, {
      method: "DELETE"
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.erro || "Erro ao excluir pagamento.");
      return;
    }

    alert("Pagamento excluído com sucesso.");
    // Recarrega a listagem após exclusão
    const container = document.getElementById("resultado-pagamentos") || document.getElementById("pagamentos-container");
    loadPagamentos(container);
  } catch (err) {
    console.error("Erro ao excluir pagamento:", err);
    alert("Erro de conexão.");
  }
}


function gerarCodigoAssociacao(socioId, ocupacaoCBO) {
  // Exemplo: CBO + ID do sócio, zero à esquerda
  const idFormatado = socioId.toString().padStart(5, "0"); // Ex: 00023
  return `${ocupacaoCBO}-${idFormatado}`; // Ex: 2410-00023
}

function validarCodigoAssociacao(codigo) {
  const regex = /^\d{4,6}-\d{5}$/;
  return regex.test(codigo); // true se estiver no formato certo
}


