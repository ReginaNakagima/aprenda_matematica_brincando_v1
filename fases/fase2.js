window.Fases[2] = {
  indiceDesafio: 0,
  apresentacao: [
    { id: 'cesta-pouco', texto: 'Esta cesta tem poucas maçãs. Só uma maçã.' },
    { id: 'cesta-muito', texto: 'E esta cesta tem muitas maçãs!' }
  ],
  desafios: [
    { id: 'cesta-muito', instrucao: 'Toque na cesta que tem MAIS maçãs!' },
    { id: 'cesta-pouco', instrucao: 'Muito bem! Agora toque na cesta que tem MENOS maçãs!' }
  ],

  iniciar(areaJogo) {
    this.indiceDesafio = 0;
    areaJogo.innerHTML = `
      <div class="cesta" data-id="cesta-pouco" onclick="window.Fases[2].verificar('cesta-pouco')">🍎</div>
      <div class="cesta" data-id="cesta-muito" onclick="window.Fases[2].verificar('cesta-muito')">🍎🍎🍎🍎</div>
    `;
    Jogo.definirInstrucao('Vamos comparar quantidades!', true, () => this.apresentar(0));
  },

  apresentar(index) {
    if (Jogo.faseAtual !== 2) return;
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
      Jogo.falar('Quase lá! Tente tocar no outro.');
    }
  }
};