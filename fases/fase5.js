window.Fases[5] = {
  exemplos: [
    {
      a: 1, frutaA: '🍎',
      b: 1, frutaB: '🍌',
      total: 2,
      intro: 'Veja só: temos uma maçã mais uma banana. Vamos juntar tudo para contar!',
      conclusao: 'Um mais um é igual a dois!'
    },
    {
      a: 2, frutaA: '🍎',
      b: 1, frutaB: '🍌',
      total: 3,
      intro: 'Agora temos duas maçãs mais uma banana. Vamos juntar e contar!',
      conclusao: 'Dois mais um é igual a três!'
    }
  ],

  desafios: [
    { a: 1, frutaA: '🍎', b: 2, frutaB: '🍎', resposta: 3, opcoes: [2, 3, 5], fala: 'Quanto é uma maçã mais duas maçãs?' },
    { a: 2, frutaA: '🍌', b: 2, frutaB: '🍌', resposta: 4, opcoes: [4, 1, 6], fala: 'Quanto é duas bananas mais duas bananas?' },
    { a: 3, frutaA: '🍎', b: 1, frutaB: '🍌', resposta: 4, opcoes: [2, 5, 4], fala: 'Quanto é três maçãs mais uma banana?' },
    { a: 3, frutaA: '🍎', b: 2, frutaB: '🍎', resposta: 5, opcoes: [5, 3, 7], fala: 'Para terminar: quanto é três maçãs mais duas maçãs?' }
  ],

  indiceDesafio: 0,

  iniciar() {
    this.indiceDesafio = 0;
    Jogo.definirInstrucao(
      'Bem-vindo à Soma Divertida! Somar é juntar coisas! O sinal de mais junta, e o de igual mostra o resultado!',
      true,
      () => this.apresentarExemplo(0)
    );
  },

  apresentarExemplo(index) {
    if (Jogo.faseAtual !== 5) return;

    if (index < this.exemplos.length) {
      const ex = this.exemplos[index];
      const areaJogo = document.getElementById('area-jogo');

      areaJogo.innerHTML = `
        <div class="palco-soma">
          <div class="grupo-fruta">
            <span class="frutas">${ex.frutaA.repeat(ex.a)}</span>
            <span class="sub-num">${ex.a}</span>
          </div>
          <div class="sinal-matematico">+</div>
          <div class="grupo-fruta">
            <span class="frutas">${ex.frutaB.repeat(ex.b)}</span>
            <span class="sub-num">${ex.b}</span>
          </div>
          <div class="sinal-matematico">=</div>
          <div class="cesta-resultado-soma" id="cesta-soma-ex"></div>
        </div>
      `;

      Jogo.definirInstrucao(ex.intro, true, () => {
        const listaFrutas = [
          ...Array(ex.a).fill(ex.frutaA),
          ...Array(ex.b).fill(ex.frutaB)
        ];
        this.contarJuntas(listaFrutas, 0, ex, index);
      });
    } else {
      this.iniciarDesafio();
    }
  },

  contarJuntas(listaFrutas, pos, ex, indexExemplo) {
    if (Jogo.faseAtual !== 5) return;
    const palavras = ['um', 'dois', 'três', 'quatro', 'cinco'];

    if (pos < listaFrutas.length) {
      const cesta = document.getElementById('cesta-soma-ex');
      if (cesta) {
        let linhaFrutas = document.getElementById('linha-frutas-ex');
        if (!linhaFrutas) {
          linhaFrutas = document.createElement('div');
          linhaFrutas.id = 'linha-frutas-ex';
          cesta.appendChild(linhaFrutas);
        }
        const span = document.createElement('span');
        span.className = 'maca-animada';
        span.textContent = listaFrutas[pos];
        linhaFrutas.appendChild(span);
      }

      Jogo.falar(palavras[pos], () => {
        setTimeout(() => this.contarJuntas(listaFrutas, pos + 1, ex, indexExemplo), 200);
      });
    } else {
      const cesta = document.getElementById('cesta-soma-ex');
      if (cesta) {
        const totalEl = document.createElement('div');
        totalEl.className = 'sub-num pulsar-destaque';
        totalEl.style.fontSize = '2.8rem';
        totalEl.textContent = ex.total;
        cesta.appendChild(totalEl);
      }

      Jogo.definirInstrucao(ex.conclusao, true, () => {
        setTimeout(() => this.apresentarExemplo(indexExemplo + 1), 600);
      });
    }
  },

  iniciarDesafio() {
    if (Jogo.faseAtual !== 5) return;

    Jogo.estado = 'jogando';
    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const d = this.desafios[this.indiceDesafio];
    const opcoesHTML = d.opcoes.map(op => `
      <button class="btn-opcao-num" onclick="window.Fases[4].verificar(${op}, this)">${op}</button>
    `).join('');

    areaJogo.innerHTML = `
      <div class="container-sequencia">
        <div class="palco-soma">
          <div class="grupo-fruta">
            <span class="frutas">${d.frutaA.repeat(d.a)}</span>
            <span class="sub-num">${d.a}</span>
          </div>
          <div class="sinal-matematico">+</div>
          <div class="grupo-fruta">
            <span class="frutas">${d.frutaB.repeat(d.b)}</span>
            <span class="sub-num">${d.b}</span>
          </div>
          <div class="sinal-matematico">=</div>
          <div class="cesta-resultado-soma" id="alvo-soma">?</div>
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
      const alvo = document.getElementById('alvo-soma');
      if (alvo) {
        alvo.innerHTML = `
          <div>${d.frutaA.repeat(d.a)}${d.frutaB.repeat(d.b)}</div>
          <div class="sub-num" style="color:#1B5E20;">${d.resposta}</div>
        `;
      }

      this.indiceDesafio++;
      if (this.indiceDesafio < this.desafios.length) {
        Jogo.falar(`Muito bem! ${d.a} mais ${d.b} é igual a ${d.resposta}!`, () => {
          setTimeout(() => this.iniciarDesafio(), 700);
        });
      } else {
        Jogo.falar('Parabéns! Você aprendeu a somar!', () => Jogo.concluirFase());
      }
    } else {
      botaoEl.classList.add('erro');
      setTimeout(() => botaoEl.classList.remove('erro'), 350);
      Jogo.falar('Quase lá! Conte todas as frutas juntas e tente de novo!');
    }
  }
};