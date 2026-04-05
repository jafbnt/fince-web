import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { CategoriesTable } from "./components/categories-table";
import { CreateCategoryForm } from "./components/create-category-form";
import { useDrawer } from "@/hooks/drawer/use";
import { useCategoryStore } from "./store";
import { useColorStore } from "../../system/color/store";
import { useLogoStore } from "../../system/logo/store";

export function CategoryPlatformView() {
  const { open, close } = useDrawer();
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const fetchColors = useColorStore((s) => s.fetchColors);

  useEffect(() => {
    void fetchCategories();
    void fetchLogos();
    void fetchColors();
  }, [fetchCategories, fetchLogos, fetchColors]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Categorias"
        description="Categorias com logo (miniatura) e cor do sistema."
        onRegister={() =>
          open({
            id: "create-category",
            title: "Cadastrar categoria",
            content: <CreateCategoryForm onSuccess={close} />,
          })
        }
      />
      <CategoriesTable />
    </div>
  );
}
