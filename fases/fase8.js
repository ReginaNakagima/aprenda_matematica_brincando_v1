// =========================================================
// FASE 8 (1º ANO): ESCRITA DOS NÚMEROS DE 0 A 10 NA TELA
// Etapa 1: Cobrir o pontilhado (0 a 10)
// Etapa 2: Escrita livre (a coruja pede o número)
// =========================================================

function iniciarFase8() {
  // Etapa 1: Todos os números de 0 a 10 em ordem para treinar o traçado
  const numerosGuiados = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Etapa 2: Desafios sorteados ou selecionados para a criança escrever sozinha
  const numerosLivres = [2, 5, 8, 10];

  let etapa = 'guiada'; // 'guiada' ou 'livre'
  let indiceAtual = 0;

  let canvas, ctx;
  let desenhando = false;
  let pontosCheckpoints = [];
  let pontosTracadosUsuario = [];

  // ---------------------------------------------------------
  // 1. MONTA A INTERFACE DA LOUSA
  // ---------------------------------------------------------
  function montarTela() {
    const numeroAlvo = etapa === 'guiada'
      ? numerosGuiados[indiceAtual]
      : numerosLivres[indiceAtual];

    const textoInstrucao = etapa === 'guiada'
      ? `Cubra o pontilhado do número ${numeroAlvo}`
      : `Escreva o número ${numeroAlvo}`;

    const botaoConfirmarHTML = etapa === 'livre'
      ? `<button class="btn-lousa btn-confirmar-lousa" id="btn-verificar-escrita">Pronto ✅</button>`
      : '';

    areaJogo.innerHTML = `
      <div class="palco-escrita">
        <div class="lousa-container">
          <canvas id="canvas-escrita" width="320" height="360"></canvas>
        </div>
        <div class="coluna-controles-paisagem">
          <p class="instrucao-escrita" id="texto-instrucao-escrita">${textoInstrucao}</p>
          <div class="controles-escrita">
            <button class="btn-lousa btn-limpar-lousa" id="btn-limpar-escrita">Apagar 🧹</button>
            ${botaoConfirmarHTML}
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('canvas-escrita');
    ctx = canvas.getContext('2d');
    pontosTracadosUsuario = [];

    prepararLousa(numeroAlvo);
    configurarEventosToque(numeroAlvo);

    if (etapa === 'guiada') {
      falar(`Passe o dedo por cima do pontilhado para escrever o número ${numeroAlvo}!`);
    } else {
      falar(`Agora é sua vez! Escreva o número ${numeroAlvo} na lousa e toque em Pronto!`);
    }
  }

  // Ajusta o tamanho da fonte caso seja 10 (dois dígitos)
  function obterTamanhoFonte(numero) {
    return String(numero).length > 1 ? 195 : 250;
  }

  // ---------------------------------------------------------
  // 2. DESENHA O MOLDE PONTILHADO E GERA OS CHECKPOINTS
  // ---------------------------------------------------------
  function prepararLousa(numero) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pontosCheckpoints = [];

    if (etapa === 'guiada') {
      const tamanhoFonte = obterTamanhoFonte(numero);

      ctx.save();
      ctx.font = `bold ${tamanhoFonte}px 'Fredoka One', 'Comic Sans MS', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Preenchimento bem clarinho para guiar a criança
      ctx.fillStyle = 'rgba(0, 150, 136, 0.10)';
      ctx.fillText(String(numero), canvas.width / 2, canvas.height / 2 + 10);

      // Contorno pontilhado
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#80CBC4';
      ctx.strokeText(String(numero), canvas.width / 2, canvas.height / 2 + 10);
      ctx.restore();

      gerarCheckpointsDoNumero(numero, tamanhoFonte);
    }
  }

  function gerarCheckpointsDoNumero(numero, tamanhoFonte) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');

    offCtx.font = `bold ${tamanhoFonte}px 'Fredoka One', 'Comic Sans MS', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#000';
    offCtx.fillText(String(numero), offCanvas.width / 2, offCanvas.height / 2 + 10);

    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
    const passo = 18;

    for (let y = 20; y < offCanvas.height - 20; y += passo) {
      for (let x = 15; x < offCanvas.width - 15; x += passo) {
        const alpha = imgData[(y * offCanvas.width + x) * 4 + 3];
        if (alpha > 128) {
          pontosCheckpoints.push({ x, y, coberto: false });
        }
      }
    }
  }

  // ---------------------------------------------------------
  // 3. CAPTURA O DEDO / MOUSE NA LOUSA
  // ---------------------------------------------------------
  function obterPosicao(evento) {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;

    const clienteX = evento.touches ? evento.touches[0].clientX : evento.clientX;
    const clienteY = evento.touches ? evento.touches[0].clientY : evento.clientY;

    return {
      x: (clienteX - rect.left) * escalaX,
      y: (clienteY - rect.top) * escalaY
    };
  }

  function configurarEventosToque(numeroAlvo) {
    const iniciarTraco = (e) => {
      e.preventDefault();
      desenhando = true;
      const pos = obterPosicao(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      registrarPonto(pos, numeroAlvo);
    };

    const moverTraco = (e) => {
      if (!desenhando) return;
      e.preventDefault();
      const pos = obterPosicao(e);

      ctx.lineWidth = String(numeroAlvo).length > 1 ? 18 : 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = etapa === 'guiada' ? '#FF7043' : '#1E88E5';

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      registrarPonto(pos, numeroAlvo);
    };

    const finalizarTraco = () => {
      desenhando = false;
    };

    canvas.addEventListener('mousedown', iniciarTraco);
    canvas.addEventListener('mousemove', moverTraco);
    window.addEventListener('mouseup', finalizarTraco);

    canvas.addEventListener('touchstart', iniciarTraco, { passive: false });
    canvas.addEventListener('touchmove', moverTraco, { passive: false });
    canvas.addEventListener('touchend', finalizarTraco);

    document.getElementById('btn-limpar-escrita').onclick = () => {
      pontosTracadosUsuario = [];
      prepararLousa(numeroAlvo);
    };

    const btnVerificar = document.getElementById('btn-verificar-escrita');
    if (btnVerificar) {
      btnVerificar.onclick = () => validarEscritaLivre(numeroAlvo);
    }
  }

  // ---------------------------------------------------------
  // 4. VERIFICAÇÃO DA ETAPA GUIADA (PONTILHADO)
  // ---------------------------------------------------------
  function registrarPonto(pos, numeroAlvo) {
    pontosTracadosUsuario.push(pos);

    if (etapa === 'guiada' && pontosCheckpoints.length > 0) {
      let cobertos = 0;

      for (const cp of pontosCheckpoints) {
        if (!cp.coberto) {
          const dist = Math.hypot(pos.x - cp.x, pos.y - cp.y);
          if (dist < 26) {
            cp.coberto = true;
          }
        }
        if (cp.coberto) cobertos++;
      }

      const percentual = cobertos / pontosCheckpoints.length;

      if (percentual >= 0.82 && desenhando) {
        desenhando = false;
        avancarDesafio(numeroAlvo);
      }
    }
  }

  // ---------------------------------------------------------
  // 5. VERIFICAÇÃO DA ETAPA LIVRE (A CORUJA PEDIU)
  // ---------------------------------------------------------
  function validarEscritaLivre(numeroAlvo) {
    if (pontosTracadosUsuario.length < 12) {
      falar(`Escreva o número ${numeroAlvo} na lousa primeiro!`);
      return;
    }

    const acuracia = compararComMoldeIdeal(numeroAlvo);

    if (acuracia >= 0.40) {
      avancarDesafio(numeroAlvo);
    } else {
      const lousa = document.querySelector('.lousa-container');
      lousa.classList.add('erro');
      setTimeout(() => lousa.classList.remove('erro'), 400);
      falar(`Quase lá! Tente escrever o número ${numeroAlvo} bem grande no meio da lousa.`);
    }
  }

  function compararComMoldeIdeal(numero) {
    const tamanhoFonte = obterTamanhoFonte(numero) - 10;
    const molde = document.createElement('canvas');
    molde.width = canvas.width;
    molde.height = canvas.height;
    const mCtx = molde.getContext('2d');

    mCtx.font = `bold ${tamanhoFonte}px 'Fredoka One', 'Comic Sans MS', sans-serif`;
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.lineWidth = 36;
    mCtx.strokeStyle = '#000';
    mCtx.fillStyle = '#000';
    mCtx.fillText(String(numero), molde.width / 2, molde.height / 2 + 10);
    mCtx.strokeText(String(numero), molde.width / 2, molde.height / 2 + 10);

    const moldeData = mCtx.getImageData(0, 0, molde.width, molde.height).data;
    const userData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let pixelsUsuario = 0;
    let pixelsDentroDoMolde = 0;
    let pixelsMoldeTotal = 0;

    for (let i = 3; i < userData.length; i += 16) {
      const u = userData[i] > 50;
      const m = moldeData[i] > 50;
      if (m) pixelsMoldeTotal++;
      if (u) {
        pixelsUsuario++;
        if (m) pixelsDentroDoMolde++;
      }
    }

    if (pixelsUsuario === 0 || pixelsMoldeTotal === 0) return 0;

    const precisao = pixelsDentroDoMolde / pixelsUsuario;
    const cobertura = pixelsDentroDoMolde / pixelsMoldeTotal;

    return (precisao * 0.6) + (cobertura * 0.4);
  }

  // ---------------------------------------------------------
  // 6. AVANÇA ENTRE NÚMEROS E ETAPAS
  // ---------------------------------------------------------
  function avancarDesafio(numeroConcluido) {
    areaJogo.classList.add('bloqueado');
    falar(`Muito bem! Você escreveu o número ${numeroConcluido}!`);

    setTimeout(() => {
      areaJogo.classList.remove('bloqueado');
      indiceAtual++;

      if (etapa === 'guiada' && indiceAtual >= numerosGuiados.length) {
        etapa = 'livre';
        indiceAtual = 0;
        montarTela();
      } else if (etapa === 'livre' && indiceAtual >= numerosLivres.length) {
        concluirFase(8);
      } else {
        montarTela();
      }
    }, 1800);
  }

  montarTela();
}