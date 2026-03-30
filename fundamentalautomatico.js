// ==========================================
// ESTADO GLOBAL - GERADOR AUTOMÁTICO
// ==========================================
let disciplinasBase = []; // [ID, Disciplina, Turma, Professor, Eletiva]
let profsDisponiveis = {}; // "Prof": [1,2,3,4,5] (dias da semana, 1=Seg..5=Sex)
let discPrioridade = {}; // "Disc": 1 (Aplicação preferida)
let montadorLista = []; // The generated result

window.onload = function() {
    // Usando corsproxy.io por ser mais estável que allorigins
    const driveUrl = 'https://drive.google.com/uc?export=download&id=1lHFJWDuw7ZFhqCbpzsDXsu0Ogsu1DEYg';
    const csvUrl1 = 'https://corsproxy.io/?' + encodeURIComponent(driveUrl);
    
    // Fallback completo embutido (à prova de falhas offline/CORS) para formato antigo
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

    Papa.parse(csvUrl1, {
        download: true,
        header: false,
        complete: function(results) {
            processarCSVDados(results.data);
        },
        error: function(err1) {
            console.warn("Proxies do Drive bloqueados. Carregando dados de emergência internos...", err1);
            Papa.parse(fallbackCSV, {
                download: false,
                header: false,
                complete: function(res2) { processarCSVDados(res2.data); }
            });
        }
    });
}

function processarCSVDados(data) {
    let isNovoFormato = false;
    
    // Verifica formato: [ID, Disciplina, Turma, Professor, Eletiva]
    if (data[0] && data[0].length >= 4 && data[0][1] && data[0][1].toLowerCase() === "disciplina") {
        isNovoFormato = true;
        data.shift(); // Remove header
    } else if (data[0] && data[0][0] && data[0][0].toLowerCase() === "disciplina") {
        data.shift(); // Remove header antigo
    }

    disciplinasBase = [];
    let setProf = new Set();
    let setDisc = new Set();

    data.forEach((row, index) => {
        let disc, turma, prof;
        
        if (isNovoFormato) {
            if (row.length >= 4) {
                disc = row[1] ? row[1].trim() : "";
                turma = row[2] ? row[2].trim() : "";
                prof = row[3] ? row[3].trim() : "";
            }
        } else {
            if (row.length >= 3) {
                disc = row[0] ? row[0].trim() : "";
                turma = row[1] ? row[1].trim() : "";
                prof = row[2] ? row[2].trim() : "";
            }
        }

        if (disc && turma && prof) {
            let id = "T" + index;
            disciplinasBase.push([id, disc, turma, prof, "Não"]);
            setProf.add(prof);
            setDisc.add(disc);
        }
    });

    renderizarProfessores(Array.from(setProf).sort());
    renderizarMaterias(Array.from(setDisc).sort());
}

function importarBDManual(input) {
    if(!input.files || input.files.length === 0) return;
    Papa.parse(input.files[0], {
        complete: function(results) {
            processarCSVDados(results.data);
            alert("Banco de dados local carregado com sucesso!");
        },
        error: function() {
            alert("Erro ao ler arquivo CSV manualmente.");
        }
    });
}

function renderizarProfessores(profs) {
    let div = document.getElementById('lista-professores');
    div.innerHTML = "";
    profs.forEach(p => {
        // Por padrão: Seg(1), Ter(2), Qua(3), Qui(4), Sex(5)
        profsDisponiveis[p] = [1,2,3,4,5];
        let el = document.createElement('div');
        el.className = 'config-item';
        el.innerHTML = `
            <div style="font-weight: 500; width: 120px;">${p}</div>
            <div class="checkbox-group">
                <label><input type="checkbox" checked onchange="updateProf('${p}', 1, this.checked)"> Seg</label>
                <label><input type="checkbox" checked onchange="updateProf('${p}', 2, this.checked)"> Ter</label>
                <label><input type="checkbox" checked onchange="updateProf('${p}', 3, this.checked)"> Qua</label>
                <label><input type="checkbox" checked onchange="updateProf('${p}', 4, this.checked)"> Qui</label>
                <label><input type="checkbox" checked onchange="updateProf('${p}', 5, this.checked)"> Sex</label>
            </div>
        `;
        div.appendChild(el);
    });
}

