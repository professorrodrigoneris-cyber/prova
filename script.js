// ==========================================
// ESTADO GLOBAL DO APLICATIVO
// ==========================================
let disciplinas = []; // [ [ID, Disciplina, Turma, Professor, Eletiva] ]
let disciplinasSelecionadas = []; // [ [ID, Disciplina, Turma, Professor, Eletiva] ]
let montadorLista = []; // [ [ID, Data, App, Disc, Turma, Prof, Obs] ]
let idEdicaoDisc = null;
let idEdicaoMont = null;
let dataDisponiveis = [];

// ==========================================
// NAVEGAÇÃO DE ABAS
// ==========================================
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function getUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==========================================
// TAB: DISCIPLINAS
// ==========================================

// Importar CSV
document.getElementById('import-disciplinas').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
        complete: function(results) {
            let data = results.data.filter(row => row.length >= 5);
            // Ignore header if present
            if (data[0] && data[0][1] === "Disciplina") {
                data.shift();
            }
            disciplinas = data.map(r => [r[0], r[1], r[2], r[3], r[4]]);
            renderizarTabelaDisciplinas();
            carregarSelecaoUI();
        }
    });
});

function limparTabelaDisciplinas() {
    disciplinas = [];
    disciplinasSelecionadas = [];
    renderizarTabelaDisciplinas();
    carregarSelecaoUI();
}

function salvarDisciplinasCSV() {
    if(disciplinas.length === 0) return alert("Nada para salvar.");
    let header = ["ID", "Disciplina", "Turma", "Professor", "Eletiva"];
    let csv = Papa.unparse({ fields: header, data: disciplinas });
    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    saveAs(blob, "disciplinas.csv");
}

