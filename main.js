(function abrirNoChromeAndroid() {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isSamsungOuWebView = /SamsungBrowser|wv|FBAN|FBAV|Instagram/i.test(ua);

  if (isAndroid && isSamsungOuWebView) {
    const urlSemProtocolo = window.location.href.replace(/^https?:\/\//, '');
    window.location.href = `intent://${urlSemProtocolo}#Intent;scheme=https;package=com.android.chrome;end`;
  }
})();

window.Fases = {};

const CHAVE_STORAGE = 'aprenda_matematica_progresso_v1';

const Jogo = {
  faseMaximaDesbloqueada: 1,
  fasesConcluidas: [],
  faseAtual: null,
  paginaMapa: 0, // 0 = fases 1..5 | 1 = fases 6..10 | 2 = fases 11..15
  fasesPorPagina: 5,
  totalFasesPrevistas: 10, // Aumente para 15, 20 conforme expandir o mapa
  estado: 'mapa',
  instrucaoAtual: 'Olá! Bem-vindo ao Aprenda Matemática Brincando! Toque na pedra número 1 para começar!',

  // 5 posições calculadas exatamente ao longo da curva da trilha de terra
  slotsTrilha: [
    { left: '15%', top: '76%' }, // Posição 1 (ex: fase 1 ou 6)
    { left: '33%', top: '77%' }, // Posição 2 (ex: fase 2 ou 7)
    { left: '51%', top: '73%' }, // Posição 3 (ex: fase 3 ou 8)
    { left: '69%', top: '75%' }, // Posição 4 (ex: fase 4 ou 9)
    { left: '86%', top: '74%' }  // Posição 5 (ex: fase 5 ou 10)
  ],

  carregarProgresso() {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) {
        const dados = JSON.parse(salvo);
        this.faseMaximaDesbloqueada = dados.faseMaximaDesbloqueada || 1;
        this.fasesConcluidas = dados.fasesConcluidas || [];
      }
    } catch (e) {
      console.warn('Não foi possível ler o progresso salvo:', e);
    }

    // Abre o mapa diretamente na página da fase atual da criança
    this.paginaMapa = Math.floor((this.faseMaximaDesbloqueada - 1) / this.fasesPorPagina);
    const maxPaginas = Math.ceil(this.totalFasesPrevistas / this.fasesPorPagina) - 1;
    if (this.paginaMapa > maxPaginas) this.paginaMapa = maxPaginas;
  },

  salvarProgresso() {
    try {
      const dados = {
        faseMaximaDesbloqueada: this.faseMaximaDesbloqueada,
        fasesConcluidas: this.fasesConcluidas
      };
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
    } catch (e) {
      console.warn('Não foi possível salvar o progresso:', e);
    }
  },

  renderizarMapa() {
    const container = document.getElementById('container-pedras');
    const mascoteMapa = document.getElementById('mascote-mapa');
    const btnAnt = document.getElementById('btn-pag-anterior');
    const btnProx = document.getElementById('btn-pag-proxima');

    if (!container) return;
    container.innerHTML = '';

    const faseInicial = this.paginaMapa * this.fasesPorPagina + 1;
    let mascoteVisivelNaPagina = false;

    for (let i = 0; i < this.fasesPorPagina; i++) {
      const numFase = faseInicial + i;
      const pos = this.slotsTrilha[i];

      const concluida = this.fasesConcluidas.includes(numFase);
      const desbloqueada = numFase <= this.faseMaximaDesbloqueada;

      let classeStatus = 'bloqueada';
      let iconeBadge = '🔒';

      if (concluida) {
        classeStatus = 'concluida';
        iconeBadge = '⭐';
      } else if (desbloqueada) {
        classeStatus = 'desbloqueada';
        iconeBadge = '▶️';
      }

      const btn = document.createElement('button');
      btn.className = `pedra ${classeStatus}`;
      btn.id = `btn-fase-${numFase}`;
      btn.style.left = pos.left;
      btn.style.top = pos.top;
      btn.onclick = () => abrirFase(numFase);
      btn.innerHTML = `
        <span class="num">${numFase}</span>
        <span class="badge">${iconeBadge}</span>
      `;
      container.appendChild(btn);

      // Posiciona a corujinha logo acima da pedra atual sem cobrir o número
      if (numFase === this.faseMaximaDesbloqueada) {
        mascoteMapa.style.left = pos.left;
        mascoteMapa.style.top = `calc(${pos.top} - clamp(52px, 11vh, 88px))`;
        mascoteMapa.style.transform = 'translateX(-50%)';
        mascoteMapa.classList.remove('oculto');
        mascoteVisivelNaPagina = true;
      }
    }

    // Se a criança estiver olhando outra página do mapa, a corujinha fica no canto superior esquerdo
    if (!mascoteVisivelNaPagina) {
      mascoteMapa.style.left = '6%';
      mascoteMapa.style.top = '18%';
    }

    // Controle de visibilidade das setas < e >
    const totalPaginas = Math.ceil(this.totalFasesPrevistas / this.fasesPorPagina);
    if (this.paginaMapa > 0) {
      btnAnt.classList.remove('oculto');
    } else {
      btnAnt.classList.add('oculto');
    }

    if (this.paginaMapa < totalPaginas - 1) {
      btnProx.classList.remove('oculto');
    } else {
      btnProx.classList.add('oculto');
    }
  },

  aquecerVoz() {
    if (!('speechSynthesis' in window)) return;
    const silencio = new SpeechSynthesisUtterance(' ');
    silencio.volume = 0;
    silencio.rate = 2;
    window.speechSynthesis.speak(silencio);
  },

  falar(texto, aoTerminar = null) {
    const precisouCancelar = window.speechSynthesis.speaking || window.speechSynthesis.pending;
    if (precisouCancelar) {
      window.speechSynthesis.cancel();
    }
    
    // Mantém referência na instância para o navegador mobile não cancelar o evento onend
    this.falaAtual = new SpeechSynthesisUtterance(texto);
    this.falaAtual.lang = 'pt-BR';
    this.falaAtual.rate = 0.92;
    this.falaAtual.pitch = 1.2;

    const mascoteMapa = document.getElementById('mascote-mapa');
    const mascoteFase = document.getElementById('mascote-fase');

    let finalizou = false;
    const concluirFala = () => {
      if (finalizou) return;
      finalizou = true;
      clearTimeout(timerSeguranca);
      if (mascoteMapa) mascoteMapa.classList.remove('falando');
      if (mascoteFase) mascoteFase.classList.remove('falando');
      if (aoTerminar) aoTerminar();
    };

    // Palavras curtas de contagem ("Um!", "Dois!") usam limite curto de 850ms para não travar entre 1 e 2;
    // Frases completas mantêm folga dinâmica de até 4s+ para leitura tranquila no celular.
    const qtdPalavras = texto.trim().split(/\s+/).length;
    const tempoEstimado = qtdPalavras <= 2
      ? 850
      : Math.max(3000, (texto.length * 105) + 2000);

    const timerSeguranca = setTimeout(concluirFala, tempoEstimado);

    this.falaAtual.onstart = () => {
      if (mascoteMapa) mascoteMapa.classList.add('falando');
      if (mascoteFase) mascoteFase.classList.add('falando');
    };

    this.falaAtual.onend = concluirFala;
    this.falaAtual.onerror = concluirFala;

    // Só aguarda 80ms se realmente cancelou uma fala anterior
    if (precisouCancelar) {
      setTimeout(() => {
        window.speechSynthesis.speak(this.falaAtual);
      }, 80);
    } else {
      window.speechSynthesis.speak(this.falaAtual);
    }
  },

  definirInstrucao(texto, falarAgora = false, aoTerminar = null) {
    this.instrucaoAtual = texto;
    if (falarAgora) {
      this.falar(texto, aoTerminar);
    }
  },

  concluirFase() {
    const faseConcluida = this.faseAtual;
    this.estado = 'mapa';

    if (!this.fasesConcluidas.includes(faseConcluida)) {
      this.fasesConcluidas.push(faseConcluida);
    }

    const proximaFase = faseConcluida + 1;
    if (proximaFase > this.faseMaximaDesbloqueada) {
      this.faseMaximaDesbloqueada = proximaFase;
    }

    // Salva no navegador imediatamente
    this.salvarProgresso();

    // Se a próxima fase já pertence à página 2 (ex: acabou a 5 e vai para a 6), avança a página
    const paginaProxima = Math.floor((this.faseMaximaDesbloqueada - 1) / this.fasesPorPagina);
    const maxPaginas = Math.ceil(this.totalFasesPrevistas / this.fasesPorPagina) - 1;
    this.paginaMapa = Math.min(paginaProxima, maxPaginas);

    this.falar(`Parabéns! Você completou a fase ${faseConcluida} e ganhou uma estrela!`, () => {
      voltarParaMapa();
    });
  }
};

