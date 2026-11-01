
let movimentacoes = [];
let metas = [];

let tipoSelecionado = "";
let idEmEdicao = null;
let idMetaEmEdicao = null;

const CHAVE_ARMAZENAMENTO = "moneytrack_movimentacoes";
const CHAVE_METAS = "moneytrack_metas";

// =====================================
// ARMAZENAMENTO
// =====================================

function carregarMovimentacoes() {
    try {
        const dados = localStorage.getItem(CHAVE_ARMAZENAMENTO);
        const convertidos = dados ? JSON.parse(dados) : [];

        movimentacoes = Array.isArray(convertidos) ? convertidos : [];
    } catch (erro) {
        movimentacoes = [];
        console.error("Erro ao carregar movimentações:", erro);
    }
}

function salvarMovimentacoes() {
    try {
        localStorage.setItem(
            CHAVE_ARMAZENAMENTO,
            JSON.stringify(movimentacoes)
        );
    } catch (erro) {
        alert("Não foi possível salvar as movimentações.");
        console.error(erro);
    }
}

function carregarMetas() {
    try {
        const dados = localStorage.getItem(CHAVE_METAS);
        const convertidos = dados ? JSON.parse(dados) : [];

        metas = Array.isArray(convertidos) ? convertidos : [];
    } catch (erro) {
        metas = [];
        console.error("Erro ao carregar metas:", erro);
    }
}

function salvarMetas() {
    try {
        localStorage.setItem(
            CHAVE_METAS,
            JSON.stringify(metas)
        );
    } catch (erro) {
        alert("Não foi possível salvar as metas.");
        console.error(erro);
    }
}

// =====================================
// UTILITÁRIOS
// =====================================

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function obterDataAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// =====================================
// DASHBOARD
// =====================================

function atualizarPainel() {
    const totalReceitas = movimentacoes
        .filter(item => item.tipo === "receita")
        .reduce((total, item) => total + Number(item.valor), 0);

    const totalDespesas = movimentacoes
        .filter(item => item.tipo === "despesa")
        .reduce((total, item) => total + Number(item.valor), 0);

    const saldo = totalReceitas - totalDespesas;

    document.getElementById("saldo").textContent =
        formatarMoeda(saldo);

    document.getElementById("receitas").textContent =
        formatarMoeda(totalReceitas);

    document.getElementById("despesas").textContent =
        formatarMoeda(totalDespesas);

    atualizarEstatisticas();
    atualizarGrafico(totalReceitas, totalDespesas);
    atualizarResumoMensal();
}

function atualizarEstatisticas() {
    const quantidadeReceitas = movimentacoes.filter(
        item => item.tipo === "receita"
    ).length;

    const quantidadeDespesas = movimentacoes.filter(
        item => item.tipo === "despesa"
    ).length;

    document.getElementById("total-movimentacoes").textContent =
        movimentacoes.length;

    document.getElementById("total-receitas").textContent =
        quantidadeReceitas;

    document.getElementById("total-despesas").textContent =
        quantidadeDespesas;
}

function atualizarGrafico(receitas, despesas) {
    const maiorValor = Math.max(receitas, despesas);

    const alturaReceitas = maiorValor > 0
        ? (receitas / maiorValor) * 100
        : 0;

    const alturaDespesas = maiorValor > 0
        ? (despesas / maiorValor) * 100
        : 0;

    document.getElementById("barra-receitas").style.height =
        `${alturaReceitas}%`;

    document.getElementById("barra-despesas").style.height =
        `${alturaDespesas}%`;

    document.getElementById("valor-grafico-receitas").textContent =
        formatarMoeda(receitas);

    document.getElementById("valor-grafico-despesas").textContent =
        formatarMoeda(despesas);
}

function atualizarResumoMensal() {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();

    const nomeMes = agora.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    document.getElementById("mes-atual").textContent =
        nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    const movimentacoesDoMes = movimentacoes.filter(item => {
        if (!item.data) return false;

        const partes = item.data.split("-").map(Number);

        return partes[0] === anoAtual &&
            partes[1] === mesAtual + 1;
    });

    const receitasMes = movimentacoesDoMes
        .filter(item => item.tipo === "receita")
        .reduce((total, item) => total + Number(item.valor), 0);

    const despesasMes = movimentacoesDoMes
        .filter(item => item.tipo === "despesa")
        .reduce((total, item) => total + Number(item.valor), 0);

    document.getElementById("receitas-mes").textContent =
        formatarMoeda(receitasMes);

    document.getElementById("despesas-mes").textContent =
        formatarMoeda(despesasMes);

    document.getElementById("resultado-mes").textContent =
        formatarMoeda(receitasMes - despesasMes);
}

// =====================================
// FORMULÁRIO DE MOVIMENTAÇÕES
// =====================================

