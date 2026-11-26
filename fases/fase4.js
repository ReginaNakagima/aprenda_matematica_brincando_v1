window.Fases[4] = {
  desafios: [
    {
      numero: 1,
      aceitos: ['1', 'um', 'uma', 'hum', 'uno', 'bom', 'com', 'uns'],
      dica: 'Diga bem alto: UM!'
    },
    {
      numero: 3,
      aceitos: ['3', 'três', 'tres', 'treis', 'fez', 'vez', 'mês', 'mes', 'tais', 'reis'],
      dica: 'Que número é este? Diga em voz alta!'
    },
    {
      numero: 5,
      aceitos: ['5', 'cinco', 'sinto', 'cinto', 'sim', 'sinco', 'circo'],
      dica: 'E este número aqui? Fale no microfone!'
    },
    {
      numero: 0,
      aceitos: ['0', 'zero', 'quero', 'cera', 'fera', 'serra', 'zelo', 'certo'],
      dica: 'Este é redondinho! Qual é o nome dele?'
    },
    {
      numero: 7,
      aceitos: ['7', 'sete', 'set', 'sede', 'certa', 'certo', 'cega', 'seco'],
      dica: 'Agora fale o nome deste número!'
    },
    {
      numero: 10,
      aceitos: ['10', 'dez', 'dés', 'des', 'pé', 'pés', 'vez', 'fez', 'dá', 'das'],
      dica: 'Para terminar, que número é este?'
    }
  ],
  indice: 0,
  reconhecimento: null,
  timerEscuta: null,
  ouvindoAgora: false,
  jaAcertouRodada: false,

  iniciar() {
    this.indice = 0;
    this.pararEscuta();
    Jogo.definirInstrucao(
      'Agora eu quero ouvir a sua voz! Olhe o número na tela, toque no microfone vermelho e fale o nome dele bem alto!',
      true,
      () => this.mostrarDesafio()
    );
  },

  pararEscuta() {
    this.ouvindoAgora = false;
    clearTimeout(this.timerEscuta);

    if (this.reconhecimento) {
      try {
        this.reconhecimento.onresult = null;
        this.reconhecimento.onerror = null;
        this.reconhecimento.onend = null;
        this.reconhecimento.abort();
      } catch (e) {}
      this.reconhecimento = null;
    }

    const btn = document.getElementById('btn-mic-oral');
    if (btn) btn.classList.remove('ouvindo');
  },

  mostrarDesafio() {
    if (Jogo.faseAtual !== 4) return;
    Jogo.estado = 'jogando';
    this.jaAcertouRodada = false;
    this.pararEscuta();

    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const atual = this.desafios[this.indice];
    areaJogo.innerHTML = `
      <div class="palco-oral">
        <div class="numero-oral-gigante" id="num-oral-tela">${atual.numero}</div>
        <button class="btn-microfone" id="btn-mic-oral" onclick="window.Fases[4].escutar()" aria-label="Falar número">🎤</button>
        <div class="feedback-fala-visual" id="status-mic-oral">Toque no 🎤 para falar!</div>
        <button class="btn-ajuda-adulto" onclick="window.Fases[4].confirmarManual()" title="Confirmar se a criança falou certo">✔️ Confirmar fala</button>
      </div>
    `;

    Jogo.definirInstrucao(atual.dica, true);
  },

  escutar() {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;

    window.speechSynthesis.cancel();
    this.pararEscuta();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById('status-mic-oral');
    const btn = document.getElementById('btn-mic-oral');

    if (!SpeechRecognition) {
      if (status) status.textContent = 'Fale em voz alta e toque em ✔️!';
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    // No iOS/Safari, resultados parciais (interimResults) costumam falhar em palavras isoladas
    rec.interimResults = !isIOS;
    rec.maxAlternatives = 5;

    let ultimaFalaCaptada = '';

    rec.onstart = () => {
      this.ouvindoAgora = true;
      if (btn) btn.classList.add('ouvindo');
      if (status) status.textContent = '👂 Pode falar agora!';

      this.timerEscuta = setTimeout(() => {
        if (this.ouvindoAgora && !this.jaAcertouRodada) {
          try { rec.stop(); } catch (e) {}
        }
      }, 4500);
    };

    rec.onresult = (event) => {
      if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;

      const transcricoes = [];
      let ehFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) ehFinal = true;
        for (let alt = 0; alt < event.results[i].length; alt++) {
          const texto = event.results[i][alt].transcript.toLowerCase().trim();
          if (texto) transcricoes.push(texto);
        }
      }

      if (transcricoes[0]) {
        ultimaFalaCaptada = transcricoes[0];
        if (status) status.textContent = `Ouvi: "${ultimaFalaCaptada}"`;
      }

      const atual = this.desafios[this.indice];
      const acertou = transcricoes.some(frase =>
        atual.aceitos.some(palavra => frase.includes(palavra))
      );

      if (acertou) {
        this.jaAcertouRodada = true;
        this.pararEscuta();
        this.avancarAcerto();
      } else if (ehFinal && transcricoes.length > 0) {
        this.pararEscuta();
        this.validarFala(transcricoes);
      }
    };

    rec.onerror = (event) => {
      this.pararEscuta();
      if (this.jaAcertouRodada) return;

      if (status) {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          status.textContent = '🔒 Permita o microfone no navegador ou use ✔️!';
        } else {
          status.textContent = 'Toque no 🎤 e fale bem perto!';
        }
      }
    };

    rec.onend = () => {
      const estavaOuvindo = this.ouvindoAgora;
      this.ouvindoAgora = false;
      clearTimeout(this.timerEscuta);
      if (btn) btn.classList.remove('ouvindo');

      if (estavaOuvindo && !this.jaAcertouRodada && ultimaFalaCaptada) {
        const atual = this.desafios[this.indice];
        const bateu = atual.aceitos.some(p => ultimaFalaCaptada.includes(p));
        if (bateu) {
          this.jaAcertouRodada = true;
          this.avancarAcerto();
        } else {
          this.validarFala([ultimaFalaCaptada]);
        }
      }
    };

    this.reconhecimento = rec;
    try {
      rec.start();
    } catch (e) {
      this.pararEscuta();
      if (status) status.textContent = 'Toque no 🎤 novamente!';
    }
  },

  validarFala(transcricoes) {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;
    const atual = this.desafios[this.indice];
    const status = document.getElementById('status-mic-oral');

    if (status) status.textContent = `Ouvi "${transcricoes[0]}". Tente falar ${atual.numero}!`;
    const numEl = document.getElementById('num-oral-tela');
    if (numEl) {
      numEl.classList.add('erro');
      setTimeout(() => numEl.classList.remove('erro'), 350);
    }
    Jogo.falar('Quase lá! Toque no microfone e fale o nome do número!');
  },

  confirmarManual() {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;
    this.jaAcertouRodada = true;
    this.pararEscuta();
    this.avancarAcerto();
  },

  avancarAcerto() {
    Jogo.estado = 'apresentando';
    const atual = this.desafios[this.indice];
    const numEl = document.getElementById('num-oral-tela');
    const status = document.getElementById('status-mic-oral');

    if (numEl) numEl.style.color = '#2E7D32';
    if (status) status.textContent = `⭐ Muito bem! É o ${atual.numero}!`;

    this.indice++;
    if (this.indice < this.desafios.length) {
      Jogo.falar(`Isso mesmo! Número ${atual.numero}! Vamos para o próximo!`, () => {
        setTimeout(() => this.mostrarDesafio(), 400);
      });
    } else {
      Jogo.falar('Parabéns! Você falou todos os números direitinho!', () => {
        Jogo.concluirFase();
      });
    }
  }
};