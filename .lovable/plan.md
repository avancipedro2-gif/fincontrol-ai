# Recuperar a demonstração acadêmica (mesmo link)

## Diagnóstico
- O site publicado (wealth-goals-companion.lovable.app) responde com **erro 500**: ele roda a versão antiga do código, que trava quando o banco recusa o acesso. A correção desse travamento existe só na prévia e nunca foi publicada.
- Na prévia não há travamento, mas as telas aparecem vazias (o banco bloqueia visitantes, como planejado) e adicionar/excluir movimentações ou metas falha.
- As regras de segurança estão corretas e serão mantidas: nenhum acesso público às tabelas reais.

## Plano (somente frontend, sem mexer no banco)
1. Criar um arquivo de dados fictícios local com as 31 movimentações e 3 metas de exemplo originais (os mesmos valores criados por mim no início do projeto, confirmadamente fictícios). O registro "pix recebido" (R$ 100,00) fica de fora, pois não há como confirmar que é fictício.
2. As telas passam a ler esses dados locais em vez do banco: Dashboard, Receitas e Despesas, Metas, Relatórios e gráficos voltam a mostrar o mesmo conteúdo de antes.
3. Adicionar, excluir e fazer aportes funcionam apenas no navegador do visitante (salvos no próprio aparelho, com botão "Restaurar dados de exemplo"). Nada é gravado no banco, nada é compartilhado entre visitantes.
4. Um aviso discreto "Modo demonstração — dados fictícios" no topo.
5. Simulador de Investimentos: já funciona sem banco, sem mudança.
6. Assistente IA: continua funcionando, recebendo apenas o resumo dos dados fictícios. Observação: segue sem login e sem limite, como antes (risco de custo já relatado). Opcional: posso limitá-lo ou desativá-lo — diga sua preferência.
7. Exportação CSV: incluir a neutralização de fórmulas (pequena, protege quem abrir o arquivo).
8. Visual e seis módulos mantidos sem alteração.

## Verificação
- Testes automáticos dos cálculos.
- Abrir as seis telas na prévia em celular (414px) e computador (1280px), com capturas de tela, e testar adicionar/excluir/aporte.

## Publicação
- **Sim, será necessário publicar** (botão Publicar → Publicar alterações). O endereço continua exatamente o mesmo; o link enviado ao professor passa a funcionar após a publicação. Não publicarei automaticamente.

## Custos e riscos
- Baixo consumo de créditos de implementação; nenhum custo novo recorrente (só o uso da IA, como hoje).
- Dados adicionados por visitantes ficam apenas no aparelho deles e somem ao limpar o navegador.
