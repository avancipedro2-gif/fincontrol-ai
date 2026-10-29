# Plano revisado — FinControl AI para dados privados

Nada será executado (código, banco ou publicação) até sua aprovação expressa. Sem migrações destrutivas: nada é apagado.

## Etapa 1 — Fechar o acesso público (prioridade)
Problema: o banco é compartilhado entre a prévia e o site publicado. Se fecharmos o banco antes de publicar o novo app, o site publicado fica vazio (seguro, mas quebrado); se publicarmos antes de fechar, continua exposto.

Sequência proposta:
1. Implementar e testar tudo na prévia (login, isolamento, demo).
2. Na mesma etapa em que o banco é fechado, você publica a nova versão. Entre as duas ações, o site antigo apenas deixa de mostrar dados — nunca expõe nada.
3. Alternativa mais rápida, se preferir: fechar o banco já no primeiro passo, aceitando que o site publicado fique sem dados até a nova publicação.

O que muda no banco:
- Remover a regra pública atual de movimentações e metas e retirar todo acesso de visitantes não logados.
- Adicionar o dono (`user_id`) em cada registro, preenchido automaticamente com o usuário logado.
- Regras por usuário: consultar, criar, alterar e excluir apenas os próprios registros; impossível criar registro em nome de outro.

## Etapa 2 — Contas (somente e-mail e senha)
- Cadastro com confirmação de e-mail obrigatória, login, logout e "esqueci minha senha" com página de nova senha.
- Proteção contra senhas vazadas ativada.
- Seis módulos atrás do login; cabeçalho com o usuário e "Sair". Visual atual mantido.
- Login Google fica para etapa futura.

## Etapa 3 — Demonstração separada
- Copiar os 32 registros e as 3 metas para tabelas próprias de demonstração, somente leitura.
- Página pública `/demo` com os seis módulos lendo apenas essas tabelas; nada pode ser gravado.
- Como evitar exposição de dados reais na demo:
  - a demo nunca consulta as tabelas de clientes (código separado e regras do banco não permitem);
  - as tabelas de demo não aceitam escrita de ninguém pelo app, então dados reais não entram nelas;
  - a demo não usa a IA;
  - os testes verificam que um visitante da demo não lê nada das tabelas reais.
- Os registros originais não são apagados: ficam sem dono e invisíveis para todos. A remoção pode ser feita depois, com sua autorização.

## Etapa 4 — Assistente IA com planos Free e Pro
- O servidor exige login e valida o usuário em cada mensagem.
- O resumo financeiro é montado no servidor com os dados do próprio usuário (hoje vem do navegador e pode ser falsificado).
- Planos: Free = 0 mensagens; Pro = 20 mensagens por mês. Novos usuários começam no Free.
- Limite aplicado no servidor de forma atômica: a mensagem só é enviada à IA se a reserva da cota funcionar numa única operação no banco; mensagens simultâneas não ultrapassam o limite. Se a IA falhar, a cota é devolvida.
- O plano do usuário só pode ser alterado pelo servidor (o usuário não consegue se promover a Pro). Sem cobrança por enquanto: o Pro é concedido manualmente para testes.
- Na tela: cota restante e aviso amigável no Free ou quando acabar.
- Instruções fixas no servidor e limite de tamanho de mensagem/histórico para reduzir manipulação e custo.

## Etapa 5 — Correções
- Metas: hoje o valor novo é calculado no navegador, então dois aportes ao mesmo tempo podem se sobrescrever. Passará a ser uma soma feita no banco numa única operação.
- Exportação CSV: textos iniciados por `=`, `+`, `-`, `@`, tab ou retorno recebem um apóstrofo para o Excel não executar como fórmula; aspas internas escapadas.

## Etapa 6 — Testes
- Persistência: criar, ler, alterar e excluir movimentações e metas de um usuário.
- Isolamento com dois usuários (chamando o banco diretamente): A não lê, altera nem exclui dados de B; visitante sem login não acessa nada; demo não lê dados reais.
- Autorização da IA: sem login → recusado; token inválido → recusado; resposta de A nunca contém dados de B.
- Limites: Free bloqueado; Pro para na 20ª mensagem; mensagens simultâneas não ultrapassam o limite; usuário não consegue mudar o próprio plano.
- Operações financeiras: cálculos existentes, aportes simultâneos em metas e neutralização de fórmulas no CSV.
- Usuários de teste removidos ao final.

## Custos
Créditos de implementação (estimativa, não medida): trabalho grande, em várias mensagens — banco, telas de login, demo, IA e testes. O consumo exato depende da quantidade de ajustes e não pode ser previsto com precisão; posso consultar seu uso real depois de cada etapa.

Custos recorrentes:
- Gratuito/incluso: login e banco dentro da franquia do Lovable Cloud do seu plano; usuários Free (sem IA) não geram custo de IA.
- Variável: IA — no máximo 20 mensagens por usuário Pro por mês, então o custo cresce de forma previsível com o número de assinantes Pro; uso do banco e hospedagem acima da franquia; e-mails de autenticação (para uso comercial, recomendável domínio de e-mail próprio).
- Desconhecido: valor exato por mensagem de IA (depende do tamanho das conversas), volume real de usuários e tráfego, e custo futuro de cobrança (taxas do meio de pagamento).

## Riscos
- Janela entre fechar o banco e publicar: site antigo sem dados (sem exposição).
- Limite próprio simples; não substitui proteção contra ataques em grande escala.
- Confirmação de e-mail depende da entrega; o envio padrão tem limite baixo.
- Ainda faltarão para comercializar: cobrança, termos de uso, política de privacidade (LGPD) e suporte.

## Detalhes técnicos
- Migração aditiva: `user_id uuid DEFAULT auth.uid()` + índice; `DROP POLICY` da regra pública; políticas `TO authenticated` com `auth.uid() = user_id`; `REVOKE ALL ... FROM anon`.
- `demo_transactions`/`demo_goals` criadas com `INSERT ... SELECT` (backfill); somente `SELECT` para `anon`/`authenticated`.
- `user_plans (user_id, plan)` sem escrita pelo cliente; `ai_usage (user_id, month, count)`; função `consume_ai_quota()` `SECURITY DEFINER` com `INSERT ... ON CONFLICT DO UPDATE ... WHERE count < limite RETURNING`, e `refund_ai_quota()`.
- `add_to_goal(goal_id, amount)` com `UPDATE ... SET current_amount = current_amount + amount WHERE user_id = auth.uid()`.
- Rotas sob `_authenticated/`; `/api/chat` valida bearer via `getUser()` e lê dados com o cliente do próprio usuário (RLS).
- Testes Vitest com dois usuários de teste reais.
