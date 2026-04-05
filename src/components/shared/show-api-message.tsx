import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  formatApiErrorBodyMessage,
  isApiErrorEnvelope,
  isApiSuccess,
  isApiWarningEnvelope,
} from "@/lib/api-envelope";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

export type ShowApiMessageOptions = {
  /** Toast de sucesso quando `status === "success"` */
  successMessage?: string;
  /** Toast de aviso quando `status === "warning"` */
  warningMessage?: string;
  /** Duração dos toasts em segundos */
  duration?: number;
};

type ErrorToastContentProps = {
  message: string;
  requestCode?: string;
  emphasis?: boolean;
};

function ErrorToastContent({ message, requestCode, emphasis }: ErrorToastContentProps) {
  const code = requestCode?.trim() || "não informado";
  const showCopy = Boolean(requestCode?.trim());

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span
        className={
          emphasis
            ? "text-lg font-medium text-destructive"
            : "text-foreground"
        }
      >
        {message}
      </span>
      <div className="flex flex-col gap-1 text-muted-foreground">
        <span>
          Se precisar de ajuda, compartilhe o código abaixo com nosso suporte:
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
            {code}
          </code>
          {showCopy ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0"
              aria-label="Copiar código de suporte"
              onClick={() => {
                void copyToClipboard(requestCode!.trim()).then((ok) => {
                  if (ok) toast.success("Código copiado.");
                });
              }}
            >
              <CopyIcon className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Exibe toast conforme o envelope da API (sucesso, aviso ou erro).
 * Sucesso: mensagem personalizável com `successMessage`.
 * Erro: usa `body.message` e opcionalmente `request_code` (código > 300 com ênfase visual).
 */
export function showApiMessage(payload: unknown, options?: ShowApiMessageOptions): void {
  const durationMs = (options?.duration ?? 5) * 1000;

  if (isApiSuccess(payload)) {
    toast.success(options?.successMessage ?? "Operação realizada com sucesso.", {
      duration: durationMs,
    });
    return;
  }

  if (isApiWarningEnvelope(payload)) {
    const fallback =
      options?.warningMessage ??
      "Algo deu errado durante a operação. Tente novamente mais tarde, por favor.";
    const fromBody = payload.body?.message
      ? formatApiErrorBodyMessage(payload.body.message)
      : null;
    toast.warning(fromBody ?? fallback, { duration: durationMs });
    return;
  }

  if (isApiErrorEnvelope(payload) && String(payload.status).toLowerCase() === "error") {
    const standardMessage = formatApiErrorBodyMessage(payload.body?.message);
    const requestCode = payload.request_code;

    if (payload.code > 300) {
      toast.error("Atenção", {
        description: (
          <ErrorToastContent
            message={standardMessage}
            requestCode={requestCode}
            emphasis
          />
        ),
        duration: durationMs,
      });
      return;
    }

    toast.error("Atenção", {
      description: (
        <ErrorToastContent
          message={standardMessage}
          requestCode={requestCode}
        />
      ),
      duration: durationMs,
    });
    return;
  }

  if (isApiErrorEnvelope(payload)) {
    toast.error(formatApiErrorBodyMessage(payload.body?.message), {
      duration: durationMs,
    });
    return;
  }

  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const m = (payload as { message?: unknown }).message;
    const text = typeof m === "string" ? m : formatApiErrorBodyMessage(m);
    toast.error(text || "Erro na operação.", { duration: durationMs });
    return;
  }

  toast.error("Resposta inesperada do servidor.", { duration: durationMs });
}

export default showApiMessage;