function renderizarTabelaDisciplinas() {
    const tbody = document.getElementById("tbody-disciplinas");
    tbody.innerHTML = "";
    disciplinas.forEach(d => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d[0] || ""}</td>
            <td>${d[1] || ""}</td>
            <td>${d[2] || ""}</td>
            <td>${d[3] || ""}</td>
            <td>${d[4] || ""}</td>
        `;
        tr.onclick = () => selecionarDisciplinaParaEdicao(d, tr);
        tbody.appendChild(tr);
    });
}

function selecionarDisciplinaParaEdicao(d, trElement) {
    document.querySelectorAll('#tbody-disciplinas tr').forEach(r => r.classList.remove('selected'));
    trElement.classList.add('selected');
    
    idEdicaoDisc = d[0];
    document.getElementById("disc-id").value = d[0];
    document.getElementById("disc-nome").value = d[1];
    document.getElementById("disc-turma").value = d[2];
    document.getElementById("disc-prof").value = d[3];
    document.getElementById("disc-eletiva").value = d[4];

    document.getElementById("btn-salvar-disc").innerText = "Atualizar / Modificar";
    document.getElementById("btn-salvar-disc").classList.remove("btn-primary");
    document.getElementById("btn-salvar-disc").classList.add("btn-danger");
    document.getElementById("btn-cancel-disc").classList.remove("hidden");
}

function cancelarEdicaoDisc() {
    idEdicaoDisc = null;
    document.getElementById("disc-id").value = "";
    document.getElementById("disc-nome").value = "";
    document.getElementById("disc-turma").value = "";
    document.getElementById("disc-prof").value = "";
    document.getElementById("disc-eletiva").selectedIndex = 0;
    
    document.getElementById("btn-salvar-disc").innerText = "Adicionar Disciplina";
    document.getElementById("btn-salvar-disc").classList.add("btn-primary");
    document.getElementById("btn-salvar-disc").classList.remove("btn-danger");
    document.getElementById("btn-cancel-disc").classList.add("hidden");
    
    document.querySelectorAll('#tbody-disciplinas tr').forEach(r => r.classList.remove('selected'));
}

function adicionarOuSalvarDisciplina() {
    let nome = document.getElementById("disc-nome").value.trim();
    let turma = document.getElementById("disc-turma").value.trim();
    let prof = document.getElementById("disc-prof").value.trim();
    let elet = document.getElementById("disc-eletiva").value;

    if (!nome || !turma || !prof) return alert("Preencha todos os campos obrigatórios.");

    if (idEdicaoDisc) {
        // Atualiza existing
        for (let i = 0; i < disciplinas.length; i++) {
            if (disciplinas[i][0] == idEdicaoDisc) {
                disciplinas[i] = [idEdicaoDisc, nome, turma, prof, elet];
                break;
            }
        }
    } else {
        // Adiciona novo
        disciplinas.push([getUniqueId(), nome, turma, prof, elet]);
    }

    cancelarEdicaoDisc();
    renderizarTabelaDisciplinas();
    carregarSelecaoUI();
}

// ==========================================
// TAB: SELEÇÃO
// ==========================================
function carregarSelecaoUI() {
    let tbodyDisp = document.getElementById("tbody-disp");
    let tbodySel = document.getElementById("tbody-sel");
    
    tbodyDisp.innerHTML = "";
    tbodySel.innerHTML = "";

    let selIds = disciplinasSelecionadas.map(d => d[0]);

    // Render Disponíveis
    disciplinas.forEach(d => {
        if (!selIds.includes(d[0])) {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${d[1]} | ${d[2]} (${d[3]})</td>
                <td><button class="btn btn-primary btn-sm" onclick="selecionarDisc('${d[0]}')">+</button></td>
            `;
            tbodyDisp.appendChild(tr);
        }
    });

    // Render Selecionadas
    disciplinasSelecionadas.forEach(d => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d[1]} | ${d[2]} (${d[3]})</td>
            <td><button class="btn btn-danger btn-sm" onclick="removerSelecaoDisc('${d[0]}')">X</button></td>
        `;
        tbodySel.appendChild(tr);
    });
    
    // Atualizar UI Montador em cascata
    carregarTurmasMontador();
}

function selecionarDisc(id) {
    let disc = disciplinas.find(d => d[0] == id);
    if (disc && !disciplinasSelecionadas.find(d => d[0] == id)) {
        disciplinasSelecionadas.push([...disc]);
    }
    carregarSelecaoUI();
}

function removerSelecaoDisc(id) {
    disciplinasSelecionadas = disciplinasSelecionadas.filter(d => d[0] != id);
    carregarSelecaoUI();
}

function adicionarTodas() {
    let selIds = disciplinasSelecionadas.map(d => String(d[0]));
    disciplinas.forEach(d => {
        if (!selIds.includes(String(d[0])) && String(d[4]) !== "Sim")  {
            disciplinasSelecionadas.push([...d]);
        }
    });
    carregarSelecaoUI();
}

function removerTodasSelecao() {
    disciplinasSelecionadas = [];
    carregarSelecaoUI();
}

function addPorTurmasFiltro(turmasArr) {
    let selIds = disciplinasSelecionadas.map(d => String(d[0]));
    disciplinas.forEach(d => {
        if (turmasArr.includes(d[2]) && !selIds.includes(String(d[0]))) {
            disciplinasSelecionadas.push([...d]);
        }
    });
    carregarSelecaoUI();
}

function adicionarFund1() { addPorTurmasFiltro(["5º Ano"]); }
function adicionarFund2() { addPorTurmasFiltro(["6º Ano A", "6º Ano B", "7º Ano", "8º Ano", "9º Ano"]); }
function adicionarEnsMed() { addPorTurmasFiltro(["1º Médio", "2º Médio", "3º Médio"]); }
function adicionarEletivas() {
    let selIds = disciplinasSelecionadas.map(d => String(d[0]));
    disciplinas.forEach(d => {
        if (String(d[4]) === "Sim" && !selIds.includes(String(d[0]))) {
            disciplinasSelecionadas.push([...d]);
        }
    });
    carregarSelecaoUI();
}

// ==========================================
// TAB: MONTADOR DE PROVAS
// ==========================================

function formatDate(dateStr) {
    // Basic yyyy-mm-dd to dd/mm/yyyy
    let parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

function parseDate(dateStr) {
    // dd/mm/yyyy to Date
    let parts = dateStr.split('/');
    if(parts.length===3) return new Date(parts[2], parts[1]-1, parts[0]);
    return new Date(dateStr);
}

function atualizarListaDatas() {
    let dinicio = document.getElementById("data-inicio").value;
    let dfim = document.getElementById("data-fim").value;
    
    // Suporte aos dois formatos dependendo se o browser processou html5 date
    if (dinicio.includes('-')) dinicio = formatDate(dinicio);
    if (dfim.includes('-')) dfim = formatDate(dfim);

    if (!dinicio || !dfim) return alert("Preencha data inicial e final.");
    
    let dt1 = parseDate(dinicio);
    let dt2 = parseDate(dfim);
    
    if (dt1 > dt2) return alert("Data início maior que data fim!");

    dataDisponiveis = [];
    let curr = new Date(dt1);
    while (curr <= dt2) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) { // Exclui sáb e dom
            let strD = ("0" + curr.getDate()).slice(-2) + "/" + ("0" + (curr.getMonth()+1)).slice(-2) + "/" + curr.getFullYear();
            dataDisponiveis.push(strD);
        }
        curr.setDate(curr.getDate() + 1);
    }
    
    // Força inclusao das datas que já estão salvas na lista
    montadorLista.forEach(row => {
        if (!dataDisponiveis.includes(row[1])) dataDisponiveis.push(row[1]);
    });
    
    // Sort
    dataDisponiveis.sort((a,b) => parseDate(a) - parseDate(b));

    let comboData = document.getElementById("mont-data");
    comboData.innerHTML = "";
    dataDisponiveis.forEach(d => {
        let opt = document.createElement("option");
        opt.value = opt.innerText = d;
        comboData.appendChild(opt);
    });
    carregarTurmasMontador();
}

function getProvasAgendadasStr() {
    // Returns set-like array of [Disc, Prof, Turma] already scheduled
    return montadorLista.map(row => `${row[3]}|${row[5]}|${row[4]}`);
}

function carregarTurmasMontador() {
    let agendadas = getProvasAgendadasStr();
    let turmas = new Set();
    
    disciplinasSelecionadas.forEach(d => {
        // d: ID, Disc, Turma, Prof, Elet
        let key = `${d[1]}|${d[3]}|${d[2]}`;
        if (!agendadas.includes(key)) {
            turmas.add(d[2]);
        }
    });

    let listaTurmas = Array.from(turmas).sort();
    let comboTurma = document.getElementById("mont-turma");
    let valorAtual = comboTurma.value;
    
    comboTurma.innerHTML = "";
    listaTurmas.forEach(t => {
        let opt = document.createElement("option"); opt.value = opt.innerText = t; comboTurma.appendChild(opt);
    });

    if (listaTurmas.length === 0) {
        document.getElementById("mont-disc").innerHTML = "";
    } else {
        if (!listaTurmas.includes(valorAtual)) comboTurma.value = listaTurmas[0];
        else comboTurma.value = valorAtual;
        atualizarDisciplinasMontador();
    }
}

function atualizarDisciplinasMontador() {
    let turma = document.getElementById("mont-turma").value;
    if (!turma) return;

    let agendadas = getProvasAgendadasStr();
    let opcoes = new Set();

    disciplinasSelecionadas.forEach(d => {
        if (d[2] === turma) {
            let key = `${d[1]}|${d[3]}|${d[2]}`;
            if (!agendadas.includes(key)) {
                opcoes.add(`${d[1]} - ${d[3]}`);
            }
        }
    });

    let listaOp = Array.from(opcoes).sort();
    let comboDisc = document.getElementById("mont-disc");
    let valorDisc = comboDisc.value;

    comboDisc.innerHTML = "";
    listaOp.forEach(o => {
        let opt = document.createElement("option"); opt.value = opt.innerText = o; comboDisc.appendChild(opt);
    });

    if (listaOp.length > 0) {
        if (!listaOp.includes(valorDisc)) comboDisc.value = listaOp[0];
        else comboDisc.value = valorDisc;
    }
}

function salvarMontador() {
    let data = document.getElementById("mont-data").value;
    let app = document.getElementById("mont-app").value;
    let dtp = document.getElementById("mont-disc").value; // "Disc - Prof"
    let turma = document.getElementById("mont-turma").value;
    let obs = document.getElementById("mont-obs").value.trim();

    if (!data || !dtp || !turma) return alert("Preencha data, turma e disciplina.");

    let [disc, prof] = dtp.split(" - ");
    if(!prof) prof = "";

    // Conflitos Validations
    for (let i = 0; i < montadorLista.length; i++) {
        let salvo = montadorLista[i];
        let salvo_id = salvo[0], salvo_data = salvo[1], salvo_app = salvo[2], salvo_turma = salvo[4], salvo_prof = salvo[5];

        if (idEdicaoMont && salvo_id == idEdicaoMont) continue;

        if (salvo_data === data && salvo_turma === turma && salvo_app === app) {
            if (!obs) {
                return alert(`Conflito de Turma:\nA turma '${turma}' já possui uma prova marcada para a ${app} deste dia.\n\nInforme uma observação para permitir registrar mais de uma prova nesta mesma aplicação.`);
            }
        }

        if (salvo_data === data && salvo_prof === prof && salvo_app === app) {
            if (!obs) {
                return alert(`Atenção - Conflito de Professor:\nO professor(a) ${prof} já está aplicando prova na turma '${salvo_turma}' na ${app} deste dia.\n\nInforme uma observação (ex: Prova conjunta) para registrar outra turma.`);
            }
        }
    }

    if (idEdicaoMont) {
        for (let i = 0; i < montadorLista.length; i++) {
            if (montadorLista[i][0] == idEdicaoMont) {
                montadorLista[i] = [idEdicaoMont, data, app, disc, turma, prof, obs];
                break;
            }
        }
    } else {
        montadorLista.push([getUniqueId(), data, app, disc, turma, prof, obs]);
    }

    cancelarEdicaoMontador();
    carregarTurmasMontador();
    renderizarTabelaMontador();
}

function renderizarTabelaMontador() {
    let tbody = document.getElementById("tbody-montador");
    tbody.innerHTML = "";
    
    // Sort -> by Date then Application ID (1,2,3,4)
    let listaSorted = [...montadorLista].sort((a,b) => {
        let tA = parseDate(a[1]).getTime();
        let tB = parseDate(b[1]).getTime();
        if (tA !== tB) return tA - tB;
        let pA = parseInt(a[2]) || 0;
        let pB = parseInt(b[2]) || 0;
        return pA - pB;
    });

    listaSorted.forEach(row => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
            <td>${row[5]}</td>
            <td>${row[6] || ""}</td>
        `;
        tr.onclick = () => carregarParaEdicaoMont(row, tr);
        tbody.appendChild(tr);
    });
}

