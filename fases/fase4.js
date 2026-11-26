window.Fases[4] = {
  desafios: [
    {
      numero: 1,
      aceitos: ['1', 'um', 'uma', 'hum', 'uno', 'bom', 'com', 'uns', 'som', 'on'],
      dica: 'Fale quando o microfone ficar verde! Que número é este?'
    },
    {
      numero: 3,
      aceitos: ['3', 'três', 'tres', 'treis', 'fez', 'vez', 'mês', 'mes', 'tais', 'reis', 'seis', 'dei'],
      dica: 'Fale quando ficar verde! Que número é este?'
    },
    {
      numero: 5,
      aceitos: ['5', 'cinco', 'sinto', 'cinto', 'sim', 'sinco', 'circo', 'fui', 'fico', 'pico'],
      dica: 'E este número aqui? Fale quando ficar verde!'
    },
    {
      numero: 0,
      aceitos: ['0', 'zero', 'quero', 'cera', 'fera', 'serra', 'zelo', 'certo', 'céu', 'seu', 'deu'],
      dica: 'Este é redondinho! Fale o nome dele quando ficar verde!'
    },
    {
      numero: 7,
      aceitos: ['7', 'sete', 'set', 'sede', 'certa', 'certo', 'cega', 'seco', 'pet', 'net', 'sem'],
      dica: 'Agora fale o nome deste número quando ficar verde!'
    },
    {
      numero: 10,
      aceitos: ['10', 'dez', 'dés', 'des', 'pé', 'pés', 'vez', 'fez', 'dá', 'das', 'mais', 'faz'],
      dica: 'Para terminar, fale este número quando ficar verde!'
    }
  ],
  indice: 0,
  tentativasRodada: 0,
  reconhecimento: null,
  timerEscuta: null,
  timerPicoVoz: null,
  ouvindoAgora: false,
  jaAcertouRodada: false,

  iniciar() {
    this.indice = 0;
    this.pararEscuta();
    Jogo.definirInstrucao(
      'Agora eu quero ouvir a sua voz! Olhe o número na tela e fale o nome dele bem alto assim que o microfone ficar verde!',
      true,
      () => this.mostrarDesafio()
    );
  },

  pararEscuta() {
    this.ouvindoAgora = false;
    clearTimeout(this.timerEscuta);
    clearTimeout(this.timerPicoVoz);

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
    if (btn) btn.classList.remove('ouvindo', 'mic-verde');

    const ondas = document.getElementById('ondas-voz-oral');
    if (ondas) ondas.classList.remove('ativa', 'falando');
  },

  mostrarDesafio() {
    if (Jogo.faseAtual !== 4) return;
    Jogo.estado = 'jogando';
    this.jaAcertouRodada = false;
    this.tentativasRodada = 0;
    this.pararEscuta();

    const areaJogo = document.getElementById('area-jogo');
    areaJogo.classList.remove('bloqueado');

    const atual = this.desafios[this.indice];
    areaJogo.innerHTML = `
      <div class="palco-oral">
        <div class="numero-oral-gigante" id="num-oral-tela">${atual.numero}</div>
        <div class="linha-mic-ondas">
          <button class="btn-microfone" id="btn-mic-oral" onclick="window.Fases[4].escutar()" aria-label="Microfone">🎤</button>
          <div class="ondas-voz" id="ondas-voz-oral" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="feedback-fala-visual" id="status-mic-oral">⏳ Aguarde a coruja falar...</div>
        <button class="btn-ajuda-adulto" onclick="window.Fases[4].confirmarManual()" title="Confirmar fala">✔️ Confirmar</button>
      </div>
    `;

    Jogo.definirInstrucao(atual.dica, true, () => {
      if (Jogo.faseAtual === 4 && Jogo.estado === 'jogando' && !this.jaAcertouRodada) {
        this.escutar();
      }
    });
  },

  pulsarFrequencia() {
    const ondas = document.getElementById('ondas-voz-oral');
    if (!ondas) return;
    ondas.classList.add('falando');
    clearTimeout(this.timerPicoVoz);
    this.timerPicoVoz = setTimeout(() => {
      if (ondas) ondas.classList.remove('falando');
    }, 650);
  },

  escutar() {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;

    window.speechSynthesis.cancel();
    this.pararEscuta();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = document.getElementById('status-mic-oral');
    const btn = document.getElementById('btn-mic-oral');
    const ondas = document.getElementById('ondas-voz-oral');

    if (!SpeechRecognition) {
      if (status) status.textContent = 'Fale em voz alta e toque em ✔️!';
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = !isIOS;
    rec.maxAlternatives = 5;

    let ultimaFalaCaptada = '';
    let houveSomDeFala = false;

    rec.onstart = () => {
      this.ouvindoAgora = true;
      if (btn) btn.classList.add('ouvindo', 'mic-verde');
      if (ondas) ondas.classList.add('ativa');
      if (status) status.textContent = '🟢 Microfone verde! Pode falar agora!';

      this.timerEscuta = setTimeout(() => {
        if (this.ouvindoAgora && !this.jaAcertouRodada) {
          try { rec.stop(); } catch (e) {}
        }
      }, 5000);
    };

    rec.onspeechstart = () => {
      houveSomDeFala = true;
      this.pulsarFrequencia();
      if (status) status.textContent = '👂 Estou te ouvindo...';
    };

    rec.onsoundstart = () => {
      this.pulsarFrequencia();
    };

    rec.onresult = (event) => {
      if (Jogo.estado !== 'jogando' || this.jaAcertouRodada) return;
      houveSomDeFala = true;
      this.pulsarFrequencia();

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

      if (acertou || (this.tentativasRodada >= 2 && transcricoes.length > 0)) {
        this.jaAcertouRodada = true;
        this.pararEscuta();
        this.avancarAcerto();
      } else if (ehFinal && transcricoes.length > 0) {
        this.pararEscuta();
        this.pedirParaRepetir(transcricoes[0]);
      }
    };

    rec.onerror = (event) => {
      this.pararEscuta();
      if (this.jaAcertouRodada || Jogo.faseAtual !== 4 || Jogo.estado !== 'jogando') return;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (status) status.textContent = '🔒 Permita o microfone ou toque em ✔️!';
        return;
      }

      this.pedirParaRepetir('');
    };

    rec.onend = () => {
      const estavaOuvindo = this.ouvindoAgora;
      this.ouvindoAgora = false;
      clearTimeout(this.timerEscuta);
      if (btn) btn.classList.remove('ouvindo', 'mic-verde');
      if (ondas) ondas.classList.remove('ativa', 'falando');

      if (!estavaOuvindo || this.jaAcertouRodada || Jogo.faseAtual !== 4 || Jogo.estado !== 'jogando') return;

      if (ultimaFalaCaptada) {
        const atual = this.desafios[this.indice];
        const bateu = atual.aceitos.some(p => ultimaFalaCaptada.includes(p));
        if (bateu || this.tentativasRodada >= 2) {
          this.jaAcertouRodada = true;
          this.avancarAcerto();
        } else {
          this.pedirParaRepetir(ultimaFalaCaptada);
        }
      } else if (houveSomDeFala && this.tentativasRodada >= 2) {
        this.jaAcertouRodada = true;
        this.avancarAcerto();
      } else {
        this.pedirParaRepetir('');
      }
    };

    this.reconhecimento = rec;
    try {
      rec.start();
    } catch (e) {
      this.pararEscuta();
      if (status) status.textContent = 'Toque no 🎤 para ativar!';
    }
  },

  pedirParaRepetir(textoOuvido) {
    if (Jogo.estado !== 'jogando' || this.jaAcertouRodada || Jogo.faseAtual !== 4) return;

    this.tentativasRodada++;
    const status = document.getElementById('status-mic-oral');
    if (status) {
      status.textContent = textoOuvido
        ? `🔄 Ouvi "${textoOuvido}". Não entendi, pode repetir!`
        : '🔄 Não entendi, pode repetir quando ficar verde!';
    }

    const numEl = document.getElementById('num-oral-tela');
    if (numEl) {
      numEl.classList.add('erro');
      setTimeout(() => numEl.classList.remove('erro'), 350);
    }

    Jogo.falar('Não entendi, pode repetir!', () => {
      if (Jogo.faseAtual === 4 && Jogo.estado === 'jogando' && !this.jaAcertouRodada) {
        this.escutar();
      }
    });
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