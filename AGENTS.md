<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Demo mode without auth: `transactions` and `goals` tables have public anon RLS policies — add auth before storing private data.
- Financial calculations live in `src/lib/finance.ts` (tested in `finance.test.ts`); pages only render.
- The AI assistant streams plain text from the server route `src/routes/api/chat.ts`; the client sends a financial summary as context, keeping the API key server-side.