let provaSelecionadaElement = null;
let provaSelecionadaId = null;

function carregarParaEdicaoMont(row, trElement) {
    document.querySelectorAll('#tbody-montador tr').forEach(r => r.classList.remove('selected'));
    trElement.classList.add('selected');
    
    provaSelecionadaElement = trElement;
    provaSelecionadaId = row[0];

    // Popula UI para edicao
    idEdicaoMont = row[0];
    
    let comboData = document.getElementById("mont-data");
    let arrData = Array.from(comboData.options).map(o=>o.value);
    if(!arrData.includes(row[1])){
        let opt = document.createElement("option"); opt.value = opt.innerText = row[1]; comboData.appendChild(opt);
    }
    comboData.value = row[1];
    
    document.getElementById("mont-app").value = row[2];

    let comboTurma = document.getElementById("mont-turma");
    let arrTurmas = Array.from(comboTurma.options).map(o=>o.value);
    if(!arrTurmas.includes(row[4])){
        let opt = document.createElement("option"); opt.value = opt.innerText = row[4]; comboTurma.appendChild(opt);
    }
    comboTurma.value = row[4];
    atualizarDisciplinasMontador();
    
    let discProf = `${row[3]} - ${row[5]}`;
    let comboDisc = document.getElementById("mont-disc");
    let arrDisc = Array.from(comboDisc.options).map(o=>o.value);
    if(!arrDisc.includes(discProf)){
        let opt = document.createElement("option"); opt.value = opt.innerText = discProf; comboDisc.appendChild(opt);
    }
    comboDisc.value = discProf;

    document.getElementById("mont-obs").value = row[6] || "";

    document.getElementById("btn-mont-add").innerText = "Atualizar / Modificar";
    document.getElementById("btn-mont-cancel").classList.remove("hidden");
}

