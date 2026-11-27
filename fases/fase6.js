window.Fases[6] = {
  etapas: [
    {
      tipo: 'blocos',
      titulo: 'UNIDADES (De 1 em 1)',
      introducao: 'Quando contamos uma maçã de cada vez, temos as unidades!',
      icone: '🍎',
      valores: [1, 2, 3, 4, 5],
      falas: ['um', 'dois', 'três', 'quatro', 'cinco']
    },
    {
      tipo: 'blocos',
      titulo: 'DEZENAS (De 10 em 10)',
      introducao: 'Quando juntamos dez maçãs na cesta, formamos uma dezena! Veja como contamos de dez em dez!',
      icone: '<img src="img/cesta-macas.png" alt="Cesta de maçãs" class="img-ordem">',
      valores: [10, 20, 30],
      falas: ['dez', 'vinte', 'trinta']
    },
    {
      tipo: 'composicao',
      titulo: 'DEPOIS DO 10 (10 + Unidades)',
      introducao: 'E o que vem depois do dez? É só juntar a cesta de dez com mais maçãs! Veja só!',
      itens: [
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎',
          resultado: 11,
          fala: 'Dez mais um, onze!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎',
          resultado: 12,
          fala: 'Dez mais dois, doze!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎🍎',
          resultado: 13,
          fala: 'Dez mais três, treze!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎🍎🍎',
          resultado: 14,
          fala: 'Dez mais quatro, quatorze!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎🍎🍎🍎',
          resultado: 15,
          fala: 'Dez mais cinco, quinze!'
        }
      ]
    },
    {
      tipo: 'composicao',
      titulo: 'DEPOIS DO 20 (20 + Unidades)',
      introducao: 'Com o vinte é a mesma coisa! Duas cestas de dez mais as maçãs soltas!',
      itens: [
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"><img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎',
          resultado: 21,
          fala: 'Vinte mais um, vinte e um!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"><img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎',
          resultado: 22,
          fala: 'Vinte mais dois, vinte e dois!'
        },
        {
          visual: '<img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"><img src="img/cesta-macas.png" alt="Cesta" class="img-ordem-mini"> + 🍎🍎🍎',
          resultado: 23,
          fala: 'Vinte mais três, vinte e três!'
        }
      ]
    },
    {
      tipo: 'blocos',
      titulo: 'CENTENAS (De 100 em 100)',
      introducao: 'Dez cestas enchem uma caixa de cem maçãs, formando uma centena! Vamos contar de cem em cem!',
      icone: '<img src="img/caixa-macas.png" alt="Caixa de maçãs" class="img-ordem">',
      valores: [100, 200, 300],
      falas: ['cem', 'duzentos', 'trezentos']
    },
    {
      tipo: 'blocos',
      titulo: 'MILHAR (De 1000 em 1000)',
      introducao: 'E dez caixotes enchem um caminhão com mil maçãs, formando um milhar! Vamos contar de mil em mil!',
      icone: '<img src="img/caminhao-macas.png" alt="Caminhão de maçãs" class="img-ordem img-caminhao">',
      valores: [1000, 2000, 3000],
      falas: ['mil', 'dois mil', 'três mil']
    }
  ],

  desafios: [
    { nivel: 'as unidades', sequencia: [1, 2, 3], resposta: 4, opcoes: [4, 6, 9] },
    { nivel: 'os números depois do dez', sequencia: [10, 11, 12], resposta: 13, opcoes: [13, 18, 20] },
    { nivel: 'os números depois do vinte', sequencia: [20, 21, 22], resposta: 23, opcoes: [25, 23, 30] },
    { nivel: 'as dezenas', sequencia: [10, 20, 30], resposta: 40, opcoes: [25, 40, 80] },
    { nivel: 'as centenas', sequencia: [100, 200, 300], resposta: 400, opcoes: [150, 400, 900] },
    { nivel: 'os milhares', sequencia: [1000, 2000, 3000], resposta: 4000, opcoes: [4000, 500, 100] }
  ],
  indiceDesafio: 0,

  preCarregarImagens() {
    const arquivos = [
      'img/cesta-macas.png',
      'img/caixa-macas.png',
      'img/caminhao-macas.png'
    ];
    arquivos.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  },

  iniciar() {
    this.preCarregarImagens();
    this.indiceDesafio = 0;
    Jogo.definirInstrucao('Vamos aprender como os números crescem depois do dez, nas dezenas, centenas e milhares!', true, () => this.apresentarOrdem(0));
  },

  apresentarOrdem(indexEtapa) {
    if (Jogo.faseAtual !== 6) return;

    if (indexEtapa < this.etapas.length) {
      const etapa = this.etapas[indexEtapa];
      const areaJogo = document.getElementById('area-jogo');
      if (!areaJogo) return;

      areaJogo.innerHTML = `
        <div class="palco-ordens">
          <div class="titulo-ordem">${etapa.titulo}</div>
          <div class="vitrine-blocos" id="vitrine-blocos"></div>
        </div>
      `;

      Jogo.definirInstrucao(etapa.introducao, true, () => {
        if (etapa.tipo === 'blocos') {
          this.mostrarBlocos(etapa, 0, indexEtapa);
        } else {
          this.mostrarComposicao(etapa, 0, indexEtapa);
        }
      });
    } else {
      this.iniciarDesafio();
    }
  },

  mostrarBlocos(etapa, indexItem, indexEtapa) {
    if (Jogo.faseAtual !== 6) return;

    if (indexItem < etapa.valores.length) {
      const vitrine = document.getElementById('vitrine-blocos');
      if (vitrine) {
        const bloco = document.createElement('div');
        bloco.className = 'bloco-ordem';
        bloco.innerHTML = `
          <span class="icone">${etapa.icone}</span>
          <span class="valor">${etapa.valores[indexItem]}</span>
        `;
        vitrine.appendChild(bloco);
      }

      Jogo.falar(etapa.falas[indexItem], () => {
        setTimeout(() => this.mostrarBlocos(etapa, indexItem + 1, indexEtapa), 250);
      });
    } else {
      setTimeout(() => this.apresentarOrdem(indexEtapa + 1), 600);
    }
  },

  mostrarComposicao(etapa, indexItem, indexEtapa) {
    if (Jogo.faseAtual !== 6) return;

    if (indexItem < etapa.itens.length) {
      const item = etapa.itens[indexItem];
      const vitrine = document.getElementById('vitrine-blocos');
      if (vitrine) {
        vitrine.innerHTML = `
          <div class="composicao-card">
            <span class="composicao-visual">${item.visual}</span>
            <span>=</span>
            <span class="composicao-resultado">${item.resultado}</span>
          </div>
        `;
      }

      Jogo.falar(item.fala, () => {
        setTimeout(() => this.mostrarComposicao(etapa, indexItem + 1, indexEtapa), 350);
      });
    } else {
      setTimeout(() => this.apresentarOrdem(indexEtapa + 1), 600);
    }
  },

  iniciarDesafio() {
    if (Jogo.faseAtual !== 6) return;

    Jogo.estado = 'jogando';
    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const desafio = this.desafios[this.indiceDesafio];
    const slotsHTML = desafio.sequencia.map(n => `<div class="slot-num">${n}</div>`).join('');
    const opcoesHTML = desafio.opcoes.map(op => `
      <button class="btn-opcao-num" onclick="window.Fases[6].verificar(${op}, this)">${op}</button>
    `).join('');

    areaJogo.innerHTML = `
      <div class="container-sequencia">
        <div class="fila-numeros">
          ${slotsHTML}
          <div class="slot-num interrogacao" id="slot-alvo">?</div>
        </div>
        <div class="opcoes-sequencia">${opcoesHTML}</div>
      </div>
    `;

    Jogo.definirInstrucao(`Vamos ver até onde você sabe contar! ${desafio.sequencia.join(', ')}... Qual número vem agora?`, true);
  },

  verificar(escolha, botaoEl) {
    if (Jogo.estado !== 'jogando') return;
    const desafio = this.desafios[this.indiceDesafio];

    if (escolha === desafio.resposta) {
      Jogo.estado = 'apresentando';
      const slotAlvo = document.getElementById('slot-alvo');
      if (slotAlvo) {
        slotAlvo.textContent = escolha;
        slotAlvo.classList.remove('interrogacao');
        slotAlvo.style.background = '#C8E6C9';
        slotAlvo.style.color = '#1B5E20';
      }

      this.indiceDesafio++;
      if (this.indiceDesafio < this.desafios.length) {
        Jogo.falar(`Isso mesmo! ${escolha}! Vamos continuar!`, () => {
          setTimeout(() => this.iniciarDesafio(), 600);
        });
      } else {
        Jogo.falar('Incrível! Você já sabe contar até os milhares!', () => Jogo.concluirFase());
      }
    } else {
      botaoEl.classList.add('erro');
      setTimeout(() => botaoEl.classList.remove('erro'), 350);
      Jogo.falar(`Quase lá! Esse é o ${escolha}. Observe a sequência ${desafio.sequencia.join(', ')} e tente de novo!`);
    }
  }
};