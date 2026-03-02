# Mejoras premium y pro — Admin y Web

Ideas concretas para dejar la app de admin y la web super óptimas (diseño, UX y funcionalidad).

---

## Corregido en este commit

- **Manifest admin**: `start_url` apuntaba a `/admin/loguin`; ahora usa `/admin/login` en ambos manifests.

---

## Admin (app / panel)

### Diseño y sensación premium

1. **Pull-to-refresh en la lista de productos**  
   En móvil, arrastrar hacia abajo para recargar productos sin tocar un botón. Muy natural en apps nativas.

2. **Estados vacíos con ilustración o copy**  
   Cuando no hay productos o no hay actividad reciente, un mensaje claro + (opcional) un ícono o ilustración mínima en lugar de solo texto.

3. **Feedback háptico (vibración) en acciones clave**  
   En dispositivos que lo soporten, vibración suave al crear/editar/eliminar producto o al “Cerrar sesión”. `navigator.vibrate(10)` donde tenga sentido.

4. **Skeleton en el panel**  
   Mientras carga la sesión o la lista de productos, mostrar skeletons en lugar de “Cargando…” para una transición más pro.

### Funcionalidad

5. **Confirmación antes de “Cerrar sesión”**  
   Un pequeño modal o `confirm()` para evitar cierres accidentales, sobre todo en la app instalada.

6. **Atajos o gestos**  
   Por ejemplo: en la lista de productos, swipe (o largo press) para “Editar” / “Eliminar” en lugar de solo botones (opcional, si querés priorizar móvil).

7. **Indicador de conexión**  
   En la barra de admin, un indicador sutil (online / sin conexión) para que se note si los cambios se pueden guardar.

---

## Web (tienda pública)

### Diseño y sensación premium

8. **Transiciones de página**  
   Transición suave (fade o slide corto) al navegar entre Home → producto → sobre nosotros. Next.js App Router permite hacerlo con layout/wrappers o con `view-transitions` cuando esté estable.

9. **Micro-interacciones en cards**  
   Hover suave (scale 1.02, sombra) en cards de producto en desktop; en móvil, feedback al tocar (opacity o scale breve) para que se sienta más “premium”.

10. **Sticky CTA con mejor feedback**  
    El botón de WhatsApp/CTA fijo: al hacer click, un breve “Copiado” o “Abriendo WhatsApp…” para que no quede la duda de si pasó algo.

### Performance y SEO

11. **Lazy de secciones below-the-fold**  
    Asegurar que “Sobre nosotros” y bloques pesados debajo del hero/carrusel carguen con `loading="lazy"` o componentes dinámicos para mejorar LCP y tiempo a interactivo.

12. **Structured data (JSON-LD)**  
    En la página de producto: `Product` schema con nombre, precio, imagen, descripción para rich results en Google (precio, disponibilidad, etc.).

### Funcionalidad

13. **Compartir producto**  
    Botón “Compartir” (Web Share API en móvil, fallback a copiar link) en la ficha del producto para que sea fácil mandar por WhatsApp o redes.

14. **Favoritos / lista de interés**  
    Guardar slugs de productos en `localStorage` (o cuenta si más adelante hay login de cliente) y mostrarlos en una sección “Tu selección” o en el ícono del BottomNav, para aumentar engagement.

---

## Ambas (admin y web)

15. **PWA: íconos adaptativos**  
    Iconos 192px y 512px bien definidos (y si es posible máscara/adaptive para Android) para que al instalar se vea nativo en todas las pantallas.

16. **Offline básico**  
    Página offline simple (“No hay conexión — Revisá tu red”) cuando el Service Worker detecte que no hay conexión, con botón “Reintentar”.

17. **Notificaciones de éxito/error consistentes**  
    Toasts o banners breves y con el mismo estilo en admin (crear/editar/eliminar producto, login) y en web (ej. “Link copiado”, “Error al cargar”) para una experiencia coherente.

---

## Prioridad sugerida

- **Rápido y alto impacto**: 5 (confirmar cerrar sesión), 10 (feedback CTA), 12 (JSON-LD producto), 13 (compartir producto).  
- **Premium feel**: 1 (pull-to-refresh admin), 4 (skeletons admin), 8 (transiciones), 9 (micro-interacciones cards).  
- **Solidez**: 16 (offline), 17 (toasts), 3 (haptics opcional).

Si querés, en el próximo paso podemos bajar cualquiera de estos ítems a tareas concretas en el repo (por ejemplo: “Implementar confirmación de Cerrar sesión en ClientAuth” o “Añadir JSON-LD en guitars/[slug]”).
