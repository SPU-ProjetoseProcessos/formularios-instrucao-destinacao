# Formulários de Instrução de Destinação

Ferramenta da Secretaria do Patrimônio da União (SPU) para preencher os formulários
padronizados de análise dos processos de destinação de imóveis da União e levar o resultado
pronto para o SEI.

**Protótipo em validação.** Não use para instruir processo real.

## O que faz

1. **Escolha do formulário.** Mostra só os formulários disponíveis. Hoje: Inscrição de
   Ocupação e Aforamento Gratuito.
2. **Enquadramento.** Com valor, área da União e as perguntas do caso, diz se há manifestação
   prévia da Comissão de Destinações Especiais (CDE) e quem decide, com o fundamento. O
   cálculo é o da [Governança da Destinação](https://spu-projetoseprocessos.github.io/simulador-competencia-spu/).
3. **Fluxo do processo**, a partir do [SPUProcessos](https://spu-projetoseprocessos.github.io/SPUProcessos/).
4. **Análise.** Os itens do formulário, com os lembretes da Unidade Central e os links para as
   normas (no [MemóriaSPU](https://memoria-spu.gestao.gov.br/), quando a norma está lá).
5. **Conferência e saída.** Aponta respostas que impedem ou contradizem o enquadramento e os
   itens sem resposta; copia o documento para colar no SEI ou imprime em PDF.

## Como funciona

Página estática, sem servidor e sem cadastro. O que se digita fica só no navegador de quem
preenche. A página lê a base de regras e o motor da Governança da Destinação e o catálogo do
SPUProcessos nos endereços publicados; a lista de municípios vem da API de localidades do
IBGE, gerada uma vez.

Os textos do formulário (opções, lembretes, aberturas) são recortados do formulário oficial,
sem redigitação.

---

Desenvolvido por CGGES — [Escritório de Processos](https://spu-projetoseprocessos.github.io/escritorio/)
