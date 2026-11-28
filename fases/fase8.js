// =========================================================
// FASE 8 (1º ANO): ESCRITA DOS NÚMEROS DE 0 A 10 NA TELA
// 1. Demonstração animada do traçado correto
// 2. Pontilhado de linha única (exige preenchimento completo)
// 3. Escrita livre com validação discriminativa (0 a 10)
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

    let pontosCheckpoints = [];
    let tracosUsuario = []; // Array de traços: [[{x,y}, ...], ...]
    let tracoAtual = [];

    // Caminhos vetoriais escolares normalizados (coordenadas 0..1 dentro da lousa 320x360)
    const TRACADOS = {
      0: [
        [
          { x: 0.50, y: 0.16 }, { x: 0.34, y: 0.22 }, { x: 0.27, y: 0.38 },
          { x: 0.27, y: 0.62 }, { x: 0.34, y: 0.78 }, { x: 0.50, y: 0.84 },
          { x: 0.66, y: 0.78 }, { x: 0.73, y: 0.62 }, { x: 0.73, y: 0.38 },
          { x: 0.66, y: 0.22 }, { x: 0.50, y: 0.16 }
        ]
      ],
      1: [
        [
          { x: 0.36, y: 0.32 }, { x: 0.52, y: 0.16 }, { x: 0.52, y: 0.84 }
        ]
      ],
      2: [
        [
          { x: 0.30, y: 0.30 }, { x: 0.38, y: 0.18 }, { x: 0.54, y: 0.16 },
          { x: 0.68, y: 0.24 }, { x: 0.68, y: 0.38 }, { x: 0.55, y: 0.52 },
          { x: 0.28, y: 0.84 }, { x: 0.72, y: 0.84 }
        ]
      ],
      3: [
        [
          { x: 0.30, y: 0.24 }, { x: 0.46, y: 0.16 }, { x: 0.64, y: 0.22 },
          { x: 0.66, y: 0.36 }, { x: 0.50, y: 0.48 }, { x: 0.68, y: 0.60 },
          { x: 0.66, y: 0.78 }, { x: 0.46, y: 0.84 }, { x: 0.28, y: 0.76 }
        ]
      ],
      4: [
        [
          { x: 0.58, y: 0.16 }, { x: 0.26, y: 0.62 }, { x: 0.74, y: 0.62 }
        ],
        [
          { x: 0.58, y: 0.16 }, { x: 0.58, y: 0.84 }
        ]
      ],
      5: [
        [
          { x: 0.68, y: 0.16 }, { x: 0.34, y: 0.16 }, { x: 0.32, y: 0.46 },
          { x: 0.52, y: 0.44 }, { x: 0.69, y: 0.54 }, { x: 0.69, y: 0.72 },
          { x: 0.54, y: 0.84 }, { x: 0.32, y: 0.80 }
        ]
      ],
      6: [
        [
          { x: 0.64, y: 0.20 }, { x: 0.46, y: 0.16 }, { x: 0.31, y: 0.32 },
          { x: 0.28, y: 0.62 }, { x: 0.36, y: 0.80 }, { x: 0.54, y: 0.84 },
          { x: 0.70, y: 0.72 }, { x: 0.68, y: 0.54 }, { x: 0.50, y: 0.48 },
          { x: 0.31, y: 0.56 }
        ]
      ],
      7: [
        [
          { x: 0.28, y: 0.16 }, { x: 0.72, y: 0.16 }, { x: 0.42, y: 0.84 }
        ]
      ],
      8: [
        [
          { x: 0.50, y: 0.48 }, { x: 0.33, y: 0.38 }, { x: 0.34, y: 0.22 },
          { x: 0.50, y: 0.16 }, { x: 0.66, y: 0.22 }, { x: 0.67, y: 0.38 },
          { x: 0.50, y: 0.48 }, { x: 0.30, y: 0.60 }, { x: 0.31, y: 0.78 },
          { x: 0.50, y: 0.84 }, { x: 0.69, y: 0.78 }, { x: 0.70, y: 0.60 },
          { x: 0.50, y: 0.48 }
        ]
      ],
      9: [
        [
          { x: 0.68, y: 0.36 }, { x: 0.52, y: 0.48 }, { x: 0.34, y: 0.44 },
          { x: 0.30, y: 0.28 }, { x: 0.44, y: 0.16 }, { x: 0.62, y: 0.20 },
          { x: 0.70, y: 0.38 }, { x: 0.66, y: 0.68 }, { x: 0.50, y: 0.84 },
          { x: 0.34, y: 0.80 }
        ]
      ],
      10: [
        // Dígito 1 à esquerda
        [
          { x: 0.16, y: 0.32 }, { x: 0.28, y: 0.16 }, { x: 0.28, y: 0.84 }
        ],
        // Dígito 0 à direita
        [
          { x: 0.66, y: 0.16 }, { x: 0.52, y: 0.22 }, { x: 0.46, y: 0.38 },
          { x: 0.46, y: 0.62 }, { x: 0.52, y: 0.78 }, { x: 0.66, y: 0.84 },
          { x: 0.80, y: 0.78 }, { x: 0.86, y: 0.62 }, { x: 0.86, y: 0.38 },
          { x: 0.80, y: 0.22 }, { x: 0.66, y: 0.16 }
        ]
      ]
    };

    // Converte pontos normalizados (0..1) em pixels densos ao longo do caminho
    function obterCaminhosEmPixels(numero, largura, altura) {
      const caminhosNorm = TRACADOS[numero];
      return caminhosNorm.map(stroke => {
        const denso = [];
        for (let i = 0; i < stroke.length - 1; i++) {
          const p1 = { x: stroke[i].x * largura, y: stroke[i].y * altura };
          const p2 = { x: stroke[i + 1].x * largura, y: stroke[i + 1].y * altura };
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const passos = Math.max(1, Math.ceil(dist / 6));
          for (let s = 0; s <= passos; s++) {
            const t = s / passos;
            denso.push({
              x: p1.x + (p2.x - p1.x) * t,
              y: p1.y + (p2.y - p1.y) * t
            });
          }
        }
        return denso;
      });
    }

    function montarTela() {
      if (animacaoId) cancelAnimationFrame(animacaoId);
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

      configurarEventosToque(numeroAlvo);

      if (etapa === 'guiada') {
        desenharMoldePontilhado(numeroAlvo);
        Jogo.definirInstrucao(`Observe como escrever o número ${numeroAlvo} e depois cubra todo o pontilhado!`, true);
        executarDemonstracao(numeroAlvo);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Jogo.definirInstrucao(`Agora é sua vez! Escreva o número ${numeroAlvo} na lousa e toque em Pronto!`, true);
      }
    }

    // ---------------------------------------------------------
    // 1. DESENHA O PONTILHADO DE LINHA ÚNICA + CHECKPOINTS
    // ---------------------------------------------------------
    function desenharMoldePontilhado(numero) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pontosCheckpoints = [];

      const caminhos = obterCaminhosEmPixels(numero, canvas.width, canvas.height);

      caminhos.forEach((stroke, idx) => {
        // Linha guia contínua bem suave ao fundo
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0, 150, 136, 0.12)';
        stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();

        // Linha única pontilhada no centro exato do número
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([10, 12]);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#26A69A';
        stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();

        // Bolinha verde indicando o início de cada traço
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

        // Cria checkpoints a cada 14px ao longo de TODO o caminho
        for (let i = 0; i < stroke.length; i += 2) {
          pontosCheckpoints.push({ x: stroke[i].x, y: stroke[i].y, coberto: false });
        }
      });
    }

    // ---------------------------------------------------------
    // 2. DEMONSTRAÇÃO ANIMADA DO TRAÇADO ANTES DA CRIANÇA
    // ---------------------------------------------------------
    function executarDemonstracao(numero) {
      if (animacaoId) cancelAnimationFrame(animacaoId);
      demonstrando = true;
      desenhando = false;

      const caminhos = obterCaminhosEmPixels(numero, canvas.width, canvas.height);
      const todosPontos = [];
      caminhos.forEach((stroke, sIdx) => {
        stroke.forEach((p, pIdx) => {
          todosPontos.push({ x: p.x, y: p.y, novoTraco: pIdx === 0, sIdx });
        });
      });

      let indiceDemo = 0;
      const velocidade = 1.6; // pontos por frame

      function animarFrame() {
        if (!demonstrando) return;

        desenharMoldePontilhado(numero);

        // Desenha o rastro azul da demonstração até o ponto atual
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

        // Desenha o indicador (lápis/dedo) na ponta do traço
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
          // Terminou a demonstração: limpa o rastro azul e deixa o pontilhado pronto
          demonstrando = false;
          tracosUsuario = [];
          desenharMoldePontilhado(numero);
        }
      }

      animacaoId = requestAnimationFrame(animarFrame);
    }

    // ---------------------------------------------------------
    // 3. CAPTURA DE TOQUE / MOUSE E DESENHO DO USUÁRIO
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
        // Se a criança tocar enquanto a demonstração roda, interrompe a demo e libera na hora
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

      const moverTraco = (e) => {
        if (!desenhando) return;
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

      const finalizarTraco = () => {
        if (!desenhando) return;
        desenhando = false;
        if (tracoAtual.length > 0) {
          tracosUsuario.push([...tracoAtual]);
          tracoAtual = [];
        }

        // Só verifica a conclusão do pontilhado quando o usuário solta o traço
        if (etapa === 'guiada') {
          verificarConclusaoPontilhado(numeroAlvo);
        }
      };

      canvas.addEventListener('mousedown', iniciarTraco);
      canvas.addEventListener('mousemove', moverTraco);
      window.addEventListener('mouseup', finalizarTraco);

      canvas.addEventListener('touchstart', iniciarTraco, { passive: false });
      canvas.addEventListener('touchmove', moverTraco, { passive: false });
      canvas.addEventListener('touchend', finalizarTraco);

      document.getElementById('btn-limpar-escrita').onclick = () => {
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
          tracosUsuario = [];
          executarDemonstracao(numeroAlvo);
        };
      }

      const btnVerificar = document.getElementById('btn-verificar-escrita');
      if (btnVerificar) {
        btnVerificar.onclick = () => validarEscritaLivre(numeroAlvo);
      }
    }

    // ---------------------------------------------------------
    // 4. VERIFICAÇÃO RIGOROSA DO PONTILHADO (EXIGE COMPLETO)
    // ---------------------------------------------------------
    function marcarCheckpointsProximos(pos) {
      if (etapa !== 'guiada') return;
      for (const cp of pontosCheckpoints) {
        if (!cp.coberto) {
          const dist = Math.hypot(pos.x - cp.x, pos.y - cp.y);
          if (dist <= 18) { // Raio justo para não aprovar sem passar por cima
            cp.coberto = true;
          }
        }
      }
    }

    function verificarConclusaoPontilhado(numeroAlvo) {
      if (pontosCheckpoints.length === 0) return;

      const cobertos = pontosCheckpoints.filter(cp => cp.coberto).length;
      const percentual = cobertos / pontosCheckpoints.length;

      // Exige pelo menos 96% do pontilhado coberto para aprovar
      if (percentual >= 0.96) {
        avancarDesafio(numeroAlvo);
      }
    }

    // ---------------------------------------------------------
    // 5. VALIDAÇÃO RIGOROSA DA ESCRITA LIVRE (SEM FALSO POSITIVO)
    // ---------------------------------------------------------
    function validarEscritaLivre(numeroAlvo) {
      const todosPontos = tracosUsuario.flat();
      if (todosPontos.length < 15) {
        Jogo.falar(`Escreva o número ${numeroAlvo} na lousa primeiro!`);
        return;
      }

      // Calcula a caixa delimitadora (bounding box) do desenho do usuário
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      todosPontos.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const larguraUser = maxX - minX;
      const alturaUser = maxY - minY;

      if (alturaUser < 70) {
        Jogo.falar(`Escreva o número ${numeroAlvo} um pouco maior na lousa!`);
        return;
      }

      // Checagem estrutural específica para números de 2 dígitos (10)
      const ehDoisDigitos = String(numeroAlvo).length > 1;
      if (ehDoisDigitos) {
        // O número 10 precisa ter pelo menos 2 traços separados (o 1 e o 0) e ser mais largo
        if (tracosUsuario.length < 2 || larguraUser < alturaUser * 0.65) {
          reprovarEscrita(numeroAlvo, `Lembre-se: o número ${numeroAlvo} tem o 1 e o 0 lado a lado!`);
          return;
        }
      } else {
        // Números de 1 dígito (exceto 4) geralmente têm 1 traço e não são excessivamente largos
        if (numeroAlvo !== 4 && tracosUsuario.length > 2) {
          reprovarEscrita(numeroAlvo, `Tente escrever apenas o número ${numeroAlvo}!`);
          return;
        }
      }

      // Normaliza o desenho do usuário para uma grade 64x64 centralizada
      const gradeUsuario = rasterizarNormalizado(tracosUsuario, 64);

      // Compara o desenho do usuário contra TODOS os números de 0 a 10
      let melhorNumero = -1;
      let melhorPontuacao = -1;
      let pontuacaoAlvo = 0;

      for (let candidato = 0; candidato <= 10; candidato++) {
        // Filtra compatibilidade de dígitos
        if (ehDoisDigitos !== (candidato === 10)) continue;

        const caminhosCand = obterCaminhosEmPixels(candidato, 320, 360);
        const gradeCand = rasterizarNormalizado(caminhosCand, 64);
        const score = calcularSimilaridadeGrade(gradeUsuario, gradeCand);

        if (candidato === numeroAlvo) {
          pontuacaoAlvo = score;
        }
        if (score > melhorPontuacao) {
          melhorPontuacao = score;
          melhorNumero = candidato;
        }
      }

      // Exige boa similaridade mínima E que o alvo seja o número mais parecido (ou empate técnico)
      const passou = pontuacaoAlvo >= 0.56 && (melhorNumero === numeroAlvo || (melhorPontuacao - pontuacaoAlvo) < 0.04);

      if (passou) {
        avancarDesafio(numeroAlvo);
      } else {
        reprovarEscrita(numeroAlvo, `Esse traço não parece o número ${numeroAlvo}. Toque em Apagar e tente novamente!`);
      }
    }

    function reprovarEscrita(numeroAlvo, mensagem) {
      const lousa = document.querySelector('.lousa-container');
      lousa.classList.add('erro');
      setTimeout(() => lousa.classList.remove('erro'), 400);
      Jogo.falar(mensagem);
    }

    // Desenha qualquer conjunto de traços normalizado (escala e centro uniformes) numa matriz 64x64
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

      g.lineWidth = 6.5; // Espessura tolerante para curvas manuais
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

    // Calcula o índice Dice / F1-Score entre duas matrizes normalizadas
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
    // 6. AVANÇA ENTRE NÚMEROS E ETAPAS
    // ---------------------------------------------------------
    function avancarDesafio(numeroConcluido) {
      areaJogo.classList.add('bloqueado');
      Jogo.falar(`Muito bem! Você escreveu o número ${numeroConcluido}!`, () => {
        areaJogo.classList.remove('bloqueado');
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