function cancelarEdicaoMontador() {
    idEdicaoMont = null;
    provaSelecionadaElement = null;
    provaSelecionadaId = null;
    
    document.getElementById("mont-obs").value = "";
    document.getElementById("btn-mont-add").innerText = "Adicionar à Lista";
    document.getElementById("btn-mont-cancel").classList.add("hidden");
    document.querySelectorAll('#tbody-montador tr').forEach(r => r.classList.remove('selected'));
    
    carregarTurmasMontador();
}

function removerProvaSelecionada() {
    if (!provaSelecionadaId) return alert("Selecione uma prova na lista primeiro clicando nela.");
    montadorLista = montadorLista.filter(r => r[0] != provaSelecionadaId);
    cancelarEdicaoMontador();
    carregarTurmasMontador();
    renderizarTabelaMontador();
}

// Abrir e Salvar Lista
document.getElementById('import-montador').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
        complete: function(results) {
            let data = results.data.filter(row => row.length >= 7);
            if (data[0] && data[0][1] === "Data") data.shift();
            
            montadorLista = data.map(r => [getUniqueId(), r[1], r[2], r[3], r[4], r[5], r[6]||""]);
            // Agg data entries
            dataDisponiveis = [];
            montadorLista.forEach(row => {
                if(!dataDisponiveis.includes(row[1])) dataDisponiveis.push(row[1]);
            });
            let comboData = document.getElementById("mont-data");
            comboData.innerHTML = "";
            dataDisponiveis.sort((a,b) => parseDate(a) - parseDate(b)).forEach(d => {
                let opt = document.createElement("option"); opt.value = opt.innerText = d; comboData.appendChild(opt);
            });
            
            carregarTurmasMontador();
            renderizarTabelaMontador();
            alert("Lista carregada com sucesso.");
        }
    });
});

