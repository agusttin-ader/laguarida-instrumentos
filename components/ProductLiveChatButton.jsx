"use client";

import React from "react";
import {
  WHATSAPP_NUMBER,
  productWhatsAppMessage,
} from "../lib/chat/hybridSupportConfig";

export default function ProductLiveChatButton({
  productName = "",
  className = "",
  children = "Consultar por WhatsApp",
  ariaLabel = "",
}) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    productWhatsAppMessage(productName)
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel || `Consultar por WhatsApp sobre ${productName || "este producto"}`}
      className={`no-custom-btn ${className}`}
    >
      {children}
    </a>
  );
}
