export const WHATSAPP_NUMBER = "5491154661749";
export const LIVE_CHAT_ENABLED = false;

export const GENERAL_WHATSAPP_MESSAGE =
  "Hola, me interesa La Guarida, me podrias dar informacion?";

export function productWhatsAppMessage(productName = "") {
  if (!productName) return GENERAL_WHATSAPP_MESSAGE;
  return `Hola, me interesa ${productName}, me podrias dar mas informacion ?`;
}

export const HYBRID_CHAT_OPTIONS = [
  {
    id: "shipping",
    label: "Envios",
    answer:
      "Tenemos envios a todo el pais. Coordinamos costos y tiempos segun destino para darte una opcion segura.",
  },
  {
    id: "payments",
    label: "Medios de pago",
    answer:
      "Aceptamos USD, USDT o pesos argentinos al cambio del día en dólar blue.",
  },
  {
    id: "stock",
    label: "Disponibilidad",
    answer:
      "Todos los productos que están en el catálogo visibles están disponibles.",
  },
  {
    id: "trade",
    label: "Tomamos permutas",
    answer:
      "Si, evaluamos permutas. Compartinos fotos, modelo y estado del instrumento por WhatsApp y te orientamos.",
  },
];
