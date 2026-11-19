/* Formulários de Instrução da Destinação — protótipo.
 * Lê a base e o motor da Governança da Destinação (publicados), os formulários disponíveis
 * (formularios/*.js, gerados do PDF) e os municípios do IBGE (dados-municipios.js).
 * A lista de escolha é a dos formulários, não a da TT-02: pode haver formulário específico.
 * O campo "regime" do formulário diz qual matéria da Governança faz o enquadramento; sem ele,
 * não há passo 2. Nada é enviado a servidor: o rascunho fica no localStorage deste navegador. */
(function () {
  'use strict';
  var CHAVE = 'formularios-instrucao-rascunho-v3';
  var SPUPROCESSOS = 'https://spu-projetoseprocessos.github.io/SPUProcessos/';

  var $ = function (id) { return document.getElementById(id); };
  var E = novoEstado('');
  var F = null, G = null, assinaturaEnq = '', processos = null;

  function novoEstado(form) { return { form: form, txt: { valor: '', area: '' }, situacao: null, cond: {}, r: {} }; }

  // ------------------------------------------------------------------ utilitários
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (k === 'text') e.textContent = v;
      else if (k === 'class') e.className = v;
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v !== null && v !== undefined) e.setAttribute(k, v);
    });
    (filhos || []).forEach(function (f) { if (f) e.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
    return e;
  }
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cheio(v) { return v !== undefined && v !== null && String(v).trim() !== ''; }
  function numero(txt) {
    var s = String(txt || '').replace(/[^\d,]/g, '');
    if (!s) return null;
    var n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* sem armazenamento: segue sem rascunho */ } }
  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (s && typeof s === 'object') { E = Object.assign(novoEstado(''), s); E.txt = E.txt || { valor: '', area: '' }; E.cond = E.cond || {}; E.r = E.r || {}; }
    } catch (e) { /* rascunho ilegível: começa em branco */ }
  }
  function resp(n) { if (!E.r[n]) E.r[n] = {}; return E.r[n]; }
  function temGovernanca() { return !!(F && F.regime && typeof BASE !== 'undefined' && typeof campos === 'function' && typeof resolver === 'function' && typeof MANIFESTACAO !== 'undefined'); }
  function materia() { return BASE.materias.filter(function (m) { return m.codigo === F.regime; })[0]; }
  /* Os trechos que no formulário original são link (F.links) viram link aqui, em aba nova. */
  function ancoras() {
    if (!F || !F.links) return [];
    if (!F._ancoras) F._ancoras = F.links.slice().sort(function (a, b) { return b.texto.length - a.texto.length; });
    return F._ancoras;
  }
  function partes(texto) {
    var out = [], resto = String(texto || ''), lista = ancoras();
    while (resto) {
      var melhor = null;
      lista.forEach(function (l) { var k = resto.indexOf(l.texto); if (k >= 0 && (!melhor || k < melhor.k)) melhor = { k: k, l: l }; });
      if (!melhor) { out.push({ t: resto }); break; }
      if (melhor.k) out.push({ t: resto.slice(0, melhor.k) });
      out.push({ t: melhor.l.texto, url: melhor.l.url });
      resto = resto.slice(melhor.k + melhor.l.texto.length);
    }
    return out;
  }
  function comLinks(texto) {
    var f = document.createDocumentFragment();
    partes(texto).forEach(function (p) {
      f.appendChild(p.url ? el('a', { href: p.url, target: '_blank', rel: 'noopener', text: p.t }) : document.createTextNode(p.t));
    });
    return f;
  }
  function comLinksHTML(texto) {
    return partes(texto).map(function (p) { return p.url ? '<a href="' + esc(p.url) + '" target="_blank">' + esc(p.t) + '</a>' : esc(p.t); }).join('');
  }
  function dataBR(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }

  // ------------------------------------------------------------------ máscaras e validação
  var MASC = { nup: '#####.######/####-##', cpf: '###.###.###-##', cnpj: 'AA.AAA.AAA/AAAA-##', cep: '#####-###', rip: '####.#######-##', data: '##/##/####' };
  function significativo(fmt, c) {
    if (fmt === 'cnpj') return /[0-9A-Za-z]/.test(c);
    if (fmt === 'moeda' || fmt === 'area') return /[\d,]/.test(c);
    return /\d/.test(c);
  }
  function formatarNumero(raw, final) {
    var s = String(raw || '').replace(/[^\d,]/g, '');
    if (!s) return '';
    var ic = s.indexOf(','), inteiro = ic >= 0 ? s.slice(0, ic) : s, dec = ic >= 0 ? s.slice(ic + 1).replace(/,/g, '').slice(0, 2) : null;
    inteiro = inteiro.replace(/^0+(?=\d)/, '') || '0';
    inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (final) return inteiro + ',' + ((dec || '') + '00').slice(0, 2);
    return dec === null ? inteiro : inteiro + ',' + dec;
  }
  function formatar(fmt, raw, final) {
    if (fmt === 'docsei') return String(raw || '').replace(/\D/g, '');
    if (fmt === 'moeda' || fmt === 'area') return formatarNumero(raw, final);
    var m = MASC[fmt]; if (!m) return raw;
    var cs = [].filter.call(String(raw || ''), function (c) { return significativo(fmt, c); }).map(function (c) { return c.toUpperCase(); });
    var out = '', j = 0;
    for (var i = 0; i < m.length && j < cs.length; i++) {
      var mc = m[i];
      if (mc === '#') { var ok = /\d/.test(cs[j]); if (ok) out += cs[j]; j++; if (!ok) i--; }
      else if (mc === 'A') out += cs[j++];
      else out += mc;
    }
    return out.replace(/[^0-9A-Z]+$/, '');
  }
  /* Valor e área, como em aplicativo de banco: os dígitos entram pela direita e a vírgula
   * fica sempre antes dos dois últimos (1 → 0,01; 1250 → 12,50; 1200000 → 12.000,00). Quem
   * cola "1.234,56" recebe 1.234,56. O cursor fica sempre no fim. */
  function mascaraDecimal(inp) {
    var dig = inp.value.replace(/\D/g, '').replace(/^0+/, '');
    if (!dig) { inp.value = ''; return; }
    while (dig.length < 3) dig = '0' + dig;
    var inteiro = dig.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    inp.value = inteiro + ',' + dig.slice(-2);
    if (document.activeElement === inp) { var c = inp.value.length; try { inp.setSelectionRange(c, c); } catch (e) { /* tipo sem seleção */ } }
  }
  function aplicarMascara(inp, final) {
    var fmt = inp.getAttribute('data-fmt');
    if (!fmt || inp.tagName !== 'INPUT') return;
    if (fmt === 'moeda' || fmt === 'area') { mascaraDecimal(inp); return; }
    var v = inp.value, pos = inp.selectionStart === null ? v.length : inp.selectionStart;
    var antes = [].filter.call(v.slice(0, pos), function (c) { return significativo(fmt, c); }).length;
    var novo = formatar(fmt, v, final);
    if (novo === v) return;
    inp.value = novo;
    if (document.activeElement === inp) {
      var p = 0, k = 0;
      while (p < novo.length && k < antes) { if (significativo(fmt, novo[p])) k++; p++; }
      try { inp.setSelectionRange(p, p); } catch (e) { /* tipo sem seleção */ }
    }
  }
  function dvCnpj(b) {
    var w = b.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], s = 0;
    for (var i = 0; i < b.length; i++) s += (b.charCodeAt(i) - 48) * w[i];
    var r = s % 11; return r < 2 ? 0 : 11 - r;
  }
  function dataValida(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v); if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null;
  }
  /* Devolve a mensagem de problema do campo, ou ''. `completo` = só reclama de incompleto ao sair do campo. */
  function validar(fmt, v, saiu, extra) {
    if (typeof v !== 'string' || !cheio(v)) return '';
    var d = v.replace(/[^0-9A-Z]/g, '');
    if (fmt === 'nup') {
      return d.length < 17 && saiu ? 'Número incompleto: o processo tem 17 dígitos.' : '';
    }
    if (fmt === 'cpf') {
      if (d.length < 11) return saiu ? 'CPF incompleto: são 11 dígitos.' : '';
      if (/^(\d)\1+$/.test(d)) return 'CPF inválido.';
      for (var t = 9; t < 11; t++) { var s = 0; for (var i = 0; i < t; i++) s += +d[i] * (t + 1 - i); if ((s * 10) % 11 % 10 !== +d[t]) return 'CPF inválido: os dígitos verificadores não conferem.'; }
      return '';
    }
    if (fmt === 'cnpj') {
      if (d.length < 14) return saiu ? 'CNPJ incompleto: são 14 caracteres.' : '';
      if (!/^[0-9A-Z]{12}\d{2}$/.test(d)) return 'CNPJ inválido: os dois últimos caracteres são números.';
      if (/^(\d)\1+$/.test(d)) return 'CNPJ inválido.';
      var d1 = dvCnpj(d.slice(0, 12)), d2 = dvCnpj(d.slice(0, 12) + d1);
      return d.slice(12) === '' + d1 + d2 ? '' : 'CNPJ inválido: os dígitos verificadores não conferem.';
    }
    if (fmt === 'cep') return d.length < 8 && saiu ? 'CEP incompleto: são 8 dígitos.' : '';
    if (fmt === 'rip') return d.length < 13 && saiu ? 'RIP incompleto: são 13 dígitos.' : '';
    if (fmt === 'data') {
      if (d.length < 8) return saiu ? 'Data incompleta: use dd/mm/aaaa.' : '';
      var dt = dataValida(v); if (!dt) return 'Data inexistente.';
      if (extra && extra.certidao) {
        var dias = Math.floor((new Date() - dt) / 86400000);
        if (dias > 30) return 'Certidão expedida há ' + dias + ' dias. O lembrete do item pede no máximo 30 dias da apresentação à Superintendência.';
      }
      return '';
    }
    return '';
  }
  function mostrarValidacao(inp, saiu) {
    var fmt = inp.getAttribute('data-fmt'); if (!fmt) return;
    var msg = validar(fmt, inp.value, saiu, { certidao: inp.hasAttribute('data-certidao') });
    var alvo = inp.parentNode.querySelector('.msg-campo');
    if (!alvo) return;
    alvo.textContent = msg; alvo.hidden = !msg;
    inp.classList.toggle('invalido', !!msg);
  }

  // ------------------------------------------------------------------ passo 1
  function montarSelecao() {
    var sf = $('sel-form'), lista = Object.keys(window.FORMULARIOS || {}).map(function (k) { return window.FORMULARIOS[k]; });
    lista.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
    lista.forEach(function (f) { sf.appendChild(el('option', { value: f.id, text: f.nome })); });
    sf.value = (window.FORMULARIOS || {})[E.form] ? E.form : '';
    sf.addEventListener('change', function () { E = novoEstado(sf.value); salvar(); abrirFormulario(); });
  }
  function abrirFormulario() {
    F = (window.FORMULARIOS || {})[E.form] || null;
    $('corpo').hidden = !F;
    if (!F) { $('carimbo-topo').hidden = true; $('trilha-form').hidden = true; return; }
    var cb = $('carimbo-topo'); cb.textContent = F.carimbo || ''; cb.hidden = !F.carimbo;
    $('trilha-form').hidden = false; $('trilha-nome').textContent = F.nome;
    var leg = $('legislacao'); leg.textContent = 'Legislação de regência: ';
    leg.classList.add('leis');
    F.legislacao.forEach(function (l, i) {
      if (i) leg.appendChild(document.createTextNode(i === F.legislacao.length - 1 ? ' e ' : ', '));
      leg.appendChild(el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.t }));
    });
    leg.appendChild(document.createTextNode('.'));
    var gov = temGovernanca();
    $('cartao-enq').hidden = !gov;
    var erro = $('erro-carga');
    erro.hidden = !(F.regime && !gov);
    erro.textContent = erro.hidden ? '' : 'Não foi possível carregar a Governança da Destinação, então o enquadramento não aparece. Verifique a conexão com a internet e recarregue a página.';
    assinaturaEnq = ''; G = null;
    if (gov) montarFixos();
    montarFormulario();
    mostrarFluxos();
    atualizar();
  }

  // ------------------------------------------------------------------ campos ligados ao enquadramento
  function campoLigado(motor) {
    var achado = null;
    F.secoes.forEach(function (s) { s.itens.forEach(function (it) { (it.campos || []).forEach(function (c) { if (c.motor === motor) achado = { item: it, campo: c }; }); }); });
    return achado;
  }

  // ------------------------------------------------------------------ passo 2: enquadramento
  /* Condição do enquadramento que o próprio formulário já responde (ex.: na Entrega para
   * Aquicultura, a finalidade da entrega é sempre "outra"). Não se pergunta; mostra-se. */
  function conds() { return Object.assign({}, E.cond, (F && F.condicoes_fixas) || {}); }
  function respostasMotor() { var r = conds(); var a = numero(E.txt.area); if (a !== null) r.__area__ = a; return r; }
  function casoDe(lista) {
    var nomes = lista.map(function (c) { return c.campo; }), ca = lista.filter(function (c) { return c.campo === 'area'; })[0], cond = {};
    var cc = conds();
    lista.forEach(function (c) { if (c.tipo === 'condicao' && cc[c.campo] !== undefined) cond[c.campo] = cc[c.campo]; });
    return { valor: nomes.indexOf('valor') !== -1 ? numero(E.txt.valor) : null, area: ca ? numero(E.txt.area) : null,
             situacao: nomes.indexOf('situacao') !== -1 ? E.situacao : null, referencia: ca ? ca.referencia : 'imovel',
             condicoes: cond, coringas_admitidos: materia().coringas_admitidos || [] };
  }
  function rotuloMotor(nome, ref) {
    var l = campoLigado(nome);
    if (l) return l.campo.r;
    return nome === 'valor' ? 'Valor do imóvel (R$)' : (REFERENCIA[ref] || 'Área') + ' (m²)';
  }
  function faltaResponder(lista, caso) {
    var f = [];
    lista.forEach(function (c) {
      if (c.campo === 'valor' && caso.valor === null) f.push(rotuloMotor('valor').replace(/ \(.*\)$/, '').toLowerCase());
      else if (c.campo === 'area' && caso.area === null) f.push(rotuloMotor('area', c.referencia).replace(/ \(.*\)$/, '').toLowerCase());
      else if (c.campo === 'situacao' && caso.situacao === null) f.push('situação do imóvel');
      else if (c.tipo === 'condicao' && caso.condicoes[c.campo] === undefined) f.push(c.rotulo || c.campo);
    });
    return f;
  }
  function curtas(textos) { return textos.every(function (t) { return String(t).length <= 34; }); }
  function radios(nome, legenda, pares, atual, aoMudar, classe) {
    var fs = el('fieldset', { class: (classe || '') + (curtas(pares.map(function (p) { return p[1]; })) ? ' em-linha' : '') }, [el('legend', { text: legenda })]);
    pares.forEach(function (p) {
      var i = el('input', { type: 'radio', name: nome, value: p[0], checked: atual === p[0] });
      i.addEventListener('change', function () { aoMudar(p[0]); });
      fs.appendChild(el('label', { class: 'opcao' }, [i, el('span', {}, [comLinks(p[1])])]));
    });
    return fs;
  }
  /* Valor e área da União ficam sempre no alto do enquadramento (4ª rodada, 19/11/2026), mesmo
   * quando a base não precisa deles para o regime: é a primeira coisa que o técnico conhece do
   * caso. Ficam ligados aos itens do formulário que os repetem. As demais perguntas (situação,
   * condições) só aparecem quando a base as pede. */
  function montarFixos() {
    var alvo = $('enq-campos'); alvo.textContent = '';
    var fixos = el('div', { class: 'enq-fixos' });
    ['valor', 'area'].forEach(function (nome) {
      var inp = el('input', { type: 'text', inputmode: 'decimal', id: 'enq-' + nome, 'data-motor': nome, 'data-fmt': nome === 'valor' ? 'moeda' : 'area', autocomplete: 'off', placeholder: '0,00' });
      inp.value = E.txt[nome] ? formatar(inp.getAttribute('data-fmt'), E.txt[nome], true) : '';
      fixos.appendChild(el('label', { class: 'campo' }, [el('span', { class: 'rot' }, [rotuloMotor(nome, 'uniao')]), inp]));
    });
    alvo.appendChild(fixos);
    alvo.appendChild(el('div', { id: 'enq-outros', class: 'enq-outros' }));
  }
  function montarEnquadramento(lista) {
    var alvo = $('enq-outros'); alvo.textContent = '';
    lista.forEach(function (c) {
      if (c.campo === 'valor' || c.campo === 'area') return;
      if (c.campo === 'situacao') {
        alvo.appendChild(radios('enq-situacao', 'Situação do imóvel', c.valores.map(function (v) { return [v, SITUACAO[v] || v]; }), E.situacao,
          function (v) { E.situacao = v; salvar(); atualizar(); }, 'largo'));
      } else if (c.tipo === 'condicao') {
        var rot = {}; c.teste.valores.forEach(function (v) { rot[v.valor] = v.rotulo; });
        alvo.appendChild(radios('enq-' + c.campo, c.pergunta || c.rotulo, c.valores.map(function (v) { return [v, rot[v] || v]; }), E.cond[c.campo],
          function (v) { E.cond[c.campo] = v; salvar(); atualizar(); }, 'largo'));
      }
    });
    // A condição que o formulário já responde não é perguntada (o motor nem a pede): mostra-se.
    Object.keys(F.condicoes_fixas || {}).forEach(function (k) {
      var t = BASE.testes.filter(function (x) { return x.teste === k; })[0], v = F.condicoes_fixas[k];
      var rv = t ? (t.valores.filter(function (x) { return x.valor === v; })[0] || {}).rotulo : null;
      alvo.appendChild(el('p', { class: 'cond-fixa' }, [el('strong', { text: (t ? t.rotulo : k) + ': ' }), (rv || v) + ' (definido pelo formulário).']));
    });
  }
  /* Valor e área alimentam o enquadramento, mas ele só é recalculado quando a pessoa sai do
   * campo: recalcular a cada dígito abre e fecha perguntas (a situação do imóvel aparece
   * acima de 10.000 m²) enquanto o número ainda está sendo digitado. */
  function defMotor(nome, texto, origem, recalcular) {
    E.txt[nome] = texto;
    document.querySelectorAll('[data-motor="' + nome + '"]').forEach(function (i) { if (i !== origem) i.value = texto; });
    salvar();
    if (!recalcular) return;
    var antes = { ass: assinaturaEnq, res: resumoEnq() };
    atualizar();
    if (origem && !origem.closest('#cartao-enq')) avisarEnquadramento(origem, antes);
  }
  function resumoEnq() { return G ? [G.manif ? G.manif.texto : '', G.comp ? G.comp.texto : ''].join('|') : ''; }
  /* O que aparece por causa de uma resposta aparece logo abaixo dela (5ª rodada). Valor e área
   * digitados num item do formulário mexem no enquadramento, que fica no alto da página: o aviso
   * fica ao lado do campo, com o caminho até lá. */
  function avisarEnquadramento(origem, antes) {
    var lab = origem.closest('label') || origem.parentNode, p = lab.querySelector('.aviso-enq');
    if (!p) { p = el('div', { class: 'aviso-enq', 'aria-live': 'polite' }); lab.appendChild(p); }
    p.textContent = '';
    var caso = $('enq-resultado').querySelector('.espera'), texto = '';
    if (assinaturaEnq !== antes.ass && caso) texto = 'O enquadramento mudou: há pergunta nova a responder no alto da página.';
    else if (resumoEnq() !== antes.res && G) texto = 'Enquadramento atualizado: ' + [G.manif ? G.manif.texto : '', G.comp ? 'quem decide: ' + G.comp.texto : ''].filter(Boolean).join('; ') + '.';
    if (!texto) { p.hidden = true; return; }
    var ir = el('button', { type: 'button', class: 'bt-link', text: 'Ir para o enquadramento' });
    ir.addEventListener('click', function () {
      $('cartao-enq').scrollIntoView({ block: 'start' });
      var alvo = $('enq-outros').querySelector('input:not(:checked)') || $('enq-area'); if (alvo) { try { alvo.focus({ preventScroll: true }); } catch (e) { alvo.focus(); } }
    });
    p.appendChild(el('span', { text: texto + ' ' })); p.appendChild(ir); p.hidden = false;
  }
  function aplicarCondicional(r, autoridade) {
    if (!r.resultado_se) return { resultado: r.resultado, nota: null };
    var par = r.resultado_se.split('=');
    if (par[0] !== 'competencia') return { resultado: r.resultado, nota: null };
    return { resultado: autoridade === par[1] ? r.resultado : r.resultado_alternativo,
      nota: 'A regra distingue conforme a autoridade: ' + MANIFESTACAO[r.resultado] + ' nos atos do(a) ' + COMPETENCIA[par[1]] + ', ' +
            MANIFESTACAO[r.resultado_alternativo].toLowerCase() + ' nos demais.' };
  }
  function bloco(titulo, resposta, linhas, classe) {
    var d = el('div', { class: 'bloco ' + (classe || '') }, [el('h3', { text: titulo }), el('p', { class: 'resp', text: resposta })]);
    (linhas || []).forEach(function (l) { if (l) d.appendChild(el('p', { class: 'fund', text: l })); });
    return d;
  }
  function calcularEnquadramento() {
    var lista = campos(BASE, F.regime, respostasMotor());
    var ass = lista.map(function (c) { return c.campo + ':' + (c.valores || []).join('|') + ':' + (c.referencia || ''); }).join(';');
    if (ass !== assinaturaEnq) { assinaturaEnq = ass; montarEnquadramento(lista); }
    var caso = casoDe(lista), falta = faltaResponder(lista, caso), alvo = $('enq-resultado');
    alvo.textContent = ''; G = null;
    if (falta.length) { alvo.appendChild(bloco('Resultado', 'Falta responder: ' + falta.join('; ') + '.', [], 'espera')); return; }
    var comp = resolver(BASE, 'competencia', F.regime, caso), manif = resolver(BASE, 'manifestacao', F.regime, caso);
    var aut = comp.vence.length === 1 ? comp.vence[0].resultado : null;
    G = { manif: null, comp: null };
    if (manif.vence.length === 1) {
      var r = manif.vence[0], ap = aplicarCondicional(r, aut), texto = MANIFESTACAO[ap.resultado] || ap.resultado;
      // Sem o nível do GE-DESUP: saiu da tela da Governança em 18/11/2026, a pedido da área de
      // destinação (a base fixa o nível fora do que a Portaria MGI 771/2023 prevê em algumas regras).
      G.manif = { codigo: ap.resultado, texto: texto, fundamento: r.fundamento, regra: r.id };
      alvo.appendChild(bloco('Manifestação prévia', texto, ['Fundamento: ' + r.fundamento, ap.nota,
        ap.resultado === 'ge_desup' && r.ge_desup_gatilho ? GATILHO[r.ge_desup_gatilho] : null, 'Regra ' + r.id + ' da base.']));
    } else {
      alvo.appendChild(bloco('Manifestação prévia', manif.vence.length ? 'A base tem mais de uma regra para este caso.' : 'A base não tem regra para este caso.',
        ['Consulte a Governança da Destinação e a área de destinação antes de prosseguir.']));
    }
    if (comp.vence.length === 1) {
      var c = comp.vence[0];
      G.comp = { codigo: c.resultado, texto: COMPETENCIA[c.resultado] || c.resultado, fundamento: c.fundamento, regra: c.id };
      alvo.appendChild(bloco('Quem decide', G.comp.texto, ['Fundamento: ' + c.fundamento, 'Regra ' + c.id + ' da base.']));
    } else {
      alvo.appendChild(bloco('Quem decide', comp.vence.length ? 'A base tem mais de uma regra para este caso.' : 'A base não tem regra para este caso.', []));
    }
  }

  // ------------------------------------------------------------------ passo 3: fluxos
  function mostrarFluxos() {
    var alvo = $('fluxos'); alvo.textContent = '';
    var cods = F.fluxos || [];
    if (!cods.length) { alvo.appendChild(el('p', { text: 'Ainda não há processo do SPUProcessos ligado a este formulário.' })); return; }
    if (!processos) {
      alvo.appendChild(el('p', { text: 'Consultando o SPUProcessos…' }));
      fetch(SPUPROCESSOS + 'processos.json').then(function (r) { return r.json(); }).then(function (j) { processos = j; mostrarFluxos(); })
        .catch(function () {
          alvo.textContent = '';
          alvo.appendChild(el('p', {}, ['Não foi possível consultar o catálogo agora. ', el('a', { href: SPUPROCESSOS, target: '_blank', rel: 'noopener', text: 'Abrir o SPUProcessos' }), '.']));
        });
      return;
    }
    cods.forEach(function (c) {
      var p = processos.filter(function (x) { return x.codigo === c; })[0];
      if (!p) return;
      alvo.appendChild(el('div', { class: 'fluxo' }, [el('strong', { text: p.nome }),
        el('span', { text: 'Situação do mapeamento: ' + p.mapeado.toLowerCase() + '.' }),
        p.linkWeb ? el('a', { href: p.linkWeb, target: '_blank', rel: 'noopener', text: 'Abrir o fluxo' }) : el('span', { text: 'Sem fluxo publicado.' })]));
    });
  }

  // ------------------------------------------------------------------ passo 4: formulário
  function blocosEl(blocos, classe) {
    var d = el('div', { class: 'blocos' + (classe ? ' ' + classe : '') });
    (blocos || []).forEach(function (b) {
      if (b.p) d.appendChild(el('p', {}, [comLinks(b.p)]));
      else if (b.sub) d.appendChild(el('p', { class: 'sub' }, [comLinks(b.sub)]));
      else if (b.formula) d.appendChild(el('div', {}, [el('span', { class: 'formula', text: b.formula })]));
      else if (b.lista) d.appendChild(el('ul', {}, b.lista.map(function (x) { return el('li', {}, [comLinks(x)]); })));
    });
    return d;
  }
  /* Condição de um trecho de lembrete (campo `se`, escrito no gerar_dados.py). O trecho só
   * aparece quando o que já se sabe do caso o torna pertinente. */
  function vale(se) {
    if (!se) return true;
    if (se.todos) return se.todos.every(vale);
    if (se.algum) return se.algum.some(vale);
    if (se.item) { var o = (E.r[se.item] || {}).op; return typeof o === 'number' && se.op.indexOf(o) >= 0; }
    if (se.cond) return se.em.indexOf(conds()[se.cond]) >= 0;
    if (se.motor) { var v = numero(E.txt[se.motor]); return v !== null && v >= se.min; }
    if (se.manif) return !!(G && G.manif && se.manif.indexOf(G.manif.codigo) >= 0);
    return true;
  }
  /* Os trechos de lembrete que valem agora para o item: os do próprio item e os da opção
   * marcada, juntos numa caixa só. `ass` identifica o conjunto, para a ciência. */
  function lembretesVisiveis(it) {
    var blocos = [], ids = [], r = E.r[it.n] || {};
    (it.lembrete || []).forEach(function (b, i) { if (vale(b.se)) { blocos.push(b); ids.push('i' + i); } });
    if (it.tipo === 'uma' && typeof r.op === 'number') (it.opcoes[r.op].lembrete || []).forEach(function (b, i) { if (vale(b.se)) { blocos.push(b); ids.push('o' + r.op + '.' + i); } });
    return { blocos: blocos, ass: ids.join(',') };
  }
  function cienteDe(it, lv) { return !!lv.ass && (E.r[it.n] || {}).ciente === lv.ass; }
  function caixaLembrete(it) {
    var lv = lembretesVisiveis(it), alvo = $('lemb-' + it.n);
    if (!alvo) return;
    if (alvo.getAttribute('data-ass') === lv.ass) return;
    alvo.setAttribute('data-ass', lv.ass); alvo.textContent = ''; alvo.hidden = !lv.blocos.length;
    if (!lv.blocos.length) return;
    var caixa = el('div', { class: 'lembrete aberto-sempre' }, [el('p', { class: 'titulo-lembrete', text: 'Lembrete da Unidade Central' }), blocosEl(lv.blocos)]);
    var ck = el('input', { type: 'checkbox', checked: cienteDe(it, lv) });
    ck.addEventListener('change', function () { resp(it.n).ciente = ck.checked ? lv.ass : ''; salvar(); mostrarConferencia(conferir()); });
    caixa.appendChild(el('label', { class: 'ciente' }, [ck, el('span', { text: 'Li e estou ciente' })]));
    alvo.appendChild(caixa);
  }
  function atualizarLembretes() { itens().forEach(caixaLembrete); }
  function lembreteRecolhido(blocos) {
    return el('details', { class: 'lembrete' }, [el('summary', { text: 'Lembrete da Unidade Central' }), blocosEl(blocos, 'corpo-lembrete')]);
  }
  /* Um campo: rótulo, entrada e a linha de aviso. `p` = caminho na resposta do item. */
  function campoEl(n, p, def, valor, extraAttrs) {
    var fmt = def.fmt || '', rot = def.r ? el('span', { class: 'rot' }, [def.r]) : null;
    if (fmt === 'radio') {
      var fs = el('fieldset', { class: 'campo campo-radio' }, [el('legend', { class: 'rot', text: def.r })]), par = el('div', { class: 'par' });
      def.valores.forEach(function (v) {
        par.appendChild(el('label', {}, [el('input', { type: 'radio', name: 'rc-' + n + '-' + p, 'data-n': n, 'data-p': p, value: v[0], checked: valor === v[0] }), v[1]]));
      });
      fs.appendChild(par); return fs;
    }
    if (fmt === 'checks') {
      var fc = el('fieldset', { class: 'campo campo-radio' }, [el('legend', { class: 'rot', text: def.r })]), pc = el('div', { class: 'par' }), marcados = valor || [];
      def.valores.forEach(function (v) {
        pc.appendChild(el('label', {}, [el('input', { type: 'checkbox', name: 'ck-' + n + '-' + p, 'data-n': n, 'data-p': p, value: v[0], checked: marcados.indexOf(v[0]) >= 0 }), v[1]]));
      });
      fc.appendChild(pc); return fc;
    }
    if (fmt === 'uf') {
      var su = el('select', { 'data-n': n, 'data-p': p }, [el('option', { value: '', text: 'Selecione uma opção' })]);
      (window.ESTADOS || []).forEach(function (u) { su.appendChild(el('option', { value: u[0], text: u[1] + ' (' + u[0] + ')' })); });
      su.value = valor || '';
      return el('label', { class: 'campo' }, [rot, su]);
    }
    if (fmt === 'municipio') {
      var sm = el('select', { 'data-n': n, 'data-p': p, 'data-municipio': '1' });
      return el('label', { class: 'campo' }, [rot, sm]);
    }
    var a = Object.assign({ 'data-n': n, 'data-p': p, autocomplete: 'off' }, extraAttrs || {});
    if (fmt) { a['data-fmt'] = fmt; a.inputmode = (fmt === 'cnpj') ? 'text' : (fmt === 'moeda' || fmt === 'area') ? 'decimal' : 'numeric'; }
    if (MASC[fmt]) { a.placeholder = MASC[fmt].replace(/#/g, '0').replace(/A/g, '0'); a.maxlength = MASC[fmt].length; }
    if (fmt === 'data') a.placeholder = 'dd/mm/aaaa';
    if (fmt === 'moeda') a.placeholder = '0,00';
    if (fmt === 'area') a.placeholder = '0,00';
    if (def.certidao) a['data-certidao'] = '1';
    var inp = def.longo ? el('textarea', a) : el('input', Object.assign({ type: 'text' }, a));
    inp.value = valor || '';
    var lab = el('label', { class: 'campo' + (fmt === 'docsei' ? ' doc-sei' : '') }, [rot, inp, el('p', { class: 'msg-campo', hidden: true })]);
    if (fmt === 'cep') lab.appendChild(el('p', { class: 'info-campo', hidden: true, 'aria-live': 'polite' }));
    return lab;
  }
  function preencherMunicipios(n) {
    var r = resp(n), uf = (r.k || {}).estado, sm = document.querySelector('[data-n="' + n + '"][data-municipio]');
    if (!sm) return;
    sm.textContent = '';
    sm.appendChild(el('option', { value: '', text: uf ? 'Selecione uma opção' : 'Selecione primeiro o estado' }));
    sm.disabled = !uf;
    ((window.MUNICIPIOS || {})[uf] || []).forEach(function (m) { sm.appendChild(el('option', { value: m[0] + '|' + m[1], text: m[1] })); });
    sm.value = (r.k || {}).municipio || '';
  }
  function docSeiEl(n, p, valor, rotulo) {
    return campoEl(n, p, { r: rotulo || 'Doc. SEI nº', fmt: 'docsei' }, valor);
  }
  function montarItem(it) {
    var r = resp(it.n), d = el('div', { class: 'item', id: 'item-' + it.n });
    d.appendChild(el('h4', { id: 'tit-' + it.n }, [el('span', { class: 'num', text: it.conclusao ? '' : it.n }), it.titulo]));
    if (it.ajuda) d.appendChild(el('p', { class: 'ajuda' }, [comLinks(it.ajuda)]));
    if (it.governanca) d.appendChild(el('p', { class: 'vinculo', id: 'dica-governanca' }));

    if (it.tipo === 'fixo') d.appendChild(el('div', { class: 'fixo' }, it.texto.map(function (t) { return el('p', {}, [comLinks(t)]); })));
    else if (it.tipo === 'texto') d.appendChild(campoEl(it.n, 't', { r: '', fmt: it.fmt }, r.t, { 'aria-labelledby': 'tit-' + it.n }));
    else if (it.tipo === 'longo') d.appendChild(campoEl(it.n, 't', { r: '', longo: true }, r.t, { 'aria-labelledby': 'tit-' + it.n }));
    else if (it.tipo === 'campos') {
      var g = el('div', { class: 'linha-campos' });
      it.campos.forEach(function (c) {
        var v = c.motor ? E.txt[c.motor] : (r.k || {})[c.k];
        g.appendChild(campoEl(it.n, 'k:' + c.k, c, v, c.motor ? { 'data-motor': c.motor } : null));
        if (c.sei) g.appendChild(docSeiEl(it.n, 'ks:' + c.k, (r.ks || {})[c.k], 'Doc. SEI nº — ' + c.r.split(' (')[0].replace(/, se houver$/, '').toLowerCase()));
      });
      d.appendChild(g);
    } else if (it.tipo === 'uma') {
      var fs = el('fieldset', { class: curtas(it.opcoes.map(function (o) { return (o.n ? o.n + ' — ' : '') + o.t; })) ? 'em-linha' : '' }, [el('legend', { class: 'rot', text: 'Marque uma opção' })]);
      it.opcoes.forEach(function (o, i) {
        var inp = el('input', { type: 'radio', name: 'r-' + it.n, 'data-n': it.n, 'data-p': 'op', value: String(i), checked: r.op === i });
        fs.appendChild(el('label', { class: 'opcao' }, [inp, el('span', {}, [(o.n ? o.n + ' — ' : ''), comLinks(o.t)])]));
        if (o.campos) {
          var cv = ((r.c || {})[i]) || {}, compl = el('div', { class: 'compl', 'data-compl': it.n + ':' + i, hidden: r.op !== i });
          var lc = el('div', { class: 'linha-campos' });
          o.campos.forEach(function (c) { lc.appendChild(campoEl(it.n, 'c:' + i + ':' + c.k, c, cv[c.k])); });
          compl.appendChild(lc);
          fs.appendChild(compl);
        }
      });
      d.appendChild(fs);
      if (it.antes_fecho) d.appendChild(blocosEl(it.antes_fecho, 'ajuda'));
      if (it.conclusao && (F.encaminhamento || []).length) {
        var enc = el('div', { id: 'encaminhamento', hidden: true });
        enc.appendChild(radios('enc-' + it.n, 'Encaminhamento', F.encaminhamento.map(function (e) { return [e.k, e.t]; }), r.enc,
          function (v) { resp(it.n).enc = v; salvar(); atualizar(); }));
        enc.appendChild(el('p', { class: 'vinculo', id: 'dica-encaminhamento' }));
        d.appendChild(enc);
      }
    } else if (it.tipo === 'varias') {
      var fv = el('fieldset', { class: curtas(it.opcoes.map(function (o) { return o.t; })) ? 'em-linha' : '' }, [el('legend', { class: 'rot', text: 'Marque as opções que se aplicam' })]), ops = r.ops || [];
      it.opcoes.forEach(function (o, i) {
        fv.appendChild(el('label', { class: 'opcao' }, [el('input', { type: 'checkbox', name: 'v-' + it.n, 'data-n': it.n, 'data-p': 'ops', value: String(i), checked: ops.indexOf(i) >= 0 }), el('span', {}, [comLinks(o.t)])]));
      });
      d.appendChild(fv);
    } else if (it.tipo === 'lista_sn') {
      if (it.aviso) d.appendChild(el('p', { class: 'ajuda' }, [comLinks(it.aviso)]));
      it.perguntas.forEach(function (q, i) {
        var par = el('div', { class: 'par' });
        [['sim', 'Sim'], ['nao', 'Não']].forEach(function (x) {
          par.appendChild(el('label', {}, [el('input', { type: 'radio', name: 'sn-' + it.n + '-' + i, 'data-n': it.n, 'data-p': 'sn:' + i, value: x[0], checked: (r.sn || {})[i] === x[0] }), x[1]]));
        });
        var linha = el('div', { class: 'sn' }, [el('div', {}, [(i + 1) + '. ', comLinks(q.t)]), par, docSeiEl(it.n, 'snsei:' + i, (r.snsei || {})[i])]);
        if (q.lembrete) linha.appendChild(lembreteRecolhido(q.lembrete));
        d.appendChild(linha);
      });
    }

    d.appendChild(el('div', { class: 'caixa-lembrete', id: 'lemb-' + it.n, hidden: true }));
    var extra = el('div', { class: 'extra' });
    if (it.sei) extra.appendChild(docSeiEl(it.n, 'sei', r.sei));
    extra.appendChild(observacaoEl(it.n, r.obs));
    d.appendChild(extra);
    return d;
  }
  /* Observações e ressalvas ficam recolhidas atrás de "Incluir observação" (4ª rodada): a
   * maioria dos itens não tem, e o campo aberto em todos pesava a página. Abre sozinho quando
   * já há texto. */
  function observacaoEl(n, valor) {
    var caixa = el('div', { class: 'obs' }), aberto = cheio(valor);
    var bt = el('button', { type: 'button', class: 'bt-obs', hidden: aberto }, ['+ Incluir observação']);
    var campo = campoEl(n, 'obs', { r: 'Observações e ressalvas', longo: true }, valor,
      { placeholder: 'Insira aqui as observações e ressalvas sobre este item.', maxlength: 3000 });
    campo.appendChild(el('p', { class: 'limite' }, ['Limite máximo de ', el('b', { text: '3.000' }), ' caracteres.']));
    campo.hidden = !aberto;
    var lixeira = el('span', { class: 'lixeira', 'aria-hidden': 'true' });
    lixeira.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z" fill="currentColor"/></svg>';
    var rem = el('button', { type: 'button', class: 'bt-remover' }, [lixeira, 'Remover observação']);
    campo.appendChild(rem);
    bt.addEventListener('click', function () { bt.hidden = true; campo.hidden = false; campo.querySelector('textarea').focus(); });
    rem.addEventListener('click', function () {
      var ta = campo.querySelector('textarea');
      if (cheio(ta.value) && !window.confirm('Remover a observação deste item?')) return;
      ta.value = ''; resp(n).obs = ''; salvar(); atualizar();
      campo.hidden = true; bt.hidden = false; bt.focus();
    });
    caixa.appendChild(bt); caixa.appendChild(campo);
    return caixa;
  }
  function montarFormulario() {
    var alvo = $('formulario'); alvo.textContent = '';
    F.secoes.forEach(function (s) {
      var sec = el('div', { class: 'secao' }, [el('h3', { text: s.n + '. ' + s.titulo })]);
      if (s.intro) sec.appendChild(blocosEl(s.intro, 'intro'));
      s.itens.forEach(function (it) {
        if (it.grupo) sec.appendChild(el('p', { class: 'grupo', text: it.grupo }));
        sec.appendChild(montarItem(it));
      });
      alvo.appendChild(sec);
    });
    F.secoes.forEach(function (s) { s.itens.forEach(function (it) { if ((it.campos || []).some(function (c) { return c.fmt === 'municipio'; })) preencherMunicipios(it.n); }); });
    alvo.querySelectorAll('input[data-fmt]').forEach(function (i) { if (i.value) mostrarValidacao(i, true); });
  }
  function aoEditar(ev) {
    var t = ev.target, n = t.getAttribute('data-n'), p = t.getAttribute('data-p');
    if (t.getAttribute('data-fmt') && ev.type === 'input') { aplicarMascara(t, false); mostrarValidacao(t, false); }
    var motor = t.getAttribute('data-motor');
    if (motor) { if (ev.type === 'input') defMotor(motor, t.value, t, false); return; }
    if (!n || !p) return;
    if (t.type === 'radio' && !t.checked) return;
    var r = resp(n), par = p.split(':');
    if (t.type === 'checkbox') {
      var grupo = [].slice.call(document.querySelectorAll('input[type=checkbox][name="' + t.name + '"]')).filter(function (x) { return x.checked; });
      var vals = p === 'ops' ? grupo.map(function (x) { return parseInt(x.value, 10); }) : grupo.map(function (x) { return x.value; });
      if (p === 'ops') r.ops = vals;
      else if (par[0] === 'c') { r.c = r.c || {}; r.c[par[1]] = r.c[par[1]] || {}; r.c[par[1]][par[2]] = vals; }
      else if (par.length === 2) { r[par[0]] = r[par[0]] || {}; r[par[0]][par[1]] = vals; }
      salvar(); atualizar(); return;
    }
    if (par[0] === 'op') {
      r.op = parseInt(t.value, 10);
      document.querySelectorAll('[data-compl^="' + n + ':"]').forEach(function (c) { c.hidden = c.getAttribute('data-compl') !== n + ':' + r.op; });
    } else if (par[0] === 'c') {
      r.c = r.c || {}; r.c[par[1]] = r.c[par[1]] || {}; r.c[par[1]][par[2]] = t.value;
    } else if (par.length === 2) {
      r[par[0]] = r[par[0]] || {}; r[par[0]][par[1]] = t.value;
      if (p === 'k:estado') { r.k.municipio = ''; preencherMunicipios(n); }
    } else r[p] = t.value;
    salvar(); atualizar();
  }
  function aoSair(ev) {
    var t = ev.target;
    if (!t.getAttribute || !t.getAttribute('data-fmt')) return;
    var antes = t.value;
    aplicarMascara(t, true);
    mostrarValidacao(t, true);
    var motor = t.getAttribute('data-motor');
    if (motor) { defMotor(motor, t.value, t, true); return; }
    if (t.getAttribute('data-fmt') === 'cep') buscarCep(t);
    if (t.value !== antes) t.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ------------------------------------------------------------------ endereço pelo CEP
  /* ViaCEP (gratuito, sem senha, base dos Correios); se falhar, BrasilAPI; se as duas falharem,
   * preenchimento manual. Só o CEP sai da página. Resultado guardado no navegador. */
  var CACHE_CEP = 'formularios-instrucao-cep-v1';
  function semAcento(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  function infoCep(inp, texto, erro) {
    var p = inp.parentNode.querySelector('.info-campo'); if (!p) return;
    p.textContent = texto || ''; p.hidden = !texto; p.classList.toggle('falhou', !!erro);
  }
  function buscarCep(inp) {
    var n = inp.getAttribute('data-n'), d = inp.value.replace(/\D/g, '');
    if (d.length !== 8) { infoCep(inp, ''); return; }
    var cache = {}; try { cache = JSON.parse(localStorage.getItem(CACHE_CEP) || '{}'); } catch (e) { cache = {}; }
    if (cache[d]) { aplicarCep(n, cache[d], inp); return; }
    infoCep(inp, 'Buscando o endereço pelo CEP…');
    function guardar(e) { cache[d] = e; try { localStorage.setItem(CACHE_CEP, JSON.stringify(cache)); } catch (x) { /* sem armazenamento */ } aplicarCep(n, e, inp); }
    fetch('https://viacep.com.br/ws/' + d + '/json/').then(function (r) { if (!r.ok) throw new Error('viacep'); return r.json(); })
      .then(function (j) {
        if (j.erro) { infoCep(inp, 'CEP não encontrado na base dos Correios. Confira o número ou preencha o endereço à mão.', true); return; }
        guardar({ uf: j.uf, ibge: j.ibge, cidade: j.localidade, logradouro: j.logradouro, bairro: j.bairro, fonte: 'ViaCEP' });
      })
      .catch(function () {
        fetch('https://brasilapi.com.br/api/cep/v1/' + d).then(function (r) { if (!r.ok) throw new Error('brasilapi'); return r.json(); })
          .then(function (j) { guardar({ uf: j.state, ibge: null, cidade: j.city, logradouro: j.street, bairro: j.neighborhood, fonte: 'BrasilAPI' }); })
          .catch(function () { infoCep(inp, 'Não foi possível buscar o endereço agora. Preencha à mão.', true); });
      });
  }
  function aplicarCep(n, e, inp) {
    var r = resp(n); r.k = r.k || {};
    if (e.uf) {
      r.k.estado = e.uf;
      var su = document.querySelector('[data-n="' + n + '"][data-p="k:estado"]'); if (su) su.value = e.uf;
      preencherMunicipios(n);
      var lista = (window.MUNICIPIOS || {})[e.uf] || [], achou = null;
      if (e.ibge) achou = lista.filter(function (m) { return String(m[0]) === String(e.ibge); })[0];
      if (!achou && e.cidade) achou = lista.filter(function (m) { return semAcento(m[1]) === semAcento(e.cidade); })[0];
      if (achou) { r.k.municipio = achou[0] + '|' + achou[1]; var sm = document.querySelector('[data-n="' + n + '"][data-municipio]'); if (sm) sm.value = r.k.municipio; }
    }
    var lg = [e.logradouro, e.bairro].filter(function (x) { return x && String(x).trim(); }).join(' – ');
    if (!cheio(r.k.logradouro) || r.k.logradouro === r.k._lg_auto) {      // só troca o que veio de outro CEP
      r.k.logradouro = lg; r.k._lg_auto = lg;
      var il = document.querySelector('[data-n="' + n + '"][data-p="k:logradouro"]'); if (il) il.value = lg;
    }
    salvar(); atualizar();
    infoCep(inp, 'Endereço preenchido pelo CEP (' + e.fonte + '). Confira e complete' + (lg ? '.' : ': este CEP não traz logradouro.'));
  }

  // ------------------------------------------------------------------ passo 5: conferência
  function itens() { var l = []; F.secoes.forEach(function (s) { s.itens.forEach(function (i) { l.push(i); }); }); return l; }
  /* Item que só existe conforme outra resposta (ex.: 3.3.1 da aquicultura, só para rio federal
   * ou reservatório). Fica fora da página, das pendências e do documento enquanto não vale. */
  function textoFixo(it) { return (it.texto || []).join(' '); }
  function visivel(it) { return !it.se || vale(it.se); }
  function itensVisiveis() { return itens().filter(visivel); }
  function respondido(it) {
    var r = E.r[it.n] || {};
    if (it.tipo === 'fixo') return true;
    if (it.tipo === 'texto' || it.tipo === 'longo') return cheio(r.t);
    if (it.tipo === 'uma') return typeof r.op === 'number';
    if (it.tipo === 'varias') return !!(r.ops && r.ops.length);
    if (it.tipo === 'lista_sn') return it.perguntas.every(function (q, i) { return (r.sn || {})[i]; });
    if (it.tipo === 'campos') return it.campos.some(function (c) { return cheio(c.motor ? E.txt[c.motor] : (r.k || {})[c.k]); });
    return true;
  }
  /* Todos os campos com formato preenchidos, para a conferência apontar os inválidos. */
  function camposComFormato() {
    var out = [];
    itensVisiveis().forEach(function (it) {
      var r = E.r[it.n] || {};
      if (it.fmt) out.push({ n: it.n, r: it.titulo, fmt: it.fmt, v: r.t });
      (it.campos || []).forEach(function (c) { if (c.fmt && !c.motor) out.push({ n: it.n, r: c.r, fmt: c.fmt, v: (r.k || {})[c.k], certidao: c.certidao }); });
      if (typeof r.op === 'number' && it.opcoes) (it.opcoes[r.op].campos || []).forEach(function (c) {
        if (c.fmt) out.push({ n: it.n, r: c.r, fmt: c.fmt, v: ((r.c || {})[r.op] || {})[c.k], certidao: c.certidao });
      });
    });
    return out;
  }
  function conferir() {
    var alertas = [], pend = [], ciencia = [], concl = null, cdeNaoFavoravel = false, nConcl = null;
    itensVisiveis().forEach(function (it) {
      if (it.conclusao) nConcl = it.n;
      if (it.confere && G) Object.keys(it.confere).forEach(function (dim) {
        var g = G[dim];
        if (g && g.codigo !== it.confere[dim]) alertas.push('Item ' + it.n + ': o formulário diz "' + textoFixo(it) + '", mas o enquadramento dá ' + (dim === 'comp' ? 'quem decide: ' : '') + g.texto + '.');
      });
      var r = E.r[it.n] || {}, lv = lembretesVisiveis(it);
      if (!respondido(it)) pend.push(it.n);
      if (lv.blocos.length && !cienteDe(it, lv)) ciencia.push(it.n);
      if (it.tipo === 'uma' && typeof r.op === 'number') {
        var o = it.opcoes[r.op];
        if (o.alerta) alertas.push(o.alerta);
        var co = it.coerencia;
        if (co && co.em.indexOf(conds()[co.cond]) >= 0 && co.ops.indexOf(r.op) < 0) alertas.push(co.texto);
        if (it.conclusao) concl = o;
        if (it.governanca) {
          var codigos = Array.isArray(it.governanca) ? it.governanca : ['cde'], sim = it.governanca_sim || 0;
          if (r.op === sim && ((r.c || {})[sim] || {}).resultado === 'nao_favoravel') cdeNaoFavoravel = true;
          if (G && G.manif && (r.op === sim) !== (codigos.indexOf(G.manif.codigo) >= 0))
            alertas.push('Item ' + it.n + ': a resposta marcada não confere com o enquadramento (' + G.manif.texto + ').');
          var onde = ((r.c || {})[r.op] || {}).onde;
          if (G && G.manif && onde && codigos.indexOf(G.manif.codigo) >= 0 && onde !== G.manif.codigo)
            alertas.push('Item ' + it.n + ': o cadastro marcado não confere com o enquadramento (' + G.manif.texto + ').');
        }
      }
      var escolhas = (it.campos || []).map(function (c) { return [c, (r.k || {})[c.k]]; });
      if (it.tipo === 'uma' && typeof r.op === 'number') (it.opcoes[r.op].campos || []).forEach(function (c) { escolhas.push([c, ((r.c || {})[r.op] || {})[c.k]]); });
      escolhas.forEach(function (x) {
        if (x[0].alertas && x[0].alertas[x[1]]) alertas.push(x[0].alertas[x[1]]);
        // Opção que pressupõe uma manifestação prévia (ex.: "Dispensada a manifestação prévia da CDE").
        if (x[0].manif && x[1] && x[0].manif[x[1]] && G && G.manif && x[0].manif[x[1]].indexOf(G.manif.codigo) < 0)
          alertas.push((it.conclusao ? 'Conclusão' : 'Item ' + it.n) + ': a manifestação prévia marcada não confere com o enquadramento (' + G.manif.texto + ').');
      });
      if (it.tipo === 'lista_sn') it.perguntas.forEach(function (q, i) {
        if ((r.sn || {})[i] === 'sim') alertas.push('Item ' + it.n + ', pergunta ' + (i + 1) + ': a resposta SIM é óbice ao prosseguimento.');
      });
    });
    camposComFormato().forEach(function (c) {
      var m = validar(c.fmt, c.v || '', true, { certidao: c.certidao });
      if (m) alertas.push('Item ' + c.n + ', ' + c.r.replace(/ \(.*\)$/, '') + ': ' + m);
    });
    var rc = E.r[nConcl] || {};
    if (concl && concl.fecho === 'favoravel') {
      if (cdeNaoFavoravel) alertas.push('A CDE se manifestou de forma não favorável (item 5.2), mas a conclusão marcada é favorável.');
      if (alertas.length) alertas.push('A conclusão marcada é favorável, mas há ponto(s) acima que geram indeferimento, óbice, diligência ou correção.');
      var enc = encaminhamento(rc.enc);
      if (enc && enc.esperado && G) {
        var dim = Object.keys(enc.esperado)[0], g = G[dim];
        if (g && g.codigo !== enc.esperado[dim]) alertas.push('Encaminhamento: o marcado não confere com o enquadramento (' + g.texto + ').');
      }
    }
    return { alertas: alertas, pend: pend, ciencia: ciencia, concl: concl };
  }
  function encaminhamento(k) { return (F.encaminhamento || []).filter(function (e) { return e.k === k; })[0] || null; }
  function irPara(n) {
    var alvo = $('item-' + n); if (!alvo) return;
    alvo.scrollIntoView({ block: 'start' });
    var campo = alvo.querySelector('input:not([type=radio]), textarea, select, input[type=radio]');
    if (campo) { try { campo.focus({ preventScroll: true }); } catch (e) { campo.focus(); } }
    alvo.classList.add('realce');
    setTimeout(function () { alvo.classList.remove('realce'); }, 3500);
  }
  function mostrarConferencia(c) {
    var alvo = $('atencao'); alvo.textContent = '';
    if (c.alertas.length) {
      var ul = el('ul'); c.alertas.forEach(function (a) { ul.appendChild(el('li', { text: a })); });
      alvo.appendChild(el('div', { class: 'alarme', role: 'alert' }, [el('h3', { text: 'Pontos de atenção (' + c.alertas.length + ')' }), ul]));
    }
    function saltosDe(lista) {
      var saltos = el('div', { class: 'saltos' });
      lista.forEach(function (n) {
        var it = itens().filter(function (x) { return x.n === n; })[0];
        var b = el('button', { type: 'button', text: it && it.conclusao ? 'Conclusão' : n, title: 'Ir para o item' });
        b.addEventListener('click', function () { irPara(n); });
        saltos.appendChild(b);
      });
      return saltos;
    }
    if (c.pend.length) {
      alvo.appendChild(el('div', { class: 'pendente' }, [el('h3', { text: 'Itens ainda sem resposta (' + c.pend.length + ')' }),
        el('p', { class: 'nota', text: 'Clique no número para ir direto ao item.' }), saltosDe(c.pend)]));
    }
    if (c.ciencia.length) {
      alvo.appendChild(el('div', { class: 'pendente' }, [el('h3', { text: 'Lembretes sem ciência (' + c.ciencia.length + ')' }),
        el('p', { class: 'nota', text: 'Leia o lembrete da Unidade Central e marque "Li e estou ciente". A ciência não vai para o documento do SEI.' }), saltosDe(c.ciencia)]));
    }
    if (!c.pend.length && !c.ciencia.length) {
      alvo.appendChild(el('div', { class: 'calmo' }, [el('strong', { text: 'Todos os itens têm resposta e todos os lembretes têm ciência.' })]));
    }
    var enc = $('encaminhamento');
    if (enc) {
      enc.hidden = !(c.concl && c.concl.fecho === 'favoravel');
      $('dica-encaminhamento').textContent = G && (G.comp || G.manif) ? 'Pelo enquadramento: ' + [G.manif ? G.manif.texto : '', G.comp ? 'quem decide: ' + G.comp.texto : ''].filter(Boolean).join('; ') + '.' : '';
    }
    var dg = $('dica-governanca');
    if (dg) dg.textContent = !temGovernanca() ? '' : G && G.manif ? 'Pelo enquadramento: ' + G.manif.texto + '.' : 'Responda o enquadramento, no alto da página, para ver a indicação da Governança.';
  }

  // ------------------------------------------------------------------ documento
  var EST = {
    titulo: ['Texto_Centralizado_Maiusculas_Negrito', 'font-size:13pt;font-family:Calibri;text-align:center;text-transform:uppercase;font-weight:bold;word-wrap:normal;margin:6pt;'],
    secao:  ['Texto_Alinhado_Esquerda', 'font-size:12pt;font-family:Calibri;text-align:left;font-weight:bold;text-transform:uppercase;word-wrap:normal;margin:12pt 6pt 6pt 6pt;'],
    texto:  ['Texto_Justificado', 'font-size:12pt;font-family:Calibri;text-align:justify;word-wrap:normal;margin:6pt;'],
    cel:    ['Tabela_Texto_Alinhado_Esquerda', 'font-size:11pt;font-family:Calibri;text-align:left;word-wrap:normal;margin:3pt;'],
    celc:   ['Tabela_Texto_Centralizado', 'font-size:11pt;font-family:Calibri;text-align:center;word-wrap:normal;margin:3pt;']
  };
  function Pd(tipo, html) { return '<p class="' + EST[tipo][0] + '" style="' + EST[tipo][1] + '">' + (html || '&nbsp;') + '</p>'; }
  function TD(html, larg, cab) {
    return '<td' + (larg ? ' width="' + larg + '"' : '') + ' style="border:1px solid #000;padding:4px;vertical-align:top;' + (cab ? 'background-color:#d9d9d9;' : '') + '">' + html + '</td>';
  }
  var TAB = '<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;margin-left:auto;margin-right:auto;"><tbody>';
  function docRef(v) { return cheio(v) ? ' (Doc. SEI nº ' + esc(String(v).trim()) + ')' : ''; }
  function valorCampo(c, v) {
    if (!cheio(v)) return '';
    if (c.fmt === 'docsei') return (c.doc ? esc(c.doc) : 'Documento') + docRef(v);
    if (c.fmt === 'municipio') return '<strong>' + esc(c.r) + ':</strong> ' + esc(String(v).split('|')[1] || v);
    if (c.fmt === 'uf') { var u = (window.ESTADOS || []).filter(function (x) { return x[0] === v; })[0]; return '<strong>' + esc(c.r) + ':</strong> ' + esc(u ? u[1] : v); }
    if (c.fmt === 'radio') { var o = c.valores.filter(function (x) { return x[0] === v; })[0]; return '<strong>' + esc(c.r) + ':</strong> ' + esc(o ? o[1] : v); }
    if (c.fmt === 'checks') return '<strong>' + esc(c.r) + ':</strong> ' + esc(c.valores.filter(function (x) { return v.indexOf(x[0]) >= 0; }).map(function (x) { return x[1]; }).join('; '));
    return '<strong>' + esc(c.r) + ':</strong> ' + esc(v).replace(/\n/g, '<br>');
  }
  function respostaHTML(it) {
    var r = E.r[it.n] || {}, h = [];
    if (it.tipo === 'fixo') it.texto.forEach(function (t) { h.push(comLinksHTML(t)); });
    else if (it.tipo === 'texto' || it.tipo === 'longo') { if (cheio(r.t)) h.push(esc(r.t).replace(/\n/g, '<br>')); }
    else if (it.tipo === 'campos') {
      it.campos.forEach(function (c) {
        var v = c.motor ? E.txt[c.motor] : (r.k || {})[c.k], s = valorCampo(c, v), ks = (r.ks || {})[c.k];
        if (s || cheio(ks)) h.push((s || '<strong>' + esc(c.r) + ':</strong> —') + docRef(ks));
      });
      if (it.imagem) h.push('[inserir a imagem aqui, no SEI]');
    } else if (it.tipo === 'uma') {
      if (typeof r.op === 'number') {
        var o = it.opcoes[r.op], cv = (r.c || {})[r.op] || {};
        h.push('( x ) ' + esc(o.n ? o.n + ' — ' : '') + comLinksHTML(o.t));
        (o.campos || []).forEach(function (c) { var s = valorCampo(c, cv[c.k]); if (s) h.push(s); });
      }
    } else if (it.tipo === 'varias') {
      (r.ops || []).slice().sort(function (a, b) { return a - b; }).forEach(function (i) { h.push('( x ) ' + comLinksHTML(it.opcoes[i].t)); });
    } else if (it.tipo === 'lista_sn') {
      it.perguntas.forEach(function (q, i) {
        var v = (r.sn || {})[i];
        h.push((i + 1) + '. ' + comLinksHTML(q.t) + ' <strong>' + (v === 'sim' ? '( x ) Sim (&nbsp;&nbsp;&nbsp;) Não' : v === 'nao' ? '(&nbsp;&nbsp;&nbsp;) Sim ( x ) Não' : '(&nbsp;&nbsp;&nbsp;) Sim (&nbsp;&nbsp;&nbsp;) Não') + '</strong>' + docRef((r.snsei || {})[i]));
      });
    }
    if (it.sei && cheio(r.sei)) h.push('Documento' + docRef(r.sei));
    return h.length ? h.map(function (x) { return Pd('cel', x); }).join('') : Pd('cel', '');
  }
  function blocosHTML(blocos) {
    return (blocos || []).map(function (b) {
      if (b.p) return Pd('texto', comLinksHTML(b.p));
      if (b.sub) return Pd('texto', '<strong>' + comLinksHTML(b.sub) + '</strong>');
      if (b.formula) return Pd('texto', '<strong>' + esc(b.formula) + '</strong>');
      if (b.lista) return b.lista.map(function (x) { return Pd('texto', comLinksHTML(x)); }).join('');
      return '';
    }).join('');
  }
  function documentoHTML() {
    var h = Pd('titulo', esc(F.titulo));
    h += Pd('texto', '<strong>Legislação de regência:</strong> ' + F.legislacao.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank">' + esc(l.t) + '</a>'; }).join(', ') + '.');
    if (G && (G.manif || G.comp)) {
      h += Pd('secao', 'Enquadramento na governança da destinação');
      h += TAB + '<tr>' + TD(Pd('celc', '<strong>Manifestação prévia</strong>'), '30%', 1) + TD(Pd('celc', '<strong>Quem decide</strong>'), '25%', 1) + TD(Pd('celc', '<strong>Fundamento</strong>'), '45%', 1) + '</tr>';
      h += '<tr>' + TD(Pd('cel', esc(G.manif ? G.manif.texto : '—'))) + TD(Pd('cel', esc(G.comp ? G.comp.texto : '—'))) +
           TD(Pd('cel', esc(G.manif ? G.manif.fundamento : '')) + (G.comp ? Pd('cel', esc(G.comp.fundamento)) : '')) + '</tr></tbody></table>';
    }
    F.secoes.forEach(function (s) {
      h += Pd('secao', esc(s.n + '. ' + s.titulo));
      if (s.intro) h += blocosHTML(s.intro);
      if (s.itens.length === 1 && s.itens[0].conclusao) { h += conclusaoHTML(s.itens[0]); return; }
      h += TAB + '<tr>' + TD(Pd('celc', '<strong>Item</strong>'), '30%', 1) + TD(Pd('celc', '<strong>Resposta</strong>'), '42%', 1) + TD(Pd('celc', '<strong>Observações e ressalvas</strong>'), '28%', 1) + '</tr>';
      s.itens.forEach(function (it) {
        if (!visivel(it)) return;
        var r = E.r[it.n] || {};
        h += '<tr>' + TD(Pd('cel', '<strong>' + esc(it.n) + '</strong> ' + esc(it.titulo))) + TD(respostaHTML(it)) + TD(Pd('cel', esc(r.obs || '').replace(/\n/g, '<br>'))) + '</tr>';
      });
      h += '</tbody></table>';
    });
    return h;
  }
  function conclusaoHTML(it) {
    var r = E.r[it.n] || {}, h = '';
    if (typeof r.op !== 'number') return Pd('texto', '[conclusão não marcada]');
    var o = it.opcoes[r.op], cv = (r.c || {})[r.op] || {};
    h += Pd('texto', '<strong>' + esc(o.n) + '</strong> ( x ) ' + comLinksHTML(o.t));
    (o.campos || []).forEach(function (c) { var s = valorCampo(c, cv[c.k]); if (s) h += Pd('texto', s); });
    var enc = o.fecho === 'favoravel' ? encaminhamento(r.enc) : null;
    if (enc) h += Pd('texto', 'Encaminhamento: ( x ) ' + comLinksHTML(enc.t));
    if (cheio(r.obs)) h += Pd('texto', '<strong>Observações e ressalvas:</strong> ' + esc(r.obs).replace(/\n/g, '<br>'));
    var fecho = o.fecho_texto || (enc && enc.fecho) || (F.fecho || {})[o.fecho] || '';
    if (it.antes_fecho) h += blocosHTML(it.antes_fecho);
    if (cheio(E.txt.valor)) fecho = fecho.replace('R$ _____', 'R$ ' + E.txt.valor);
    if (fecho) h += Pd('texto', comLinksHTML(fecho));
    h += Pd('texto', 'À consideração superior.');
    return h;
  }
  function textoSimples(html) { var d = document.createElement('div'); d.innerHTML = html; return d.innerText || d.textContent || ''; }
  function copiar(html) {
    function antigo() {
      var div = document.createElement('div'); div.contentEditable = 'true'; div.style.cssText = 'position:fixed;left:-9999px;top:0'; div.innerHTML = html;
      document.body.appendChild(div);
      var sel = window.getSelection(), f = document.createRange(); f.selectNodeContents(div); sel.removeAllRanges(); sel.addRange(f);
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      sel.removeAllRanges(); div.remove(); return ok;
    }
    if (navigator.clipboard && window.ClipboardItem) {
      return navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([textoSimples(html)], { type: 'text/plain' }) })])
        .then(function () { return true; }, function () { return antigo(); });
    }
    return Promise.resolve(antigo());
  }

  // ------------------------------------------------------------------ ciclo
  function atualizar() {
    if (!F) return;
    if (temGovernanca()) calcularEnquadramento();
    itens().forEach(function (it) { if (it.se) { var d = $('item-' + it.n); if (d) d.hidden = !visivel(it); } });
    atualizarLembretes();
    mostrarConferencia(conferir());
    if ($('previa-det').open) $('previa').innerHTML = documentoHTML();
  }
  function iniciar() {
    carregar(); montarSelecao(); abrirFormulario();
    ligarCaixinha();
    ['formulario', 'enq-campos'].forEach(function (id) {
      $(id).addEventListener('input', aoEditar);
      $(id).addEventListener('change', aoEditar);
      $(id).addEventListener('focusout', aoSair);
    });
    $('previa-det').addEventListener('toggle', function () { if ($('previa-det').open) $('previa').innerHTML = documentoHTML(); });
    $('bt-copiar').addEventListener('click', function () {
      copiar(documentoHTML()).then(function (ok) {
        $('status').textContent = ok ? 'Copiado. No SEI, clique no corpo do documento e cole com Ctrl+V.' : 'O navegador não deixou copiar. Abra "Ver o documento", selecione o conteúdo e use Ctrl+C.';
      });
    });
    $('bt-imprimir').addEventListener('click', function () { $('impressao').innerHTML = documentoHTML(); window.print(); });
    $('bt-limpar').addEventListener('click', function () {
      if (!window.confirm('Apagar tudo o que foi preenchido neste formulário? Não dá para desfazer.')) return;
      E = novoEstado(E.form); salvar(); abrirFormulario(); $('status').textContent = 'Formulário limpo.';
    });
  }
  /* Caixinha do Escritório: o relato cai em home.pedidos e aparece na área da equipe da Home
   * EPP. Dois botões, uma ficha só (regra de 13/11/2026): o balão "Reportar problema", fixo no
   * canto da tela, e "Fale com a equipe" no rodapé. O caso vai junto: qual formulário e qual versão. */
  function ligarCaixinha() {
    if (!window.SPUCaixinha) return;
    SPUCaixinha.iniciar({
      ferramenta: 'formularios',
      nome: 'Formulários de Instrução de Destinação',
      rotuloBotao: 'Reportar problema',
      contexto: function () {
        return F ? [['Formulário', F.nome], ['Versão do formulário', F.origem.versao]] : [['Formulário', 'nenhum escolhido']];
      }
    });
    $('fale').addEventListener('click', function () { SPUCaixinha.abrir(); });
  }
  window.__FI = { estado: function () { return E; }, documento: function () { return F ? documentoHTML() : ''; }, governanca: function () { return G; },
                  formatar: formatar, validar: validar };
  iniciar();
})();
