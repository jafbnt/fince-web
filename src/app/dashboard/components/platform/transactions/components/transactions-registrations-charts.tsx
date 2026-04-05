import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreditCardExpenseStore } from "../../credit-card-expenses/store";
import {
  ccExpenseAmountToReais,
  type CreditCardExpense,
} from "../../credit-card-expenses/type";
import { useExpenseStore } from "../../expenses/store";
import { expenseApiAmountToReais, type Expense } from "../../expenses/type";
import { useRevenueStore } from "../../revenue/store";
import { revenueApiAmountToReais, type Revenue } from "../../revenue/type";

const RECENT_COUNT = 7;

/** Tailwind palette (`theme.css`): green-500, red-500, orange-500. */
const CHART_COLORS = {
  receita: "var(--color-green-500)",
  despesa: "var(--color-red-500)",
  despesaCartao: "var(--color-orange-500)",
} as const;

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatAxisNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);
}

type ChartRow = {
  /** Ordem no eixo X (mais antigo → mais recente entre os últimos N). */
  seq: number;
  /** Texto completo para o tooltip. */
  description: string;
  value: number;
};

function toChartRows<T>(
  items: T[],
  getDate: (item: T) => string,
  getDescription: (item: T) => string,
  getValue: (item: T) => number,
): ChartRow[] {
  const sorted = [...items].sort(
    (a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime(),
  );
  const slice = sorted.slice(0, RECENT_COUNT).reverse();
  return slice.map((item, i) => ({
    seq: i + 1,
    description: getDescription(item).trim() || "—",
    value: getValue(item),
  }));
}

function recentRevenueRows(revenues: Revenue[]): ChartRow[] {
  return toChartRows(
    revenues,
    (r) => r.dateReceipt,
    (r) => r.description,
    (r) => revenueApiAmountToReais(r.amount),
  );
}

function recentExpenseRows(expenses: Expense[]): ChartRow[] {
  return toChartRows(
    expenses,
    (e) => e.datePaid,
    (e) => e.description,
    (e) => expenseApiAmountToReais(e.amount),
  );
}

function recentCcExpenseRows(items: CreditCardExpense[]): ChartRow[] {
  return toChartRows(
    items,
    (e) => e.datePaid,
    (e) => e.description,
    (e) => ccExpenseAmountToReais(e.amount),
  );
}

function chartConfigFor(color: string): ChartConfig {
  return {
    value: {
      label: "Valor",
      color,
    },
  } satisfies ChartConfig;
}

type RegistrationAreaChartProps = {
  id: string;
  title: string;
  description: string;
  data: ChartRow[];
  loading: boolean;
  color: string;
};

function RegistrationAreaChart({
  id,
  title,
  description,
  data,
  loading,
  color,
}: RegistrationAreaChartProps) {
  const config = chartConfigFor(color);
  const gradientId = `tx-area-fill-${id}`;

  return (
    <Card size="sm" className="min-w-0 shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && data.length === 0 ? (
          <Skeleton className="h-[240px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Nenhum cadastro para exibir.
          </div>
        ) : (
          <ChartContainer
            id={id}
            config={config}
            className="aspect-auto h-[240px] w-full"
            initialDimension={{ width: 400, height: 240 }}
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 8, right: 12, top: 12, bottom: 8 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="seq"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => String(v)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatAxisNumber(Number(v))}
                label={{
                  value: "Valor",
                  angle: -90,
                  position: "insideLeft",
                  offset: 2,
                  style: { fill: "var(--muted-foreground)", fontSize: 11 },
                }}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as ChartRow;
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      label={row.description}
                      formatter={(value) => formatBrl(Number(value))}
                    />
                  );
                }}
              />
              <Area
                type="linear"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "var(--background)",
                  fill: "var(--color-value)",
                }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TransactionsRegistrationsCharts() {
  const revenues = useRevenueStore((s) => s.revenues);
  const loadingRevenues = useRevenueStore((s) => s.loadingList);
  const expenses = useExpenseStore((s) => s.expenses);
  const loadingExpenses = useExpenseStore((s) => s.loadingList);
  const ccExpenses = useCreditCardExpenseStore((s) => s.creditCardExpenses);
  const loadingCc = useCreditCardExpenseStore((s) => s.loadingList);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <RegistrationAreaChart
        id="tx-chart-receitas"
        title="Receitas"
        description={`Últimos ${RECENT_COUNT} cadastros por data de recebimento (área linear).`}
        data={recentRevenueRows(revenues)}
        loading={loadingRevenues}
        color={CHART_COLORS.receita}
      />
      <RegistrationAreaChart
        id="tx-chart-despesas"
        title="Despesas"
        description={`Últimos ${RECENT_COUNT} cadastros por data de pagamento (área linear).`}
        data={recentExpenseRows(expenses)}
        loading={loadingExpenses}
        color={CHART_COLORS.despesa}
      />
      <RegistrationAreaChart
        id="tx-chart-despesas-cartao"
        title="Despesas no cartão"
        description={`Últimos ${RECENT_COUNT} cadastros por data de pagamento (área linear).`}
        data={recentCcExpenseRows(ccExpenses)}
        loading={loadingCc}
        color={CHART_COLORS.despesaCartao}
      />
    </div>
  );
}
