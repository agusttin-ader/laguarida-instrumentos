export const WHATSAPP_NUMBER = "5491154661749";

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
      "Aceptamos distintos medios de pago. Si queres, te pasamos las opciones vigentes segun el producto que te interesa.",
  },
  {
    id: "stock",
    label: "Disponibilidad",
    answer:
      "La disponibilidad puede variar por modelo. Escribinos por WhatsApp y te confirmamos en el momento.",
  },
  {
    id: "trade",
    label: "Tomamos permutas",
    answer:
      "Si, evaluamos permutas. Compartinos fotos, modelo y estado del instrumento por WhatsApp y te orientamos.",
  },
];
