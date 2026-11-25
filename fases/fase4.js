window.Fases[4] = {
  desafios: [
    { numero: 1, aceitos: ['1', 'um', 'uma', 'hum'], dica: 'Diga bem alto: UM!' },
    { numero: 3, aceitos: ['3', 'três', 'tres', 'treis'], dica: 'Que número é este? Diga em voz alta!' },
    { numero: 5, aceitos: ['5', 'cinco'], dica: 'E este número aqui? Fale no microfone!' },
    { numero: 0, aceitos: ['0', 'zero'], dica: 'Este é redondinho! Qual é o nome dele?' },
    { numero: 7, aceitos: ['7', 'sete'], dica: 'Agora fale o nome deste número!' },
    { numero: 10, aceitos: ['10', 'dez', 'dés', 'des'], dica: 'Para terminar, que número é este?' }
  ],
  indice: 0,
  reconhecimento: null,
  ouvindoAgora: false,
  jaAcertouRodada: false,

  iniciar() {
    this.indice = 0;
    this.configurarReconhecimentoVoz();
    Jogo.definirInstrucao(
      'Agora eu quero ouvir a sua voz! Olhe o número na tela, toque no microfone vermelho e fale o nome dele bem alto!',
      true,
      () => this.mostrarDesafio()
    );
  },

  configurarReconhecimentoVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.reconhecimento = null;
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.interimResults = true;  // Valida instantaneamente enquanto a criança fala, sem esperar silêncio longo
    rec.maxAlternatives = 5;    // Verifica as 5 hipóteses mais prováveis do Android

    rec.onstart = () => {
      this.ouvindoAgora = true;
      const btn = document.getElementById('btn-mic-oral');
      const status = document.getElementById('status-mic-oral');
      if (btn) btn.classList.add('ouvindo');
      if (status) status.textContent = '👂 Estou ouvindo... pode falar!';
    };

    rec.onresult = (event) => {
      if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;

      const transcricoes = [];
      let ehFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) ehFinal = true;
        for (let alt = 0; alt < event.results[i].length; alt++) {
          transcricoes.push(event.results[i][alt].transcript.toLowerCase().trim());
        }
      }

      const atual = this.desafios[this.indice];
      const acertou = transcricoes.some(frase =>
        atual.aceitos.some(palavra => frase.includes(palavra))
      );

      if (acertou) {
        this.jaAcertouRodada = true;
        this.ouvindoAgora = false;
        try { rec.stop(); } catch (e) {}
        this.avancarAcerto();
      } else if (ehFinal && transcricoes.length > 0) {
        // Só avisa erro se o usuário terminou de falar uma frase final diferente do número
        this.ouvindoAgora = false;
        this.validarFala(transcricoes);
      }
    };

    rec.onerror = (event) => {
      this.ouvindoAgora = false;
      const btn = document.getElementById('btn-mic-oral');
      if (btn) btn.classList.remove('ouvindo');

      // Ignora erros causados por parada intencional após acerto ou silêncio inicial
      if (this.jaAcertouRodada || event.error === 'aborted' || event.error === 'no-speech') {
        const status = document.getElementById('status-mic-oral');
        if (status && !this.jaAcertouRodada) {
          status.textContent = 'Toque no 🎤 e fale o número bem perto!';
        }
        return;
      }

      const status = document.getElementById('status-mic-oral');
      if (status) status.textContent = 'Não consegui ouvir. Toque no microfone e fale de novo!';
      Jogo.falar('Não consegui ouvir direitinho. Toque no microfone e fale bem perto!');
    };

    rec.onend = () => {
      this.ouvindoAgora = false;
      const btn = document.getElementById('btn-mic-oral');
      if (btn) btn.classList.remove('ouvindo');
    };

    this.reconhecimento = rec;
  },

  mostrarDesafio() {
    if (Jogo.faseAtual !== 4) return;
    Jogo.estado = 'jogando';
    this.jaAcertouRodada = false;

    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const atual = this.desafios[this.indice];
    areaJogo.innerHTML = `
      <div class="palco-oral">
        <div class="numero-oral-gigante" id="num-oral-tela">${atual.numero}</div>
        <button class="btn-microfone" id="btn-mic-oral" onclick="window.Fases[4].escutar()" aria-label="Falar número">🎤</button>
        <div class="feedback-fala-visual" id="status-mic-oral">Toque no 🎤 e fale!</div>
        <button class="btn-ajuda-adulto" onclick="window.Fases[4].confirmarManual()" title="Confirmar se a criança falou certo">✔️ Confirmar fala</button>
      </div>
    `;

    Jogo.definirInstrucao(atual.dica, true, () => {
      // Ativa a escuta automaticamente 150ms após a corujinha terminar de falar
      setTimeout(() => this.escutar(), 150);
    });
  },

  escutar() {
    if (Jogo.estado !== 'jogando' || this.ouvindoAgora || this.jaAcertouRodada) return;
    window.speechSynthesis.cancel();

    if (!this.reconhecimento) {
      const status = document.getElementById('status-mic-oral');
      if (status) status.textContent = 'Fale em voz alta e toque em ✔️!';
      return;
    }

    try {
      this.reconhecimento.start();
    } catch (e) {
      // Ignora se já estiver ativo
    }
  },

  validarFala(transcricoes) {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;
    const atual = this.desafios[this.indice];
    const status = document.getElementById('status-mic-oral');

    if (status) status.textContent = `Ouvi "${transcricoes[0]}". Tente falar o número ${atual.numero}!`;
    const numEl = document.getElementById('num-oral-tela');
    if (numEl) {
      numEl.classList.add('erro');
      setTimeout(() => numEl.classList.remove('erro'), 350);
    }
    Jogo.falar('Quase lá! Olhe bem para o número, toque no microfone e fale o nome dele!');
  },

  confirmarManual() {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;
    this.jaAcertouRodada = true;
    if (this.reconhecimento && this.ouvindoAgora) {
      try { this.reconhecimento.stop(); } catch (e) {}
    }
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