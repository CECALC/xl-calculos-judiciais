import { tipoString } from '@cecalc/utils/dist/utils'

export function obterOuCriarPlanilha(nome?: string): Promise<Excel.Worksheet> {
  return new Promise((resolve, reject) => {
    try {
      Excel.run(async context => {
        try {
          const planilhas = context.workbook.worksheets

          if (tipoString(nome)) {
            planilhas.load('items/name')

            await context.sync()

            const planilha = planilhas.items.find(planilha => planilha.name === nome)

            if (planilha) {
              planilha.load()

              await context.sync()

              return resolve(planilha)
            }
          }

          const planilha = planilhas.add(nome)
          planilha.load()

          await context.sync()
          return resolve(planilha)
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}