function abrirFormulario(tipo) {
    tipoSelecionado = tipo;
    idEmEdicao = null;

    document.getElementById("area-formulario").hidden = false;

    document.getElementById("titulo-formulario").textContent =
        tipo === "receita" ? "Nova receita" : "Nova despesa";

    document.getElementById("descricao-formulario").textContent =
        "Preencha as informações abaixo.";

    document.getElementById("botao-salvar").textContent = "Salvar";

    document.getElementById("formulario").reset();

    document.getElementById("area-formulario").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function editarMovimentacao(id) {
    const item = movimentacoes.find(
        movimentacao => movimentacao.id === id
    );

    if (!item) return;

    idEmEdicao = id;
    tipoSelecionado = item.tipo;

    document.getElementById("area-formulario").hidden = false;

    document.getElementById("titulo-formulario").textContent =
        "Editar movimentação";

    document.getElementById("descricao-formulario").textContent =
        "Altere as informações desejadas.";

    document.getElementById("descricao").value = item.descricao;
    document.getElementById("valor").value = item.valor;
    document.getElementById("categoria").value = item.categoria;

    document.getElementById("botao-salvar").textContent =
        "Salvar alterações";

    document.getElementById("area-formulario").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function fecharFormulario() {
    document.getElementById("area-formulario").hidden = true;
    document.getElementById("formulario").reset();

    tipoSelecionado = "";
    idEmEdicao = null;
}

function excluirMovimentacao(id) {
    if (!confirm("Tem certeza de que deseja excluir esta movimentação?")) {
        return;
    }

    movimentacoes = movimentacoes.filter(item => item.id !== id);

    salvarMovimentacoes();
    atualizarPainel();
    atualizarHistorico();
}

function criarBotao(texto, classe, acao) {
    const botao = document.createElement("button");

    botao.textContent = texto;
    botao.className = classe;
    botao.type = "button";
    botao.addEventListener("click", acao);

    return botao;
}

function atualizarHistorico() {
    const historico = document.getElementById("historico");
    historico.innerHTML = "";

    if (movimentacoes.length === 0) {
        historico.textContent = "Nenhuma movimentação cadastrada.";
        return;
    }

    movimentacoes.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movimentacao";

        const informacoes = document.createElement("div");
        informacoes.className = "informacoes-movimentacao";

        const descricao = document.createElement("strong");
        descricao.textContent = item.descricao;

        const categoria = document.createElement("span");
        categoria.textContent = item.categoria;

        const valor = document.createElement("strong");
        valor.textContent =
            `${item.tipo === "receita" ? "+" : "-"} ${formatarMoeda(item.valor)}`;

        valor.className =
            item.tipo === "receita" ? "valor-receita" : "valor-despesa";

        informacoes.appendChild(descricao);
        informacoes.appendChild(categoria);
        informacoes.appendChild(valor);

        const acoes = document.createElement("div");
        acoes.className = "acoes-movimentacao";

        acoes.appendChild(criarBotao(
            "Editar",
            "botao-editar",
            () => editarMovimentacao(item.id)
        ));

        acoes.appendChild(criarBotao(
            "Excluir",
            "botao-excluir",
            () => excluirMovimentacao(item.id)
        ));

        linha.appendChild(informacoes);
        linha.appendChild(acoes);

        historico.appendChild(linha);
    });
}

// =====================================
// SISTEMA DE METAS
// =====================================

