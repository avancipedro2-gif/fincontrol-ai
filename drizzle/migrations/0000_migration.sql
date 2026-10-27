CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('receita','despesa')),
  category text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo public access" ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo public access" ON public.goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.transactions (description, amount, type, category, date) VALUES
('Salário', 8500, 'receita', 'Salário', current_date - 150),
('Salário', 8500, 'receita', 'Salário', current_date - 120),
('Salário', 8500, 'receita', 'Salário', current_date - 90),
('Salário', 8800, 'receita', 'Salário', current_date - 60),
('Salário', 8800, 'receita', 'Salário', current_date - 30),
('Salário', 8800, 'receita', 'Salário', current_date - 2),
('Freelance site', 2200, 'receita', 'Freelance', current_date - 100),
('Freelance app', 3100, 'receita', 'Freelance', current_date - 40),
('Dividendos', 420, 'receita', 'Investimentos', current_date - 15),
('Aluguel', 2600, 'despesa', 'Moradia', current_date - 148),
('Aluguel', 2600, 'despesa', 'Moradia', current_date - 118),
('Aluguel', 2600, 'despesa', 'Moradia', current_date - 88),
('Aluguel', 2600, 'despesa', 'Moradia', current_date - 58),
('Aluguel', 2600, 'despesa', 'Moradia', current_date - 28),
('Supermercado', 980, 'despesa', 'Alimentação', current_date - 140),
('Supermercado', 1120, 'despesa', 'Alimentação', current_date - 110),
('Supermercado', 1050, 'despesa', 'Alimentação', current_date - 80),
('Supermercado', 1230, 'despesa', 'Alimentação', current_date - 50),
('Supermercado', 1180, 'despesa', 'Alimentação', current_date - 20),
('Restaurantes', 640, 'despesa', 'Alimentação', current_date - 12),
('Uber e combustível', 520, 'despesa', 'Transporte', current_date - 95),
('Uber e combustível', 610, 'despesa', 'Transporte', current_date - 35),
('Uber e combustível', 480, 'despesa', 'Transporte', current_date - 8),
('Streaming e apps', 180, 'despesa', 'Assinaturas', current_date - 70),
('Streaming e apps', 180, 'despesa', 'Assinaturas', current_date - 10),
('Academia', 150, 'despesa', 'Saúde', current_date - 45),
('Farmácia', 230, 'despesa', 'Saúde', current_date - 25),
('Cinema e shows', 390, 'despesa', 'Lazer', current_date - 60),
('Viagem fim de semana', 1450, 'despesa', 'Lazer', current_date - 18),
('Curso online', 600, 'despesa', 'Educação', current_date - 75),
('Energia e internet', 420, 'despesa', 'Moradia', current_date - 5);

INSERT INTO public.goals (name, target_amount, current_amount, deadline) VALUES
('Reserva de emergência', 30000, 18500, current_date + 240),
('Viagem para o Japão', 22000, 6400, current_date + 400),
('Notebook novo', 9000, 7200, current_date + 90);