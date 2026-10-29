# Plano — FinControl AI pronto para dados privados

Nada será alterado até sua aprovação. Nenhuma migração destrutiva (sem DROP/DELETE) e nenhuma publicação automática.

## 1. Contas individuais
- Página `/auth` com cadastro, login e "esqueci minha senha" (e-mail e senha), mais entrar com Google.
- Página pública `/reset-password` para definir nova senha pelo link do e-mail.
- Confirmação de e-mail obrigatória no cadastro (padrão seguro); proteção contra senhas vazadas ativada.
- Os seis módulos passam a ficar atrás do login; cabeçalho mostra o usuário e botão "Sair" (limpa os dados em memória ao sair).
- Visual atual (azul-marinho, azul/verde, Sora + Manrope) mantido.

## 2 e 3. Dono de cada registro e regras de acesso
- Adicionar `user_id` (padrão = usuário logado) em movimentações e metas, com índice.
- Remover a regra pública "demo public access" e criar regras por usuário: ver, criar, alterar e excluir somente onde `user_id = usuário logado`.
- Retirar todo acesso de visitantes não logados a essas tabelas.

## 4. Demonstração isolada
- Criar tabelas separadas de demonstração, somente leitura, e copiar para elas os 32 registros e as 3 metas.
- Página pública `/demo` mostra o app com esses dados, sem gravar nada e sem tocar em dados de clientes.
- Os registros originais não são apagados (sem migração destrutiva): ficam sem dono e, portanto, invisíveis para todos. Podem ser removidos depois, só com sua autorização.

## 5. Assistente IA protegido
- O servidor do assistente passa a exigir login e valida o usuário a cada mensagem.
- O resumo financeiro passa a ser montado no servidor a partir dos dados do próprio usuário (hoje vem do navegador e pode ser falsificado).
- Limite de uso: até 30 mensagens por usuário por dia e tamanho máximo de mensagem/histórico, registrados no banco. Ao atingir, mensagem amigável.
- Instruções fixas no servidor para reduzir tentativas de manipulação do assistente.
- O modo `/demo` não usa a IA (evita custo de visitantes).

## 6. Credenciais
- Chave da IA continua só no servidor. No navegador fica apenas a chave pública do banco (feita para isso). Será feita varredura para confirmar.

## 7. Testes de segurança
- Testes automatizados que criam dois usuários e verificam, chamando o banco diretamente: A não lê, altera nem exclui dados de B; visitante sem login não acessa nada; não é possível criar registro em nome de outro.
- Teste do assistente: sem login é recusado; com login de A, nunca recebe dados de B; limite diário é aplicado.
- Usuários de teste removidos ao final.

## Extra (recomendado)
- Corrigir a exportação CSV dos relatórios para neutralizar fórmulas.

## Custos potenciais
- IA: cobrada por uso; com limite de 30 mensagens/dia por usuário, o custo máximo é previsível e cresce com o número de clientes.
- Banco e login: incluídos no Lovable Cloud até a franquia do plano; acima dela, cobrança por uso.
- E-mails de autenticação: o envio padrão tem limite baixo; para uso comercial, recomendável configurar domínio de e-mail próprio.

## Riscos
- Dados criados hoje pelo app ficam sem dono após a mudança (inclusive os de demonstração no original) — por isso a cópia para a demo.
- A versão publicada continua com o comportamento antigo até você publicar; e enquanto o banco já estiver protegido e o site publicado não, o site publicado deixará de mostrar dados.
- O limite de uso é uma solução própria simples (a plataforma não tem limitador padrão); não protege contra ataques de grande escala.
- Ainda faltarão para comercializar: termos de uso, política de privacidade (LGPD), cobrança e suporte.

## Detalhes técnicos
- Migração aditiva: `ALTER TABLE ... ADD COLUMN user_id uuid DEFAULT auth.uid()`; `DROP POLICY` da regra pública; políticas `TO authenticated` com `auth.uid() = user_id`; `REVOKE` de `anon`.
- Tabelas `demo_transactions`/`demo_goals` com `INSERT ... SELECT` (backfill) e política `SELECT` para `anon`.
- Tabela `ai_usage (user_id, day, count)` com função `SECURITY DEFINER` para incremento atômico.
- Rotas protegidas sob `_authenticated/`; `/api/chat` valida bearer token via `getUser()`; middleware cliente envia o token.
- Testes em Vitest usando o cliente público com dois usuários reais confirmados de teste.