function abrirFormularioMeta() {
    idMetaEmEdicao = null;

    document.getElementById("formulario-meta").reset();

    document.getElementById("titulo-formulario-meta").textContent =
        "Nova meta";

    document.getElementById("botao-salvar-meta").textContent =
        "Salvar meta";

    document.getElementById("guardado-meta").value = "0";

    document.getElementById("area-formulario-meta").hidden = false;

    document.getElementById("area-formulario-meta").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function editarMeta(id) {
    const meta = metas.find(item => item.id === id);

    if (!meta) return;

    idMetaEmEdicao = id;

    document.getElementById("nome-meta").value = meta.nome;
    document.getElementById("valor-meta").value = meta.valor;
    document.getElementById("guardado-meta").value = meta.guardado;

    document.getElementById("titulo-formulario-meta").textContent =
        "Editar meta";

    document.getElementById("botao-salvar-meta").textContent =
        "Salvar alterações";

    document.getElementById("area-formulario-meta").hidden = false;

    document.getElementById("area-formulario-meta").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function fecharFormularioMeta() {
    document.getElementById("area-formulario-meta").hidden = true;
    document.getElementById("formulario-meta").reset();

    idMetaEmEdicao = null;
}

function excluirMeta(id) {
    const confirmar = confirm(
        "Deseja realmente excluir esta meta?"
    );

    if (!confirmar) return;

    metas = metas.filter(meta => meta.id !== id);

    salvarMetas();
    atualizarMetas();
}

function atualizarMetas() {
    const lista = document.getElementById("lista-metas");

    lista.innerHTML = "";

    if (metas.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.className = "mensagem-metas";
        mensagem.textContent =
            "Você ainda não possui metas cadastradas.";

        lista.appendChild(mensagem);
        return;
    }

    metas.forEach(meta => {
        const valor = Number(meta.valor);
        const guardado = Number(meta.guardado);

        const percentual = Math.min(
            Math.max((guardado / valor) * 100, 0),
            100
        );

        const falta = Math.max(valor - guardado, 0);
        const concluida = guardado >= valor;

        const cartao = document.createElement("article");
        cartao.className = "cartao-meta";

        const topo = document.createElement("div");
        topo.className = "topo-meta";

        const nome = document.createElement("h3");
        nome.textContent = meta.nome;

        const status = document.createElement("span");
        status.className = concluida
            ? "status-meta concluida"
            : "status-meta";

        status.textContent = concluida
            ? "Concluída"
            : "Em andamento";

        topo.appendChild(nome);
        topo.appendChild(status);

        const valores = document.createElement("div");
        valores.className = "valores-meta";

        const guardadoTexto = document.createElement("strong");
        guardadoTexto.textContent = formatarMoeda(guardado);

        const objetivoTexto = document.createElement("span");
        objetivoTexto.textContent =
            `de ${formatarMoeda(valor)}`;

        valores.appendChild(guardadoTexto);
        valores.appendChild(objetivoTexto);

        const trilho = document.createElement("div");
        trilho.className = "progresso-meta";

        const preenchimento = document.createElement("div");
        preenchimento.className = "progresso-meta-preenchido";
        preenchimento.style.width = `${percentual}%`;

        trilho.appendChild(preenchimento);

        const percentualTexto = document.createElement("p");
        percentualTexto.className = "percentual-meta";
        percentualTexto.textContent =
            `${percentual.toFixed(1).replace(".", ",")}% alcançado`;

        const restante = document.createElement("p");
        restante.className = "restante-meta";

        restante.textContent = concluida
            ? "Você alcançou seu objetivo!"
            : `Faltam ${formatarMoeda(falta)} para alcançar sua meta.`;

        const acoes = document.createElement("div");
        acoes.className = "acoes-meta";

        acoes.appendChild(criarBotao(
            "Editar",
            "botao-editar",
            () => editarMeta(meta.id)
        ));

        acoes.appendChild(criarBotao(
            "Excluir",
            "botao-excluir",
            () => excluirMeta(meta.id)
        ));

        cartao.appendChild(topo);
        cartao.appendChild(valores);
        cartao.appendChild(trilho);
        cartao.appendChild(percentualTexto);
        cartao.appendChild(restante);
        cartao.appendChild(acoes);

        lista.appendChild(cartao);
    });
}

// =====================================
// EVENTOS
// =====================================

document.getElementById("botao-receita").addEventListener(
    "click",
    () => abrirFormulario("receita")
);

document.getElementById("botao-despesa").addEventListener(
    "click",
    () => abrirFormulario("despesa")
);

document.getElementById("botao-cancelar").addEventListener(
    "click",
    fecharFormulario
);

document.getElementById("formulario").addEventListener(
    "submit",
    function(evento) {
        evento.preventDefault();

        const descricao = document.getElementById("descricao")
            .value.trim();

        const valor = Number(
            document.getElementById("valor").value
        );

        const categoria = document.getElementById("categoria").value;

        if (!descricao || !Number.isFinite(valor) ||
            valor <= 0 || !categoria || !tipoSelecionado) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        if (idEmEdicao !== null) {
            const item = movimentacoes.find(
                movimentacao => movimentacao.id === idEmEdicao
            );

            if (!item) return;

            item.descricao = descricao;
            item.valor = valor;
            item.categoria = categoria;

        } else {
            movimentacoes.push({
                id: Date.now() + Math.random(),
                tipo: tipoSelecionado,
                descricao,
                valor,
                categoria,
                data: obterDataAtual()
            });
        }

        salvarMovimentacoes();
        fecharFormulario();
        atualizarPainel();
        atualizarHistorico();
    }
);

// EVENTOS DAS METAS

document.getElementById("botao-nova-meta").addEventListener(
    "click",
    abrirFormularioMeta
);

document.getElementById("botao-cancelar-meta").addEventListener(
    "click",
    fecharFormularioMeta
);

document.getElementById("formulario-meta").addEventListener(
    "submit",
    function(evento) {
        evento.preventDefault();

        const nome = document.getElementById("nome-meta")
            .value.trim();

        const valor = Number(
            document.getElementById("valor-meta").value
        );

        const guardado = Number(
            document.getElementById("guardado-meta").value
        );

        if (!nome ||
            !Number.isFinite(valor) ||
            !Number.isFinite(guardado) ||
            valor <= 0 ||
            guardado < 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

        if (idMetaEmEdicao !== null) {
            const meta = metas.find(
                item => item.id === idMetaEmEdicao
            );

            if (!meta) return;

            meta.nome = nome;
            meta.valor = valor;
            meta.guardado = guardado;

        } else {
            metas.push({
                id: Date.now() + Math.random(),
                nome,
                valor,
                guardado
            });
        }

        salvarMetas();
        fecharFormularioMeta();
        atualizarMetas();
    }
);

// =====================================
// INICIALIZAÇÃO
// =====================================

carregarMovimentacoes();
carregarMetas();

atualizarPainel();
atualizarHistorico();
atualizarMetas();