function mudarPaginaMapa(direcao) {
  const totalPaginas = Math.ceil(Jogo.totalFasesPrevistas / Jogo.fasesPorPagina);
  const novaPagina = Jogo.paginaMapa + direcao;

  if (novaPagina >= 0 && novaPagina < totalPaginas) {
    Jogo.paginaMapa = novaPagina;
    Jogo.renderizarMapa();

    const inicio = novaPagina * Jogo.fasesPorPagina + 1;
    const fim = inicio + Jogo.fasesPorPagina - 1;
    Jogo.falar(`Mostrando as fases de ${inicio} até ${fim}.`);
  }
}

function repetirFala() {
  Jogo.falar(Jogo.instrucaoAtual);
}

function voltarParaMapa() {
  window.speechSynthesis.cancel();
  Jogo.estado = 'mapa';
  Jogo.faseAtual = null;

  document.getElementById('tela-fase').classList.add('oculto');
  document.getElementById('btn-mapa').classList.add('oculto');
  document.getElementById('btn-reset').classList.remove('oculto');
  document.getElementById('tela-mapa').classList.remove('oculto');

  Jogo.renderizarMapa();
  Jogo.definirInstrucao(`Toque na pedra número ${Jogo.faseMaximaDesbloqueada} para continuar a aventura!`, true);
}

