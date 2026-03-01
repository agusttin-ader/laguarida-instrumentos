"use client";

import React from "react";

export default function ProductLiveChatButton({
  productName = "",
  className = "",
  children = "Consultar en vivo",
  ariaLabel = "",
}) {
  function openLiveChat() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("hybrid-chat:open-live", {
        detail: { productName },
      })
    );
  }

  return (
    <button
      type="button"
      onClick={openLiveChat}
      aria-label={ariaLabel || `Abrir chat en vivo sobre ${productName || "este producto"}`}
      className={`no-custom-btn ${className}`}
    >
      {children}
    </button>
  );
}
