import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { useDrawer } from "@/hooks/drawer/use";
import { useAccountTypeStore } from "../../system/account-type/store";
import { useBankStore } from "../../system/bank/store";
import { useFlagStore } from "../../system/flag/store";
import { useLogoStore } from "../../system/logo/store";
import { CreateCreditCardForm } from "./components/create-credit-card-form";
import { CreditCardsTable } from "./components/credit-cards-table";
import { useCreditCardStore } from "./store";

export function CreditCardsPlatformView() {
  const { open, close } = useDrawer();
  const fetchCreditCards = useCreditCardStore((s) => s.fetchCreditCards);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const fetchFlags = useFlagStore((s) => s.fetchFlags);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchCreditCards();
    void fetchBanks();
    void fetchAccountTypes();
    void fetchFlags();
    void fetchLogos();
  }, [fetchCreditCards, fetchBanks, fetchAccountTypes, fetchFlags, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Cartões de crédito"
        description="Bandeira, banco, tipo de conta, fechamento e vencimento da fatura."
        onRegister={() =>
          open({
            id: "create-credit-card",
            title: "Cadastrar cartão de crédito",
            content: <CreateCreditCardForm onSuccess={close} />,
          })
        }
      />
      <CreditCardsTable />
    </div>
  );
}
