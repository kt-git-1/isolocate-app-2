import { IsotopeInputsForm } from "@/features/analysisRuns/domain/types";

const numberInputProps = {
  type: "text",
  inputMode: "decimal" as const,
  pattern: "[+-]?[0-9]*[.,]?[0-9]*",
  className:
    "w-full rounded border border-slate-900/80 px-3 py-2 text-sm",
};

export function IsotopeInputsCard({
  value,
  onChange,
}: {
  value: IsotopeInputsForm;
  onChange: (next: IsotopeInputsForm) => void;
}) {
  return (
    <div className="rounded-md border bg-white p-5">
      <section>
        <h2 className="text-base font-semibold text-slate-700">コラーゲン</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
          <div className="pt-1 text-sm font-medium text-slate-600">入力値</div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">Col13C</span>
              <input
                {...numberInputProps}
                value={value.collagen.col13c}
                onChange={(e) =>
                  onChange({
                    ...value,
                    collagen: { ...value.collagen, col13c: e.target.value },
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">Col15N</span>
              <input
                {...numberInputProps}
                value={value.collagen.col15n}
                onChange={(e) =>
                  onChange({
                    ...value,
                    collagen: { ...value.collagen, col15n: e.target.value },
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">Col34S</span>
              <input
                {...numberInputProps}
                value={value.collagen.col34s}
                onChange={(e) =>
                  onChange({
                    ...value,
                    collagen: { ...value.collagen, col34s: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-slate-700">アパタイト</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
          <div className="pt-1 text-sm font-medium text-slate-600">入力値</div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">A13C</span>
              <input
                {...numberInputProps}
                value={value.apatite.a13c}
                onChange={(e) =>
                  onChange({
                    ...value,
                    apatite: { ...value.apatite, a13c: e.target.value },
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">A18O</span>
              <input
                {...numberInputProps}
                value={value.apatite.a18o}
                onChange={(e) =>
                  onChange({
                    ...value,
                    apatite: { ...value.apatite, a18o: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-slate-700">エナメル</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
          <div className="pt-1 text-sm font-medium text-slate-600">入力値</div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">E13C</span>
              <input
                {...numberInputProps}
                value={value.enamel.e13c}
                onChange={(e) =>
                  onChange({
                    ...value,
                    enamel: { ...value.enamel, e13c: e.target.value },
                  })
                }
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-sm font-medium text-slate-700">E18O</span>
              <input
                {...numberInputProps}
                value={value.enamel.e18o}
                onChange={(e) =>
                  onChange({
                    ...value,
                    enamel: { ...value.enamel, e18o: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
