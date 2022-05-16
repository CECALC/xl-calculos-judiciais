export const obterTextoCompleto = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      Word.run(async context => {
        const doc = context.document
        const corpo = doc.body
        context.load(corpo)
        await context.sync() 
        resolve(corpo.text)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export const localizarTrechosComPadrao = async (padrao: RegExp): Promise<string[]> => {
  const texto = await obterTextoCompleto()
  const match = texto.match(padrao)
  return match ? match : []
}

export const substituirTrechos = async (trecho: string, substituicao: string, opcoes?: Partial<Word.SearchOptions>): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      Word.run(async context => {
        const doc = context.document
        const resultado = doc.body.search(trecho, opcoes)

        resultado.load()
        await context.sync() 

        // necessário percorrer as instâncias na ordem inversa
        // para não deslocar os trechos subsequentes que estejam
        // na mesma linha
        resultado.items.reverse().forEach(item => {
          item.insertText(substituicao, Word.InsertLocation.replace)
        })
        await context.sync() 

        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })
}