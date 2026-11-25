window.Fases[3] = {
  palavras: ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'],
  conclusoes: [
    'Este é o número zero. Não temos nenhuma maçã.',
    'Uma maçã! Número um!',
    'Duas maçãs! Número dois!',
    'Três maçãs! Número três!',
    'Quatro maçãs! Número quatro!',
    'Cinco maçãs! Número cinco!',
    'Seis maçãs! Número seis!',
    'Sete maçãs! Número sete!',
    'Oito maçãs! Número oito!',
    'Nove maçãs! Número nove!',
    'Dez maçãs! Número dez!'
  ],
  rodadas: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 8, 10]
  ],
  rodadaAtual: 0,
  selecaoEsq: null,
  selecaoDir: null,
  paresConectados: 0,

  iniciar() {
    this.rodadaAtual = 0;
    Jogo.definirInstrucao('Vamos contar as maçãs de zero até dez!', true, () => this.apresentarNumero(0));
  },

  apresentarNumero(num) {
    if (Jogo.faseAtual !== 3) return;

    if (num <= 10) {
      const areaJogo = document.getElementById('area-jogo');
      areaJogo.innerHTML = `
        <div class="palco-apresentacao">
          <div class="numero-gigante" id="numero-principal">${num}</div>
          <div class="cesta-apresentacao" id="cesta-contagem"></div>
        </div>
      `;

      if (num === 0) {
        const numEl = document.getElementById('numero-principal');
        if (numEl) numEl.classList.add('pulsar-destaque');

        Jogo.definirInstrucao(this.conclusoes[0], true, () => {
          if (numEl) numEl.classList.remove('pulsar-destaque');
          setTimeout(() => this.apresentarNumero(1), 250);
        });
      } else {
        Jogo.definirInstrucao(`Vamos contar até ${this.palavras[num]}!`);
        // Pré-aquece o canal de áudio do Android antes do "1"
        if (Jogo.aquecerVoz) Jogo.aquecerVoz();
        setTimeout(() => this.contarUmaAUma(num, 1), 120);
      }
    } else {
      this.iniciarRodadaLigar();
    }
  },

  contarUmaAUma(alvoNum, atual) {
    if (Jogo.faseAtual !== 3) return;

    if (atual <= alvoNum) {
      const cesta = document.getElementById('cesta-contagem');
      if (cesta) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-contagem';
        itemDiv.innerHTML = `
          <span class="numero-topo-maca">${atual}</span>
          <span class="maca-icone">🍎</span>
        `;
        cesta.appendChild(itemDiv);
      }

      // O ponto de exclamação evita que o motor TTS do Android engula a sílaba curta "um"
      const textoFala = atual === 1 ? 'Um!' : `${this.palavras[atual]}!`;

      Jogo.falar(textoFala, () => {
        setTimeout(() => this.contarUmaAUma(alvoNum, atual + 1), 150);
      });
    } else {
      const numEl = document.getElementById('numero-principal');
      if (numEl) numEl.classList.add('pulsar-destaque');

      Jogo.definirInstrucao(this.conclusoes[alvoNum], true, () => {
        if (numEl) numEl.classList.remove('pulsar-destaque');
        setTimeout(() => this.apresentarNumero(alvoNum + 1), 300);
      });
    }
  },

  iniciarRodadaLigar() {
    if (Jogo.faseAtual !== 3) return;

    Jogo.estado = 'jogando';
    this.selecaoEsq = null;
    this.selecaoDir = null;
    this.paresConectados = 0;

    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const numeros = this.rodadas[this.rodadaAtual];
    const embaralhados = [...numeros].sort(() => Math.random() - 0.5);

    const esqHTML = numeros.map(n => {
      const conteudo = n === 0 ? '' : '🍎'.repeat(n);
      const classeTam = n >= 6 ? 'macas-medias' : '';
      return `<div class="card-ligar ${classeTam}" id="esq-${n}" onclick="window.Fases[3].selecionar('esq', ${n})">${conteudo}</div>`;
    }).join('');

    const dirHTML = embaralhados.map(n => {
      return `<div class="card-ligar numero-card" id="dir-${n}" onclick="window.Fases[3].selecionar('dir', ${n})">${n}</div>`;
    }).join('');

    areaJogo.innerHTML = `
      <div class="container-ligar" id="container-ligar">
        <svg id="svg-linhas"></svg>
        <div class="coluna-ligar">${esqHTML}</div>
        <div class="coluna-ligar">${dirHTML}</div>
      </div>
    `;

    Jogo.definirInstrucao('Agora ligue a quantidade de maçãs ao número certo! Toque nas maçãs e depois no número.', true);
  },

  selecionar(lado, valor) {
    if (Jogo.estado !== 'jogando') return;

    if (lado === 'esq') {
      document.querySelectorAll('[id^="esq-"]').forEach(el => el.classList.remove('selecionado'));
      this.selecaoEsq = valor;
      document.getElementById(`esq-${valor}`).classList.add('selecionado');
    } else {
      document.querySelectorAll('[id^="dir-"]').forEach(el => el.classList.remove('selecionado'));
      this.selecaoDir = valor;
      document.getElementById(`dir-${valor}`).classList.add('selecionado');
    }

    if (this.selecaoEsq !== null && this.selecaoDir !== null) {
      const elEsq = document.getElementById(`esq-${this.selecaoEsq}`);
      const elDir = document.getElementById(`dir-${this.selecaoDir}`);

      if (this.selecaoEsq === this.selecaoDir) {
        elEsq.classList.remove('selecionado');
        elDir.classList.remove('selecionado');
        elEsq.classList.add('conectado');
        elDir.classList.add('conectado');

        this.desenharLinha(elEsq, elDir);
        this.paresConectados++;

        const acertado = this.selecaoEsq;
        this.selecaoEsq = null;
        this.selecaoDir = null;

        if (this.paresConectados === 3) {
          this.rodadaAtual++;
          if (this.rodadaAtual < this.rodadas.length) {
            Jogo.falar(`Muito bem! Número ${acertado}! Vamos ligar mais números!`, () => {
              setTimeout(() => this.iniciarRodadaLigar(), 600);
            });
          } else {
            Jogo.concluirFase();
          }
        } else {
          Jogo.falar(`Isso mesmo! ${acertado}!`);
        }
      } else {
        elEsq.classList.add('erro');
        elDir.classList.add('erro');
        setTimeout(() => {
          elEsq.classList.remove('erro', 'selecionado');
          elDir.classList.remove('erro', 'selecionado');
        }, 400);

        this.selecaoEsq = null;
        this.selecaoDir = null;
        Jogo.falar('Ops! Conte as maçãs com calma e tente ligar de novo!');
      }
    }
  },

  desenharLinha(el1, el2) {
    const container = document.getElementById('container-ligar').getBoundingClientRect();
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();

    const svg = document.getElementById('svg-linhas');
    const linha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linha.setAttribute('x1', r1.right - container.left);
    linha.setAttribute('y1', r1.top + r1.height / 2 - container.top);
    linha.setAttribute('x2', r2.left - container.left);
    linha.setAttribute('y2', r2.top + r2.height / 2 - container.top);
    linha.setAttribute('stroke', '#4CAF50');
    linha.setAttribute('stroke-width', '8');
    linha.setAttribute('stroke-linecap', 'round');
    svg.appendChild(linha);
  }
};