function updateProf(p, day, isChecked) {
    if(isChecked) {
        if(!profsDisponiveis[p].includes(day)) profsDisponiveis[p].push(day);
    } else {
        profsDisponiveis[p] = profsDisponiveis[p].filter(d => d !== day);
    }
}

function renderizarMaterias(discs) {
    let div = document.getElementById('lista-materias');
    div.innerHTML = "";
    discs.forEach(d => {
        // Padrão 1ª Aplicação
        discPrioridade[d] = 1;
        let el = document.createElement('div');
        el.className = 'config-item';
        el.innerHTML = `
            <div style="font-weight: 500;">${d}</div>
            <div>
                <select class="btn btn-secondary btn-sm" onchange="updateDisc('${d}', this.value)" style="height:25px; font-size: 12px; margin:0;">
                    <option value="1">1ª Aplicação</option>
                    <option value="2">2ª Aplicação</option>
                    <option value="3">3ª Aplicação</option>
                    <option value="4">4ª Aplicação</option>
                    <option value="5">Indiferente</option>
                </select>
            </div>
        `;
        div.appendChild(el);
    });
}

function updateDisc(d, val) {
    discPrioridade[d] = parseInt(val);
}

// Utils Datas
function parseDate(dateStr) {
    let parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if(parts[0].length===4) return new Date(parts[0], parts[1]-1, parts[2]); // yyyy-mm-dd
    return new Date(parts[2], parts[1]-1, parts[0]); // dd/mm/yyyy
}

function getDayName(d) {
    const r = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return r[d.getDay()];
}

function formatStr(dObj) {
    return ("0" + dObj.getDate()).slice(-2) + "/" + ("0" + (dObj.getMonth()+1)).slice(-2) + "/" + dObj.getFullYear();
}