function abrirFase(numeroFase) {
  // Pré-aquece o sintetizador de voz no toque do usuário antes de abrir qualquer fase
  Jogo.aquecerVoz();

  if (numeroFase > Jogo.faseMaximaDesbloqueada) {
    Jogo.falar(`A pedra número ${numeroFase} ainda está trancada! Complete a fase anterior primeiro.`);
    return;
  }

  const moduloFase = window.Fases[numeroFase];
  if (!moduloFase) {
    Jogo.falar(`A fase ${numeroFase} está sendo preparada na floresta! Em breve você poderá jogar!`);
    return;
  }

  Jogo.faseAtual = numeroFase;
  Jogo.estado = 'apresentando';

  document.getElementById('tela-mapa').classList.add('oculto');
  document.getElementById('btn-reset').classList.add('oculto');
  document.getElementById('btn-mapa').classList.remove('oculto');
  document.getElementById('tela-fase').classList.remove('oculto');

  const areaJogo = document.getElementById('area-jogo');
  areaJogo.innerHTML = '';
  areaJogo.classList.add('bloqueado');

  moduloFase.iniciar(areaJogo);
}

function reiniciarProgresso() {
  localStorage.removeItem(CHAVE_STORAGE);
  Jogo.faseMaximaDesbloqueada = 1;
  Jogo.fasesConcluidas = [];
  Jogo.paginaMapa = 0;
  Jogo.renderizarMapa();
  Jogo.definirInstrucao('O jogo recomeçou! Toque na pedra número 1 para começar!', true);
}

// Inicializa o mapa carregando o progresso salvo assim que a página abre
window.addEventListener('DOMContentLoaded', () => {
  Jogo.carregarProgresso();
  Jogo.renderizarMapa();
  if (Jogo.faseMaximaDesbloqueada > 1) {
    Jogo.definirInstrucao(`Que bom te ver de novo! Toque na pedra número ${Jogo.faseMaximaDesbloqueada} para continuar!`);
  }
});