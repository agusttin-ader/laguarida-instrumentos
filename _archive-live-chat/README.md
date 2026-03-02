# Código archivado: Chat en vivo + Push admin

Este código **no se incluye en el build ni en el deploy**. Se dejó por si en el futuro se quiere volver a habilitar el chat en vivo.

## Cómo restaurar

1. **Rutas API**
   - Copiar `app-api-chat/` → `app/api/chat/` (contenido dentro de `chat/`: close-inactive, messages, session, sessions, _server.js).
   - Copiar `app-api-push-subscribe/` → `app/api/push-subscribe/`.
   - Copiar `app-api-push-vapid-public/` → `app/api/push-vapid-public/`.

2. **Lib**
   - Copiar `push.js` → `lib/push.js`.

3. **Componente admin**
   - Copiar `AdminLiveChatPanel.jsx` → `components/AdminLiveChatPanel.jsx`.
   - En `app/admin/page.jsx` volver a importar y renderizar `<AdminLiveChatPanel />`.

4. **Config**
   - En `lib/chat/hybridSupportConfig.js` poner `LIVE_CHAT_ENABLED = true`.
   - Restaurar la UI de modo "En vivo" en `components/HybridSupportChat.jsx` (ver historial de git o backup).
   - En `components/ProductStickyCTA.jsx` y producto: volver a usar `useLiveChat` y evento `hybrid-chat:open-live` si aplica.
   - Variables de entorno: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`; ejecutar `supabase/live-chat-schema.sql` y `supabase/push-subscriptions-schema.sql` si no están.

No borrar esta carpeta si querés conservar la opción de reactivar.
