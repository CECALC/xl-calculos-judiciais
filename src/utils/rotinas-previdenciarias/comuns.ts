import { converterDataEmString, FORMATO_DATA } from "@cecalc/utils";

export const hoje = converterDataEmString(new Date(), FORMATO_DATA.LOCALIDADE_ABREVIADO)