function exportarMontadorCSV() {
    if(montadorLista.length === 0) return alert("A lista está vazia.");
    let header = ["ID", "Data", "Aplicação", "Disciplina", "Turma", "Professor", "Observação"];
    let cvsD = montadorLista.map(row => [row[0], row[1], row[2], row[3], row[4], row[5], row[6]]);
    let csv = Papa.unparse({ fields: header, data: cvsD });
    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    saveAs(blob, "Lista_Montador.csv");
}

function exportarWord() {
    if (montadorLista.length === 0) return alert("A lista está vazia.");
    try {
        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = window.docx;

        // Sort data chronologically and by application
        let listaSorted = [...montadorLista].sort((a,b) => {
            let tA = parseDate(a[1]).getTime();
            let tB = parseDate(b[1]).getTime();
            if (tA !== tB) return tA - tB;
            let pA = parseInt(a[2]) || 0;
            let pB = parseInt(b[2]) || 0;
            return pA - pB;
        });

        // Group by Date
        let mapDatas = {};
        listaSorted.forEach(row => {
            if (!mapDatas[row[1]]) mapDatas[row[1]] = [];
            mapDatas[row[1]].push(row);
        });

        let docChildren = [];

        // Title
        docChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [ new TextRun({ text: "Calendário de provas", bold: true, size: 28, font: "Arial" }) ],
                spacing: { after: 300 }
            })
        );

        function createTableCell(text, isHeader) {
            return new TableCell({
                width: { size: 16.6, type: WidthType.PERCENTAGE },
                shading: isHeader ? { fill: "B4C6E7" } : undefined,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: text, font: "Arial", size: 20 })],
                        spacing: { before: 50, after: 50 }
                    })
                ],
            });
        }

        for (const [dataChave, registros] of Object.entries(mapDatas)) {
            let tableRows = [];

            // Header Row
            tableRows.push(new TableRow({
                children: [
                    createTableCell("Data", true),
                    createTableCell("Aplicação", true),
                    createTableCell("Disciplina", true),
                    createTableCell("Turma", true),
                    createTableCell("Professor", true),
                    createTableCell("Observação", true),
                ]
            }));

            // Data Rows
            registros.forEach(row => {
                let dataVal = row[1].length > 5 ? row[1].substring(0, 5) : row[1];
                tableRows.push(new TableRow({
                    children: [
                        createTableCell(dataVal, false),
                        createTableCell(row[2], false),
                        createTableCell(row[3], false),
                        createTableCell(row[4], false),
                        createTableCell(row[5], false),
                        createTableCell(row[6] || "", false),
                    ]
                }));
            });

            const table = new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            docChildren.push(table);
            docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } })); // Spacer
        }

        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
                children: docChildren
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Calendario_Provas.docx");
        });
    } catch (e) {
        console.error(e);
        alert("Erro ao exportar Word. O framework pode não ter carregado corretamente do servidor.");
    }
}
