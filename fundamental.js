// ==========================================
// ESTADO GLOBAL - FUNDAMENTAL
// ==========================================
let disciplinasSelecionadas = []; // [ [ID, Disciplina, Turma, Professor, Eletiva] ]
let montadorLista = []; // [ [ID, Data, App, Disc, Turma, Prof, Obs] ]
let idEdicaoMont = null;
let dataDisponiveis = [];

// ==========================================
// UTILITÁRIOS & INIT
// ==========================================
function getUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

window.onload = function() {
    // Usando corsproxy.io
    // Adicionado cache-buster (t=...) para garantir que pegue o dado atualizado do Google Drive
    const timestamp = new Date().getTime();
    const driveUrl = `https://drive.google.com/uc?export=download&id=1lHFJWDuw7ZFhqCbpzsDXsu0Ogsu1DEYg&t=${timestamp}`;
    const csvUrl = `https://corsproxy.io/?${encodeURIComponent(driveUrl)}`;
    
    // Fallback completo embutido (à prova de falhas offline/CORS)
    const fallbackCSV = `disciplina,turma,professor
Geografia,1º ANO A,Juliana
História,1º ANO A,Juliana
Ciências,1º ANO A,Juliana
Língua portuguesa,1º ANO A,Juliana
Matemática,1º ANO A,Juliana
Filosofia,1º ANO A,Juliana
Arte,1º ANO A,Juliana
Inglês,1º ANO A,Rodrigo
Pensamento Computacional,1º ANO A,Rodrigo
Educação Física,1º ANO A,Hérica
Geografia,1º ANO B,Jocilene
História,1º ANO B,Jocilene
Ciências,1º ANO B,Jocilene
Língua portuguesa,1º ANO B,Jocilene
Matemática,1º ANO B,Jocilene
Filosofia,1º ANO B,Jocilene
Arte,1º ANO B,Jocilene
Inglês,1º ANO B,Rodrigo
Pensamento Computacional,1º ANO B,Rodrigo
Educação Física,1º ANO B,Hérica
Geografia,2º ANO A,Josiane
História,2º ANO A,Josiane
Ciências,2º ANO A,Josiane
Língua portuguesa,2º ANO A,Josiane
Matemática,2º ANO A,Josiane
Filosofia,2º ANO A,Josiane
Arte,2º ANO A,Josiane
Inglês,2º ANO A,Rodrigo
Pensamento Computacional,2º ANO A,Rodrigo
Educação Física,2º ANO A,Hérica
Geografia,2º ANO B,Raiza
História,2º ANO B,Raiza
Ciências,2º ANO B,Raiza
Língua portuguesa,2º ANO B,Raiza
Matemática,2º ANO B,Raiza
Filosofia,2º ANO B,Raiza
Arte,2º ANO B,Raiza
Inglês,2º ANO B,Rodrigo
Pensamento Computacional,2º ANO B,Rodrigo
Educação Física,2º ANO B,Hérica
Geografia,3º ANO A,Gilma
História,3º ANO A,Gilma
Ciências,3º ANO A,Gilma
Língua portuguesa,3º ANO A,Gilma
Matemática,3º ANO A,Gilma
Filosofia,3º ANO A,Gilma
Arte,3º ANO A,Gilma
Inglês,3º ANO A,Rodrigo
Pensamento Computacional,3º ANO A,Rodrigo
Educação Física,3º ANO A,Hérica
Geografia,3º ANO B,Eline
História,3º ANO B,Eline
Ciências,3º ANO B,Eline
Língua portuguesa,3º ANO B,Eline
Matemática,3º ANO B,Eline
Filosofia,3º ANO B,Eline
Arte,3º ANO B,Eline
Inglês,3º ANO B,Rodrigo
Pensamento Computacional,3º ANO B,Rodrigo
Educação Física,3º ANO B,Hérica
Geografia,4º ANO A,Aline
História,4º ANO A,Aline
Ciências,4º ANO A,Aline
Língua portuguesa,4º ANO A,Aline
Matemática,4º ANO A,Aline
Filosofia,4º ANO A,Aline
Arte,4º ANO A,Aline
Inglês,4º ANO A,Rodrigo
Pensamento Computacional,4º ANO A,Rodrigo
Educação Física,4º ANO A,Hérica
Geografia,5º ANO A,Raphaela
História,5º ANO A,Raphaela
Ciências,5º ANO A,Raphaela
Língua portuguesa,5º ANO A,Raphaela
Matemática,5º ANO A,Raphaela
Filosofia,5º ANO A,Raphaela
Arte,5º ANO A,Raphaela
Inglês,5º ANO A,Rodrigo
Pensamento Computacional,5º ANO A,Rodrigo
Educação Física,5º ANO A,Hérica`;

    function onDataParsed(data) {
        if (data[0] && data[0][0] && data[0][0].toLowerCase() === "disciplina") {
            data.shift(); // Remove cabeçalho
        }
        disciplinasSelecionadas = [];
        data.forEach((row, index) => {
            if(row.length >= 3) {
                let id = getUniqueId() + index;
                let disc = row[0].trim();
                let turma = row[1].trim();
                let prof = row[2].trim();
                let elet = "Não"; 
                if (disc && turma && prof) {
                    disciplinasSelecionadas.push([id, disc, turma, prof, elet]);
                }
            }
        });
        carregarTurmasMontador();
    }

    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(driveUrl)}`;

    fetch(allOriginsUrl)
        .then(response => {
            if (!response.ok) throw new Error('Proxy respondeu com erro');
            return response.json();
        })
        .then(data => {
            let csvText = "";
            if (data.contents && data.contents.startsWith('data:')) {
                let base64str = data.contents.split(',')[1];
                csvText = decodeURIComponent(escape(window.atob(base64str)));
            } else if (data.contents) {
                csvText = data.contents;
            } else {
                throw new Error('Sem conteúdo no proxy');
            }
            
            Papa.parse(csvText, {
                download: false,
                header: false,
                complete: function(results) { onDataParsed(results.data); }
            });
        })
        .catch(err => {
            console.warn("Proxy CORS falhou. Usando banco de dados emergencial interno...", err);
            Papa.parse(fallbackCSV, {
                download: false,
                header: false,
                complete: function(resFallback) { onDataParsed(resFallback.data); }
            });
        });
}
// ==========================================
// MONTADOR DE PROVAS - DATAS
// ==========================================

function formatDate(dateStr) {
    let parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

function parseDate(dateStr) {
    let parts = dateStr.split('/');
    if(parts.length===3) return new Date(parts[2], parts[1]-1, parts[0]);
    return new Date(dateStr);
}

function atualizarListaDatas() {
    let dinicio = document.getElementById("data-inicio").value;
    let dfim = document.getElementById("data-fim").value;
    
    if (dinicio.includes('-')) dinicio = formatDate(dinicio);
    if (dfim.includes('-')) dfim = formatDate(dfim);

    if (!dinicio || !dfim) return alert("Preencha data inicial e final.");
    
    let dt1 = parseDate(dinicio);
    let dt2 = parseDate(dfim);
    
    if (dt1 > dt2) return alert("Data início maior que a data de fim!");

    dataDisponiveis = [];
    let curr = new Date(dt1);
    while (curr <= dt2) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) { // Exclui sáb e dom
            let strD = ("0" + curr.getDate()).slice(-2) + "/" + ("0" + (curr.getMonth()+1)).slice(-2) + "/" + curr.getFullYear();
            dataDisponiveis.push(strD);
        }
        curr.setDate(curr.getDate() + 1);
    }
    
    montadorLista.forEach(row => {
        if (!dataDisponiveis.includes(row[1])) dataDisponiveis.push(row[1]);
    });
    
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
    return montadorLista.map(row => `${row[3]}|${row[5]}|${row[4]}`);
}

function carregarTurmasMontador() {
    let agendadas = getProvasAgendadasStr();
    let turmas = new Set();
    
    disciplinasSelecionadas.forEach(d => {
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
    saveAs(blob, "Lista_Montador_Fundamental.csv");
}

function exportarWord() {
    if (montadorLista.length === 0) return alert("A lista está vazia.");
    try {
        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = window.docx;

        let listaSorted = [...montadorLista].sort((a,b) => {
            let tA = parseDate(a[1]).getTime();
            let tB = parseDate(b[1]).getTime();
            if (tA !== tB) return tA - tB;
            let pA = parseInt(a[2]) || 0;
            let pB = parseInt(b[2]) || 0;
            return pA - pB;
        });

        let mapDatas = {};
        listaSorted.forEach(row => {
            if (!mapDatas[row[1]]) mapDatas[row[1]] = [];
            mapDatas[row[1]].push(row);
        });

        let docChildren = [];

        docChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [ new TextRun({ text: "Calendário de provas - Fundamental", bold: true, size: 28, font: "Arial" }) ],
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
            docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));
        }

        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
                children: docChildren
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Calendario_Provas_Fundamental.docx");
        });
    } catch (e) {
        console.error(e);
        alert("Erro ao exportar Word. Verifique a compatibilidade do docx.");
    }
}