function gerarAutomatico() {
    let dIni = document.getElementById("data-inicio").value;
    let dFim = document.getElementById("data-fim").value;
    let maxProvasDia = parseInt(document.getElementById("max-provas-dia").value) || 2;
    if(!dIni || !dFim) return alert("Por favor, preencha a Data de Início e Fim!");

    let start = parseDate(dIni);
    let end = parseDate(dFim);
    if(start > end) return alert("A data de início deve ser menor ou igual a data de fim!");

    let datasDisponiveisConfig = [];
    let curr = new Date(start);
    while(curr <= end) {
        let wd = curr.getDay(); // 0(Dom) a 6(Sab)
        if(wd >= 1 && wd <= 5) {
            datasDisponiveisConfig.push({ DateObj: new Date(curr), WeekDay: wd, Str: formatStr(curr) });
        }
        curr.setDate(curr.getDate() + 1);
    }
    
    if(datasDisponiveisConfig.length === 0) return alert("O intervalo selecionado não cai em dias úteis!");

    let alocados = []; // [ID, DataStr, AppInt, Disc, Turma, Prof, Obs/Erros]
    let mapTeacherBusy = {}; // "Prof_DateStr_AppInt" : true
    let mapTurmaApp = {};    // "Turma_DateStr_AppInt" : true // Evita 2 provas na mesma App
    // Para simplificar: Máximo de ~3 provas por dia por turma. Para garantir espaçamento as vezes é melhor "Turma_DateStr_Counter".
    let mapTurmaDayCount = {}; // Quantas provas a turma já tem nesse dia.

    // Ordenar disciplinas para priorizar quem tem menos dias disponiveis
    // Count days for each professor
    let profDays = {};
    Object.keys(profsDisponiveis).forEach(p => {
        let validos = datasDisponiveisConfig.filter(d => profsDisponiveis[p].includes(d.WeekDay)).length;
        profDays[p] = validos;
    });

    let pendingExams = [...disciplinasBase];
    pendingExams.sort((a,b) => {
        return profDays[a[3]] - profDays[b[3]]; // Quem tem menos dias atende PRIMEIRO
    });

    let errors = 0;

    for (let i = 0; i < pendingExams.length; i++) {
        let pData = pendingExams[i];
        let disc = pData[1];
        let turma = pData[2];
        let prof = pData[3];
        let pId = pData[0];

        let prefApp = discPrioridade[disc];
        let prefAppOrder = (prefApp === 5) ? [1,2,3,4] : [prefApp, 1,2,3,4].filter((v,i,a)=>a.indexOf(v)===i && v!==5);
        
        let alocadoSucesso = false;

        // Tenta achar um slot válido
        // Embaralha levemente as datas usando dias menos cheios? Greedy scan:
        for(let d = 0; d < datasDisponiveisConfig.length; d++) {
            let configDt = datasDisponiveisConfig[d];
            
            // Professor vai estar na escola neste dia da semana?
            if(!profsDisponiveis[prof].includes(configDt.WeekDay)) continue;

            // Turma já esgotou a cota do dia?
            let dailyKey = `${turma}_${configDt.Str}`;
            if(mapTurmaDayCount[dailyKey] >= maxProvasDia) continue;

            // Tenta a Aplicação recomendada, depois tenta encaixar nas outras
            for(let aIdx = 0; aIdx < prefAppOrder.length; aIdx++) {
                let appC = prefAppOrder[aIdx];
                
                let tKey = `${prof}_${configDt.Str}_${appC}`;
                let cKey = `${turma}_${configDt.Str}_${appC}`;

                if(!mapTeacherBusy[tKey] && !mapTurmaApp[cKey]) {
                    // SUCCESSO!
                    mapTeacherBusy[tKey] = true;
                    mapTurmaApp[cKey] = true;
                    mapTurmaDayCount[dailyKey] = (mapTurmaDayCount[dailyKey] || 0) + 1;
                    
                    let statusInfo = (prefApp !== 5 && prefApp !== appC) ? "⚠ Remanejado (Prioridade Ocupada)" : "✅ OK";
                    
                    alocados.push([
                        Math.random().toString(36).substr(2, 9),
                        configDt.Str,
                        appC + "ª Aplicação",
                        disc,
                        turma,
                        prof,
                        statusInfo,
                        configDt.WeekDay
                    ]);
                    alocadoSucesso = true;
                    break;
                }
            }
            if(alocadoSucesso) break;
        }

        if(!alocadoSucesso) {
            // Falha fatal para esta prova! Coloca em uma data "invalida" com erro pro usuario revisar
            errors++;
            alocados.push([
                Math.random().toString(36).substr(2, 9),
                "FALHA GERAL",
                "1ª Aplicação",
                disc,
                turma,
                prof,
                "❌ CONFLITO: Não há dias livres possíveis!",
                0
            ]);
        }
    }

    // Export format and render
    montadorLista = alocados.map(r => {
        return [r[0], r[1], r[2], r[3], r[4], r[5], r[6]];
    });

    renderResultados(alocados, errors);
}

