import { FREE_SHIPPING_FROM } from "./constants";

export interface ShippingQuote {
  region: string;
  price: number;
  days: string;
  free: boolean;
}

// Tabela simulada pelo primeiro dígito do CEP (regiões postais dos Correios).
const REGIONS: Record<string, [string, number, string]> = {
  "0": ["Grande São Paulo", 89, "3 a 5"],
  "1": ["Interior de SP", 109, "4 a 6"],
  "2": ["RJ / ES", 129, "5 a 7"],
  "3": ["Minas Gerais", 129, "5 a 7"],
  "4": ["BA / SE", 189, "7 a 10"],
  "5": ["Nordeste", 219, "8 a 12"],
  "6": ["Norte / CE / PI / MA", 259, "10 a 15"],
  "7": ["Centro-Oeste", 169, "6 a 9"],
  "8": ["PR / SC", 139, "5 a 8"],
  "9": ["Rio Grande do Sul", 159, "6 a 9"],
};

export const onlyDigits = (v: string) => v.replace(/\D/g, "");
export const maskCep = (v: string) => onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

export function quoteShipping(cep: string, subtotal: number): ShippingQuote | null {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const [region, price, days] = REGIONS[d[0]];
  const free = subtotal >= FREE_SHIPPING_FROM;
  return { region, price: free ? 0 : price, days: `${days} dias úteis`, free };
}

/** Preenchimento de endereço simulado (substituir por ViaCEP na integração real). */
export function fakeAddress(cep: string) {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const map: Record<string, [string, string]> = {
    "0": ["São Paulo", "SP"], "1": ["Campinas", "SP"], "2": ["Rio de Janeiro", "RJ"], "3": ["Belo Horizonte", "MG"],
    "4": ["Salvador", "BA"], "5": ["Recife", "PE"], "6": ["Fortaleza", "CE"], "7": ["Cuiabá", "MT"],
    "8": ["Curitiba", "PR"], "9": ["Porto Alegre", "RS"],
  };
  const [city, state] = map[d[0]];
  return { city, state };
}
