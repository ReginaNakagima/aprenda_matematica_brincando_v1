// =========================================================
// FASE 8 (1º ANO): ESCRITA DOS NÚMEROS DE 0 A 10 NA TELA
// 1. Traçados com Curvas de Bézier perfeitamente arredondadas
// 2. Demonstração animada antes de cada número
// 3. Pontilhado rigoroso (pune rabiscos fora do traçado)
// 4. Escrita livre com validação geométrica e direcional
// =========================================================

window.Fases[8] = {
  iniciar(areaJogo) {
    const numerosGuiados = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const numerosLivres = [2, 5, 8, 10];

    let etapa = 'guiada'; // 'guiada' ou 'livre'
    let indiceAtual = 0;

    let canvas, ctx;
    let desenhando = false;
    let demonstrando = false;
    let animacaoId = null;
    let desafioConcluido = false;

    let pontosCheckpoints = [];
    let todosPontosCaminho = [];
    let tracosUsuario = [];
    let tracoAtual = [];

    // Helper para gerar curvas cúbicas de Bézier ultra-suaves
    function bezierCubica(p0, p1, p2, p3, passos = 36) {
      const pts = [];
      for (let i = 0; i <= passos; i++) {
        const t = i / passos;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        pts.push({
          x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
          y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        });
      }
      return pts;
    }

    function linhaReta(p0, p1, passos = 20) {
      const pts = [];
      for (let i = 0; i <= passos; i++) {
        const t = i / passos;
        pts.push({
          x: p0.x + (p1.x - p0.x) * t,
          y: p0.y + (p1.y - p0.y) * t
        });
      }
      return pts;
    }

    // Traçados didáticos arredondados (coordenadas normalizadas 0..1)
    function gerarCaminhosNormalizados(numero) {
      switch (numero) {
        case 0:
          return [[
            ...bezierCubica({ x: 0.50, y: 0.15 }, { x: 0.22, y: 0.15 }, { x: 0.22, y: 0.85 }, { x: 0.50, y: 0.85 }, 32),
            ...bezierCubica({ x: 0.50, y: 0.85 }, { x: 0.78, y: 0.85 }, { x: 0.78, y: 0.15 }, { x: 0.50, y: 0.15 }, 32)
          ]];

        case 1:
          return [[
            ...linhaReta({ x: 0.35, y: 0.32 }, { x: 0.52, y: 0.15 }, 14),
            ...linhaReta({ x: 0.52, y: 0.15 }, { x: 0.52, y: 0.85 }, 28)
          ]];

        case 2:
          return [[
            ...bezierCubica({ x: 0.30, y: 0.31 }, { x: 0.30, y: 0.11 }, { x: 0.70, y: 0.11 }, { x: 0.70, y: 0.33 }, 28),
            ...bezierCubica({ x: 0.70, y: 0.33 }, { x: 0.70, y: 0.52 }, { x: 0.42, y: 0.66 }, { x: 0.28, y: 0.85 }, 24),
            ...linhaReta({ x: 0.28, y: 0.85 }, { x: 0.73, y: 0.85 }, 18)
          ]];

        case 3:
          return [[
            ...bezierCubica({ x: 0.30, y: 0.24 }, { x: 0.40, y: 0.12 }, { x: 0.68, y: 0.14 }, { x: 0.68, y: 0.32 }, 24),
            ...bezierCubica({ x: 0.68, y: 0.32 }, { x: 0.68, y: 0.44 }, { x: 0.56, y: 0.48 }, { x: 0.46, y: 0.48 }, 16),
            ...bezierCubica({ x: 0.46, y: 0.48 }, { x: 0.60, y: 0.48 }, { x: 0.71, y: 0.55 }, { x: 0.71, y: 0.69 }, 20),
            ...bezierCubica({ x: 0.71, y: 0.69 }, { x: 0.71, y: 0.87 }, { x: 0.38, y: 0.88 }, { x: 0.28, y: 0.75 }, 24)
          ]];

        case 4:
          return [
            [
              ...linhaReta({ x: 0.58, y: 0.15 }, { x: 0.25, y: 0.62 }, 22),
              ...linhaReta({ x: 0.25, y: 0.62 }, { x: 0.75, y: 0.62 }, 20)
            ],
            [
              ...linhaReta({ x: 0.58, y: 0.15 }, { x: 0.58, y: 0.85 }, 28)
            ]
          ];

        case 5:
          return [[
            ...linhaReta({ x: 0.68, y: 0.15 }, { x: 0.34, y: 0.15 }, 16),
            ...linhaReta({ x: 0.34, y: 0.15 }, { x: 0.32, y: 0.46 }, 16),
            ...bezierCubica({ x: 0.32, y: 0.46 }, { x: 0.48, y: 0.40 }, { x: 0.71, y: 0.47 }, { x: 0.71, y: 0.66 }, 24),
            ...bezierCubica({ x: 0.71, y: 0.66 }, { x: 0.71, y: 0.86 }, { x: 0.40, y: 0.88 }, { x: 0.29, y: 0.77 }, 24)
          ]];

        case 6:
          return [[
            ...bezierCubica({ x: 0.64, y: 0.20 }, { x: 0.44, y: 0.10 }, { x: 0.27, y: 0.28 }, { x: 0.27, y: 0.62 }, 28),
            ...bezierCubica({ x: 0.27, y: 0.62 }, { x: 0.27, y: 0.87 }, { x: 0.71, y: 0.87 }, { x: 0.71, y: 0.66 }, 26),
            ...bezierCubica({ x: 0.71, y: 0.66 }, { x: 0.71, y: 0.46 }, { x: 0.34, y: 0.46 }, { x: 0.28, y: 0.63 }, 24)
          ]];

        case 7:
          return [[
            ...linhaReta({ x: 0.28, y: 0.15 }, { x: 0.72, y: 0.15 }, 18),
            ...linhaReta({ x: 0.72, y: 0.15 }, { x: 0.42, y: 0.85 }, 30)
          ]];

        case 8:
          return [[
            ...bezierCubica({ x: 0.50, y: 0.48 }, { x: 0.27, y: 0.42 }, { x: 0.29, y: 0.15 }, { x: 0.50, y: 0.15 }, 24),
            ...bezierCubica({ x: 0.50, y: 0.15 }, { x: 0.71, y: 0.15 }, { x: 0.73, y: 0.42 }, { x: 0.50, y: 0.48 }, 24),
            ...bezierCubica({ x: 0.50, y: 0.48 }, { x: 0.24, y: 0.55 }, { x: 0.26, y: 0.85 }, { x: 0.50, y: 0.85 }, 26),
            ...bezierCubica({ x: 0.50, y: 0.85 }, { x: 0.74, y: 0.85 }, { x: 0.76, y: 0.55 }, { x: 0.50, y: 0.48 }, 26)
          ]];

        case 9:
          return [[
            ...bezierCubica({ x: 0.70, y: 0.34 }, { x: 0.66, y: 0.52 }, { x: 0.29, y: 0.52 }, { x: 0.29, y: 0.33 }, 24),
            ...bezierCubica({ x: 0.29, y: 0.33 }, { x: 0.29, y: 0.13 }, { x: 0.71, y: 0.13 }, { x: 0.71, y: 0.38 }, 26),
            ...bezierCubica({ x: 0.71, y: 0.38 }, { x: 0.71, y: 0.72 }, { x: 0.54, y: 0.88 }, { x: 0.34, y: 0.80 }, 26)
          ]];

        case 10:
          return [
            // Dígito 1
            [
              ...linhaReta({ x: 0.15, y: 0.32 }, { x: 0.28, y: 0.15 }, 14),
              ...linhaReta({ x: 0.28, y: 0.15 }, { x: 0.28, y: 0.85 }, 28)
            ],
            // Dígito 0 arredondado
            [
              ...bezierCubica({ x: 0.66, y: 0.15 }, { x: 0.43, y: 0.15 }, { x: 0.43, y: 0.85 }, { x: 0.66, y: 0.85 }, 32),
              ...bezierCubica({ x: 0.66, y: 0.85 }, { x: 0.89, y: 0.85 }, { x: 0.89, y: 0.15 }, { x: 0.66, y: 0.15 }, 32)
            ]
          ];

        default:
          return [];
      }
    }

    function obterCaminhosEmPixels(numero, largura, altura) {
      const caminhosNorm = gerarCaminhosNormalizados(numero);
      return caminhosNorm.map(stroke =>
        stroke.map(p => ({ x: p.x * largura, y: p.y * altura }))
      );
    }

    function montarTela() {
      if (animacaoId) cancelAnimationFrame(animacaoId);
      desafioConcluido = false;
      desenhando = false;
      demonstrando = false;
      areaJogo.classList.remove('bloqueado');

      const numeroAlvo = etapa === 'guiada'
        ? numerosGuiados[indiceAtual]
        : numerosLivres[indiceAtual];

      const textoInstrucao = etapa === 'guiada'
        ? `Cubra todo o pontilhado do número ${numeroAlvo}`
        : `Escreva o número ${numeroAlvo}`;

      const botaoExtraHTML = etapa === 'guiada'
        ? `<button class="btn-lousa btn-confirmar-lousa" id="btn-ver-demo">Ver como faz 👀</button>`
        : `<button class="btn-lousa btn-confirmar-lousa" id="btn-verificar-escrita">Pronto ✅</button>`;

      areaJogo.innerHTML = `
        <div class="palco-escrita">
          <div class="lousa-container">
            <canvas id="canvas-escrita" width="320" height="360"></canvas>
          </div>
          <div class="coluna-controles-paisagem">
            <p class="instrucao-escrita" id="texto-instrucao-escrita">${textoInstrucao}</p>
            <div class="controles-escrita">
              <button class="btn-lousa btn-limpar-lousa" id="btn-limpar-escrita">Apagar 🧹</button>
              ${botaoExtraHTML}
            </div>
          </div>
        </div>
      `;

      canvas = document.getElementById('canvas-escrita');
      ctx = canvas.getContext('2d');
      tracosUsuario = [];
      tracoAtual = [];

      configurarEventosPointer(numeroAlvo);

      if (etapa === 'guiada') {
        desenharMoldePontilhado(numeroAlvo);
        Jogo.definirInstrucao(`Observe como escrever o número ${numeroAlvo} e depois cubra o pontilhado!`, true);
        executarDemonstracao(numeroAlvo);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Jogo.definirInstrucao(`Agora é sua vez! Escreva o número ${numeroAlvo} na lousa e toque em Pronto!`, true);
      }
    }

    // ---------------------------------------------------------
    // 1. DESENHA O PONTILHADO ARREDONDADO + CHECKPOINTS
    // ---------------------------------------------------------
    function desenharMoldePontilhado(numero) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pontosCheckpoints = [];
      todosPontosCaminho = [];

      const caminhos = obterCaminhosEmPixels(numero, canvas.width, canvas.height);

      caminhos.forEach((stroke, idx) => {
        // Faixa suave ao fundo
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0, 150, 136, 0.11)';
        stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();

        // Pontilhado único e arredondado
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([8, 11]);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#26A69A';
        stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();

        // Ponto de início (verde no 1º traço, amarelo no 2º traço)
        const inicio = stroke[0];
        ctx.save();
        ctx.beginPath();
        ctx.arc(inicio.x, inicio.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#4CAF50' : '#FFB300';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
        ctx.restore();

        // Guarda todos os pontos do caminho para checar desvios
        stroke.forEach(p => todosPontosCaminho.push(p));

        // Cria checkpoints uniformes a cada 14px ao longo da curva
        let ultimoCp = stroke[0];
        pontosCheckpoints.push({ x: ultimoCp.x, y: ultimoCp.y, coberto: false });

        for (let i = 1; i < stroke.length; i++) {
          const dist = Math.hypot(stroke[i].x - ultimoCp.x, stroke[i].y - ultimoCp.y);
          if (dist >= 14 || i === stroke.length - 1) {
            ultimoCp = stroke[i];
            pontosCheckpoints.push({ x: ultimoCp.x, y: ultimoCp.y, coberto: false });
          }
        }
      });
    }

    // ---------------------------------------------------------
    // 2. DEMONSTRAÇÃO ANIMADA DO TRAÇADO
    // ---------------------------------------------------------
    function executarDemonstracao(numero) {
      if (animacaoId) cancelAnimationFrame(animacaoId);
      demonstrando = true;
      desenhando = false;

      const caminhos = obterCaminhosEmPixels(numero, canvas.width, canvas.height);
      const todosPontos = [];
      caminhos.forEach(stroke => {
        stroke.forEach((p, pIdx) => {
          todosPontos.push({ x: p.x, y: p.y, novoTraco: pIdx === 0 });
        });
      });

      let indiceDemo = 0;
      const velocidade = 1.4;

      function animarFrame() {
        if (!demonstrando) return;

        desenharMoldePontilhado(numero);

        const limite = Math.min(Math.floor(indiceDemo), todosPontos.length - 1);
        ctx.save();
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(30, 136, 229, 0.55)';

        ctx.beginPath();
        for (let i = 0; i <= limite; i++) {
          const pt = todosPontos[i];
          if (pt.novoTraco) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
        ctx.restore();

        const atual = todosPontos[limite];
        if (atual) {
          ctx.save();
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText('✏️', atual.x - 4, atual.y + 4);
          ctx.restore();
        }

        indiceDemo += velocidade;

        if (indiceDemo < todosPontos.length + 18) {
          animacaoId = requestAnimationFrame(animarFrame);
        } else {
          demonstrando = false;
          tracosUsuario = [];
          desenharMoldePontilhado(numero);
        }
      }

      animacaoId = requestAnimationFrame(animarFrame);
    }

    // ---------------------------------------------------------
    // 3. EVENTOS DE POINTER NO CANVAS (SEM LISTENER DUPLICADO)
    // ---------------------------------------------------------
    function obterPosicao(evento) {
      const rect = canvas.getBoundingClientRect();
      const escalaX = canvas.width / rect.width;
      const escalaY = canvas.height / rect.height;

      return {
        x: (evento.clientX - rect.left) * escalaX,
        y: (evento.clientY - rect.top) * escalaY
      };
    }

    function configurarEventosPointer(numeroAlvo) {
      canvas.onpointerdown = (e) => {
        if (desafioConcluido) return;
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);

        if (demonstrando) {
          demonstrando = false;
          if (animacaoId) cancelAnimationFrame(animacaoId);
          desenharMoldePontilhado(numeroAlvo);
        }

        desenhando = true;
        const pos = obterPosicao(e);
        tracoAtual = [pos];

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        marcarCheckpointsProximos(pos);
      };

      canvas.onpointermove = (e) => {
        if (!desenhando || desafioConcluido) return;
        e.preventDefault();
        const pos = obterPosicao(e);
        tracoAtual.push(pos);

        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = etapa === 'guiada' ? '#FF7043' : '#1E88E5';

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        marcarCheckpointsProximos(pos);
      };

      const encerrarPointer = (e) => {
        if (!desenhando) return;
        desenhando = false;
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }

        if (tracoAtual.length > 0) {
          tracosUsuario.push([...tracoAtual]);
          tracoAtual = [];
        }

        if (etapa === 'guiada' && !desafioConcluido) {
          verificarConclusaoPontilhado(numeroAlvo);
        }
      };

      canvas.onpointerup = encerrarPointer;
      canvas.onpointercancel = encerrarPointer;

      document.getElementById('btn-limpar-escrita').onclick = () => {
        if (desafioConcluido) return;
        demonstrando = false;
        if (animacaoId) cancelAnimationFrame(animacaoId);
        tracosUsuario = [];
        tracoAtual = [];
        if (etapa === 'guiada') {
          desenharMoldePontilhado(numeroAlvo);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      const btnDemo = document.getElementById('btn-ver-demo');
      if (btnDemo) {
        btnDemo.onclick = () => {
          if (desafioConcluido) return;
          tracosUsuario = [];
          executarDemonstracao(numeroAlvo);
        };
      }

      const btnVerificar = document.getElementById('btn-verificar-escrita');
      if (btnVerificar) {
        btnVerificar.onclick = () => {
          if (!desafioConcluido) validarEscritaLivre(numeroAlvo);
        };
      }
    }

    // ---------------------------------------------------------
    // 4. VALIDAÇÃO DO PONTILHADO (COBERTURA + PRECISÃO DO TRAÇO)
    // ---------------------------------------------------------
    function marcarCheckpointsProximos(pos) {
      if (etapa !== 'guiada') return;
      for (const cp of pontosCheckpoints) {
        if (!cp.coberto) {
          const dist = Math.hypot(pos.x - cp.x, pos.y - cp.y);
          if (dist <= 18) {
            cp.coberto = true;
          }
        }
      }
    }

    function verificarConclusaoPontilhado(numeroAlvo) {
      if (pontosCheckpoints.length === 0) return;

      const cobertos = pontosCheckpoints.filter(cp => cp.coberto).length;
      const percentualCobertura = cobertos / pontosCheckpoints.length;

      // Ainda não terminou de cobrir o número
      if (percentualCobertura < 0.95) return;

      // Verifica se o usuário rabiscou muito fora do pontilhado (ex: fez um 8 em cima do 2)
      const todosPtsUsuario = tracosUsuario.flat();
      let pontosNaTrilha = 0;

      for (const pUser of todosPtsUsuario) {
        let dentro = false;
        for (const pCaminho of todosPontosCaminho) {
          if (Math.hypot(pUser.x - pCaminho.x, pUser.y - pCaminho.y) <= 26) {
            dentro = true;
            break;
          }
        }
        if (dentro) pontosNaTrilha++;
      }

      const precisaoNaTrilha = todosPtsUsuario.length > 0
        ? pontosNaTrilha / todosPtsUsuario.length
        : 0;

      if (precisaoNaTrilha >= 0.80) {
        avancarDesafio(numeroAlvo);
      } else {
        const lousa = document.querySelector('.lousa-container');
        lousa.classList.add('erro');
        setTimeout(() => lousa.classList.remove('erro'), 400);
        Jogo.falar(`Você saiu bastante do pontilhado! Toque em Apagar e siga bem em cima da linha do número ${numeroAlvo}.`);
      }
    }

    // ---------------------------------------------------------
    // 5. VALIDAÇÃO RIGOROSA DA ESCRITA LIVRE
    // ---------------------------------------------------------
    function validarEscritaLivre(numeroAlvo) {
      const todosPontos = tracosUsuario.flat();
      if (todosPontos.length < 15) {
        Jogo.falar(`Escreva o número ${numeroAlvo} na lousa primeiro!`);
        return;
      }

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      todosPontos.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const larguraUser = maxX - minX;
      const alturaUser = maxY - minY;

      if (alturaUser < 80) {
        Jogo.falar(`Escreva o número ${numeroAlvo} um pouco maior na lousa!`);
        return;
      }

      const ehDoisDigitos = String(numeroAlvo).length > 1;
      if (ehDoisDigitos) {
        if (tracosUsuario.length < 2 || larguraUser < alturaUser * 0.68) {
          reprovarEscrita(`Lembre-se: o número ${numeroAlvo} tem o 1 e o 0 lado a lado!`);
          return;
        }
      } else {
        if (numeroAlvo !== 4 && tracosUsuario.length > 2) {
          reprovarEscrita(`Tente escrever apenas o número ${numeroAlvo}!`);
          return;
        }
        // Evita que um risco vertical simples seja aceito para números largos (2, 5, 8)
        if ([2, 5, 8].includes(numeroAlvo) && larguraUser < alturaUser * 0.35) {
          reprovarEscrita(`Esse traço ficou muito fino para o número ${numeroAlvo}. Tente novamente!`);
          return;
        }
      }

      const gradeUsuario = rasterizarNormalizado(tracosUsuario, 64);

      let melhorNumero = -1;
      let melhorPontuacao = -1;
      let segundaMelhor = -1;
      let pontuacaoAlvo = 0;

      for (let candidato = 0; candidato <= 10; candidato++) {
        if (ehDoisDigitos !== (candidato === 10)) continue;

        const caminhosCand = obterCaminhosEmPixels(candidato, 320, 360);
        const gradeCand = rasterizarNormalizado(caminhosCand, 64);
        const score = calcularSimilaridadeGrade(gradeUsuario, gradeCand);

        if (candidato === numeroAlvo) {
          pontuacaoAlvo = score;
        }
        if (score > melhorPontuacao) {
          segundaMelhor = melhorPontuacao;
          melhorPontuacao = score;
          melhorNumero = candidato;
        } else if (score > segundaMelhor) {
          segundaMelhor = score;
        }
      }

      // Exige alta similaridade (>= 0.64) E que o alvo seja claramente o vencedor
      const passou = pontuacaoAlvo >= 0.64 && melhorNumero === numeroAlvo && (pontuacaoAlvo - segundaMelhor) >= 0.03;

      if (passou) {
        avancarDesafio(numeroAlvo);
      } else {
        reprovarEscrita(`Esse traço não parece o número ${numeroAlvo}. Toque em Apagar e tente novamente!`);
      }
    }

    function reprovarEscrita(mensagem) {
      const lousa = document.querySelector('.lousa-container');
      lousa.classList.add('erro');
      setTimeout(() => lousa.classList.remove('erro'), 400);
      Jogo.falar(mensagem);
    }

    function rasterizarNormalizado(listaTracos, tamanhoGrade) {
      const pts = listaTracos.flat();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const w = Math.max(1, maxX - minX);
      const h = Math.max(1, maxY - minY);
      const margem = 8;
      const areaUtil = tamanhoGrade - margem * 2;
      const escala = areaUtil / Math.max(w, h);

      const offsetX = (tamanhoGrade - w * escala) / 2;
      const offsetY = (tamanhoGrade - h * escala) / 2;

      const c = document.createElement('canvas');
      c.width = tamanhoGrade;
      c.height = tamanhoGrade;
      const g = c.getContext('2d');

      g.lineWidth = 5.2; // Espessura mais seletiva para diferenciar 2, 5, 6, 8, 9
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = '#000';

      listaTracos.forEach(traco => {
        if (traco.length === 0) return;
        g.beginPath();
        traco.forEach((p, i) => {
          const nx = (p.x - minX) * escala + offsetX;
          const ny = (p.y - minY) * escala + offsetY;
          if (i === 0) g.moveTo(nx, ny);
          else g.lineTo(nx, ny);
        });
        g.stroke();
      });

      const data = g.getImageData(0, 0, tamanhoGrade, tamanhoGrade).data;
      const matriz = new Uint8Array(tamanhoGrade * tamanhoGrade);
      for (let i = 0; i < matriz.length; i++) {
        matriz[i] = data[i * 4 + 3] > 60 ? 1 : 0;
      }
      return matriz;
    }

    function calcularSimilaridadeGrade(a, b) {
      let intersecao = 0;
      let totalA = 0;
      let totalB = 0;

      for (let i = 0; i < a.length; i++) {
        if (a[i]) totalA++;
        if (b[i]) totalB++;
        if (a[i] && b[i]) intersecao++;
      }

      if (totalA === 0 || totalB === 0) return 0;
      return (2 * intersecao) / (totalA + totalB);
    }

    // ---------------------------------------------------------
    // 6. AVANÇA ENTRE NÚMEROS E ETAPAS (COM TRAVA ANTI-DUPLICIDADE)
    // ---------------------------------------------------------
    function avancarDesafio(numeroConcluido) {
      if (desafioConcluido) return;
      desafioConcluido = true;

      areaJogo.classList.add('bloqueado');
      Jogo.falar(`Muito bem! Você escreveu o número ${numeroConcluido}!`, () => {
        indiceAtual++;

        if (etapa === 'guiada' && indiceAtual >= numerosGuiados.length) {
          etapa = 'livre';
          indiceAtual = 0;
          montarTela();
        } else if (etapa === 'livre' && indiceAtual >= numerosLivres.length) {
          Jogo.concluirFase();
        } else {
          montarTela();
        }
      });
    }

    montarTela();
  }
};