function renderResultados(alocados, errors) {
    document.getElementById('resultado-container').style.display = 'block';
    
    let stDiv = document.getElementById('status-geracao');
    if(errors > 0) {
        stDiv.innerHTML = `<span style="color:var(--ios-danger);">Concluído com ${errors} falha(s). Alguns profs não puderam ser encaixados!</span>`;
    } else {
        stDiv.innerHTML = `<span style="color:#34C759;">Geração concluída com sucesso! 100% encaixado.</span>`;
    }

    // Sort by Turma then Date then App
    alocados.sort((a,b) => {
        if(a[1] === "FALHA GERAL") return 1;
        if(b[1] === "FALHA GERAL") return -1;
        
        let turmaCmp = a[4].localeCompare(b[4]); // Turma
        if (turmaCmp !== 0) return turmaCmp;

        let tA = parseDate(a[1]).getTime();
        let tB = parseDate(b[1]).getTime();
        if (tA !== tB) return tA - tB;
        
        let pA = parseInt(a[2]) || 0;
        let pB = parseInt(b[2]) || 0;
        return pA - pB;
    });

    let tBody = document.getElementById('tbody-montador');
    tBody.innerHTML = "";
    alocados.forEach(row => {
        let wdStr = row[1] !== "FALHA GERAL" ? getDayName(parseDate(row[1])) : "-";
        let tr = document.createElement("tr");
        if(row[6].includes("❌")) tr.style.backgroundColor = "#ffe6e6";
        else if(row[6].includes("⚠")) tr.style.backgroundColor = "#fffbcc";

        tr.innerHTML = `
            <td><strong>${row[1]}</strong></td>
            <td>${wdStr}</td>
            <td>${row[2]}</td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
            <td>${row[5]}</td>
            <td style="font-size: 11px;">${row[6]}</td>
        `;
        tBody.appendChild(tr);
    });

    setTimeout(() => {
        document.getElementById('resultado-container').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ----------------------------------------------
// EXPORTS IDÊNTICOS PARA O WORD / CSV
// ----------------------------------------------
function exportarMontadorCSV() {
    if(montadorLista.length === 0) return alert("A lista está vazia.");
    let header = ["ID", "Data", "Aplicação", "Disciplina", "Turma", "Professor", "Observação"];
    let csv = Papa.unparse({ fields: header, data: montadorLista });
    var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    saveAs(blob, "Quadro_Automatico.csv");
}

function exportarWord() {
    if (montadorLista.length === 0) return alert("A lista está vazia.");
    try {
        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, PageOrientation } = window.docx;

        let listaSorted = [...montadorLista].sort((a,b) => {
            if(a[1] === "FALHA GERAL") return 1;
            if(b[1] === "FALHA GERAL") return -1;
            let turmaCmp = a[4].localeCompare(b[4]);
            if (turmaCmp !== 0) return turmaCmp;
            let tA = parseDate(a[1]).getTime();
            let tB = parseDate(b[1]).getTime();
            if (tA !== tB) return tA - tB;
            let pA = parseInt(a[2]) || 0;
            let pB = parseInt(b[2]) || 0;
            return pA - pB;
        });

        let mapTurmas = {};
        listaSorted.forEach(row => {
            if(row[1] === "FALHA GERAL") return;
            let turma = row[4];
            if (!mapTurmas[turma]) mapTurmas[turma] = [];
            mapTurmas[turma].push(row);
        });

        let docChildren = [];
        docChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [ new TextRun({ text: "Agendamento Automático - Fundamental", bold: true, size: 28, font: "Arial" }) ],
                spacing: { after: 300 }
            })
        );

        function createTableCell(text, isHeader) {
            return new TableCell({
                width: { size: 16.6, type: WidthType.PERCENTAGE },
                shading: isHeader ? { fill: "D9EAD3" } : undefined,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: text, font: "Arial", size: 18, bold: isHeader })],
                        spacing: { before: 50, after: 50 }
                    })
                ],
            });
        }

        for (const [turmaChave, registros] of Object.entries(mapTurmas)) {
            let tableRows = [];
            
            docChildren.push(new Paragraph({
                children: [ new TextRun({ text: `Turma: ${turmaChave}`, bold: true, size: 24, font: "Arial" }) ],
                spacing: { before: 200, after: 100 }
            }));

            tableRows.push(new TableRow({
                children: [
                    createTableCell("Data", true),
                    createTableCell("Aplicação", true),
                    createTableCell("Disciplina", true),
                    createTableCell("Professor", true),
                ]
            }));

            registros.forEach(row => {
                let dataVal = row[1].length > 5 ? row[1].substring(0, 5) : row[1];
                tableRows.push(new TableRow({
                    children: [
                        createTableCell(dataVal, false),
                        createTableCell(row[2], false),
                        createTableCell(row[3], false),
                        createTableCell(row[5], false),
                    ]
                }));
            });

            const table = new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            docChildren.push(table);
            docChildren.push(new Paragraph({ text: "", spacing: { after: 300 } }));
        }

        const doc = new Document({
            sections: [{
                properties: { page: { 
                    margin: { top: 720, right: 720, bottom: 720, left: 720 }
                }},
                children: docChildren
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Quadro_Automatico.docx");
        });
    } catch (e) {
        console.error(e);
        alert("Erro ao exportar Word!");
    }
}
