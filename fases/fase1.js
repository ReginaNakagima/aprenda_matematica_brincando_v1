window.Fases[1] = {
  indiceDesafio: 0,
  apresentacao: [
    { 
      id: 'circulo', 
      texto: 'Este é o círculo vermelho. Ele é bem redondinho como uma bola!' 
    },
    { 
      id: 'quadrado', 
      texto: 'Este é o quadrado azul. Ele tem quatro lados iguais.' 
    },
    { 
      id: 'retangulo', 
      texto: 'Este é o retângulo preto. Ele parece um quadrado esticado, porque tem dois lados mais compridos!' 
    },
    { 
      id: 'triangulo', 
      texto: 'Este é o triângulo amarelo. Ele tem três pontinhas!' 
    },
    { 
      id: 'losango', 
      texto: 'E este é o losango branco! Ele parece um balãozinho de festa ou uma pipa no céu!' 
    }
  ],
  desafios: [
    { id: 'circulo', instrucao: 'Agora é a sua vez! Toque no círculo vermelho!' },
    { id: 'quadrado', instrucao: 'Muito bem! Agora toque no quadrado azul!' },
    { id: 'retangulo', instrucao: 'Isso aí! Agora toque no retângulo preto!' },
    { id: 'triangulo', instrucao: 'Perfeito! Agora toque no triângulo amarelo!' },
    { id: 'losango', instrucao: 'Para terminar, toque no losango branco, que parece um balão!' }
  ],

  iniciar(areaJogo) {
    this.indiceDesafio = 0;
    areaJogo.innerHTML = `
      <div class="forma circulo" data-id="circulo" onclick="window.Fases[1].verificar('circulo')"></div>
      <div class="forma quadrado" data-id="quadrado" onclick="window.Fases[1].verificar('quadrado')"></div>
      <div class="forma retangulo" data-id="retangulo" onclick="window.Fases[1].verificar('retangulo')"></div>
      <div class="forma triangulo" data-id="triangulo" onclick="window.Fases[1].verificar('triangulo')"></div>
      <div class="forma losango" data-id="losango" onclick="window.Fases[1].verificar('losango')"></div>
    `;
    Jogo.definirInstrucao('Vamos conhecer cinco formas e suas cores!', true, () => this.apresentar(0));
  },

  apresentar(index) {
    if (Jogo.faseAtual !== 1) return;
    document.querySelectorAll('[data-id]').forEach(el => el.classList.remove('destaque'));

    if (index < this.apresentacao.length) {
      const item = this.apresentacao[index];
      const el = document.querySelector(`[data-id="${item.id}"]`);
      if (el) el.classList.add('destaque');

      Jogo.definirInstrucao(item.texto, true, () => {
        if (el) el.classList.remove('destaque');
        setTimeout(() => this.apresentar(index + 1), 400);
      });
    } else {
      Jogo.estado = 'jogando';
      document.getElementById('area-jogo').classList.remove('bloqueado');
      Jogo.definirInstrucao(this.desafios[0].instrucao, true);
    }
  },

  verificar(escolha) {
    if (Jogo.estado !== 'jogando') return;
    const alvo = this.desafios[this.indiceDesafio];

    if (escolha === alvo.id) {
      this.indiceDesafio++;
      if (this.indiceDesafio < this.desafios.length) {
        Jogo.definirInstrucao(this.desafios[this.indiceDesafio].instrucao, true);
      } else {
        Jogo.concluirFase();
      }
    } else {
      const el = document.querySelector(`[data-id="${escolha}"]`);
      if (el) {
        el.classList.add('erro');
        setTimeout(() => el.classList.remove('erro'), 300);
      }
      Jogo.falar('Quase lá! Ouça com atenção e tente tocar na forma certa.');
    }
  }
};