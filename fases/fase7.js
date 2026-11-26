window.Fases[7] = {
  exemplos: [
    {
      totalInicial: 3,
      tirar: 1,
      sobra: 2,
      fruta: '🍎',
      intro: 'Veja só: temos três maçãs. Vamos tirar uma maçã! Quantas sobram?',
      conclusao: 'Três menos um é igual a dois! Sobraram duas maçãs!'
    },
    {
      totalInicial: 4,
      tirar: 2,
      sobra: 2,
      fruta: '🍌',
      intro: 'Agora temos quatro bananas. Vamos tirar duas bananas! Quantas sobram?',
      conclusao: 'Quatro menos dois é igual a dois! Sobraram duas bananas!'
    }
  ],

  desafios: [
    {
      totalInicial: 2, tirar: 1, resposta: 1, fruta: '🍎',
      opcoes: [1, 2, 3],
      fala: 'Tínhamos duas maçãs e tiramos uma. Quantas maçãs sobraram?'
    },
    {
      totalInicial: 4, tirar: 1, resposta: 3, fruta: '🍌',
      opcoes: [2, 3, 5],
      fala: 'Tínhamos quatro bananas e tiramos uma. Quantas bananas sobraram?'
    },
    {
      totalInicial: 5, tirar: 2, resposta: 3, fruta: '🍎',
      opcoes: [3, 4, 1],
      fala: 'Tínhamos cinco maçãs e tiramos duas. Quantas maçãs sobraram?'
    },
    {
      totalInicial: 3, tirar: 3, resposta: 0, fruta: '🍌',
      opcoes: [1, 3, 0],
      fala: 'Desafio final: tínhamos três bananas e comemos todas as três! Quantas sobraram?'
    }
  ],

  indiceDesafio: 0,

  iniciar() {
    this.indiceDesafio = 0;
    Jogo.definirInstrucao(
      'Bem-vindo à Subtração! Subtrair é tirar coisas! Este tracinho se chama MENOS!',
      true,
      () => this.apresentarExemplo(0)
    );
  },

  montarFrutasVisuais(total, tiradas, fruta, marcarTiradas) {
    let html = '';
    const restantes = total - tiradas;
    for (let i = 0; i < total; i++) {
      if (marcarTiradas && i >= restantes) {
        html += `<span class="fruta-tirada">${fruta}</span>`;
      } else {
        html += `<span>${fruta}</span>`;
      }
    }
    return html;
  },

  apresentarExemplo(index) {
    if (Jogo.faseAtual !== 7) return;

    if (index < this.exemplos.length) {
      const ex = this.exemplos[index];
      const areaJogo = document.getElementById('area-jogo');

      areaJogo.innerHTML = `
        <div class="palco-subtracao">
          <div class="grupo-fruta">
            <span class="frutas" id="frutas-ex-sub">${this.montarFrutasVisuais(ex.totalInicial, ex.tirar, ex.fruta, false)}</span>
            <span class="sub-num">${ex.totalInicial}</span>
          </div>
          <div class="sinal-matematico" style="color:#D32F2F;">−</div>
          <div class="grupo-fruta">
            <span class="frutas">${ex.fruta.repeat(ex.tirar)}</span>
            <span class="sub-num">${ex.tirar}</span>
          </div>
          <div class="sinal-matematico">=</div>
          <div class="cesta-resultado-soma" id="cesta-sub-ex"></div>
        </div>
      `;

      Jogo.definirInstrucao(ex.intro, true, () => {
        // Marca as frutas retiradas com X e mostra as que sobraram na cesta
        const vitrine = document.getElementById('frutas-ex-sub');
        if (vitrine) {
          vitrine.innerHTML = this.montarFrutasVisuais(ex.totalInicial, ex.tirar, ex.fruta, true);
        }
        this.contarSobras(ex, 0, index);
      });
    } else {
      this.iniciarDesafio();
    }
  },

  contarSobras(ex, pos, indexExemplo) {
    if (Jogo.faseAtual !== 7) return;
    const palavras = ['um', 'dois', 'três', 'quatro'];

    if (pos < ex.sobra) {
      const cesta = document.getElementById('cesta-sub-ex');
      if (cesta) {
        let linha = document.getElementById('linha-sobras-ex');
        if (!linha) {
          linha = document.createElement('div');
          linha.id = 'linha-sobras-ex';
          cesta.appendChild(linha);
        }
        const span = document.createElement('span');
        span.className = 'maca-animada';
        span.textContent = ex.fruta;
        linha.appendChild(span);
      }

      Jogo.falar(palavras[pos], () => {
        setTimeout(() => this.contarSobras(ex, pos + 1, indexExemplo), 200);
      });
    } else {
      const cesta = document.getElementById('cesta-sub-ex');
      if (cesta) {
        const totalEl = document.createElement('div');
        totalEl.className = 'sub-num pulsar-destaque';
        totalEl.style.fontSize = '2.8rem';
        totalEl.textContent = ex.sobra;
        cesta.appendChild(totalEl);
      }

      Jogo.definirInstrucao(ex.conclusao, true, () => {
        setTimeout(() => this.apresentarExemplo(indexExemplo + 1), 600);
      });
    }
  },

  iniciarDesafio() {
    if (Jogo.faseAtual !== 7) return;

    Jogo.estado = 'jogando';
    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const d = this.desafios[this.indiceDesafio];
    const opcoesHTML = d.opcoes.map(op => `
      <button class="btn-opcao-num" onclick="window.Fases[7].verificar(${op}, this)">${op}</button>
    `).join('');

    areaJogo.innerHTML = `
      <div class="container-sequencia">
        <div class="palco-subtracao">
          <div class="grupo-fruta">
            <span class="frutas">${this.montarFrutasVisuais(d.totalInicial, d.tirar, d.fruta, true)}</span>
            <span class="sub-num">${d.totalInicial}</span>
          </div>
          <div class="sinal-matematico" style="color:#D32F2F;">−</div>
          <div class="grupo-fruta">
            <span class="frutas">${d.fruta.repeat(d.tirar)}</span>
            <span class="sub-num">${d.tirar}</span>
          </div>
          <div class="sinal-matematico">=</div>
          <div class="cesta-resultado-soma" id="alvo-sub">?</div>
        </div>
        <div class="opcoes-sequencia">${opcoesHTML}</div>
      </div>
    `;

    Jogo.definirInstrucao(d.fala, true);
  },

  verificar(escolha, botaoEl) {
    if (Jogo.estado !== 'jogando') return;
    const d = this.desafios[this.indiceDesafio];

    if (escolha === d.resposta) {
      Jogo.estado = 'apresentando';
      const alvo = document.getElementById('alvo-sub');
      if (alvo) {
        const frutasRestantes = d.resposta > 0 ? d.fruta.repeat(d.resposta) : '🪹';
        alvo.innerHTML = `
          <div>${frutasRestantes}</div>
          <div class="sub-num" style="color:#1B5E20;">${d.resposta}</div>
        `;
      }

      this.indiceDesafio++;
      if (this.indiceDesafio < this.desafios.length) {
        Jogo.falar(`Isso mesmo! ${d.totalInicial} menos ${d.tirar} é igual a ${d.resposta}!`, () => {
          setTimeout(() => this.iniciarDesafio(), 700);
        });
      } else {
        Jogo.falar('Parabéns! Você aprendeu a subtrair!', () => Jogo.concluirFase());
      }
    } else {
      botaoEl.classList.add('erro');
      setTimeout(() => botaoEl.classList.remove('erro'), 350);
      Jogo.falar('Quase lá! Conte apenas as frutas que não têm o xis e tente de novo!');
    }
  }
};