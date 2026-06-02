# Explicación del Funcionamiento del Modo Oscuro

Este documento detalla técnicamente cómo funciona la implementación del **Modo Oscuro (Dark Mode)** en el proyecto, explicando la integración entre el botón (`#darkBtn`), el script de control (`theme.js`) y el framework CSS (**Tailwind CSS**).

---

## 🛠️ Arquitectura General

El sistema de modo oscuro utiliza una estrategia híbrida basada en **clases de CSS** y **almacenamiento local (LocalStorage)**, integrada con **Tailwind CSS**. Consta de tres partes principales:

1. **Configuración de Tailwind CSS**: Indica al framework que aplique estilos oscuros cuando la clase `.dark` esté presente en la etiqueta raíz `<html>`.
2. **Ejecución Inmediata (`theme.js` en el `<head>`)**: Lee las preferencias del usuario o del sistema y aplica la clase `.dark` antes de que se dibuje la interfaz (evitando el parpadeo blanco).
3. **Interactividad (`darkBtn` y Eventos)**: Permite alternar manualmente el tema haciendo clic en un botón, guardando la selección y cambiando los iconos correspondientes de FontAwesome.

---

## 📊 Paso a Paso del Flujo de Ejecución

### 1. Inicialización y Prevención de Parpadeo (FOUC)
Cuando un usuario entra a la página, lo primero que se ejecuta en el `<head>` es el script `scripts/theme.js` de forma auto-invocada (IIFE):

```javascript
(function() {
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // ...
})();
```

* **¿Cómo decide qué tema aplicar?**
  1. Busca en `localStorage` si hay un tema guardado con la clave `'color-theme'`.
  2. Si no hay nada guardado (`!savedTheme`), consulta las preferencias del sistema operativo o navegador mediante `window.matchMedia('(prefers-color-scheme: dark)')`.
  3. Si la preferencia guardada es `'dark'` o si el sistema del usuario está en modo oscuro por defecto, añade la clase `dark` al elemento raíz `<html>` (`document.documentElement`). De lo contrario, la remueve.
* **¿Por qué se hace en el `<head>`?**
  Al ejecutarse aquí, el navegador procesa la clase `dark` antes de empezar a renderizar visualmente el `<body>`. Esto previene el **FOUC** (Flash of Unstyled Content), que es ese molesto destello blanco que ocurre en otras webs antes de que cargue el tema oscuro.

---

### 2. Configuración en Tailwind CSS
En la cabecera de las páginas HTML se encuentra la configuración personalizada de Tailwind:
```html
<script>
  tailwind.config = {
    darkMode: 'class'
  }
</script>
```
Al definir `darkMode: 'class'`, le indicamos a Tailwind que active los estilos prefijados con `dark:` (por ejemplo, `dark:bg-gray-900`, `dark:text-gray-200`) basándose únicamente en la presencia de la clase `dark` en el elemento `<html>`.

---

### 3. Sincronización del Icono del Botón
El botón que interactúa con el usuario está definido en el NAV de cada página HTML:
```html
<button id="darkBtn" class="text-xl size-5 fa-fw flex justify-center items-center hover:text-yellow-200 transition active:rotate-45">
  <i class="fa-solid fa-moon"></i>
</button>
```
Para asegurar que el icono coincida con el modo activo al cargar la página (mostrar un sol ☀️ en modo oscuro o una luna 🌙 en modo claro), `theme.js` tiene la función `updateThemeIcon`:

```javascript
function updateThemeIcon() {
    const darkBtn = document.getElementById("darkBtn");
    if (!darkBtn) return;
    const icon = darkBtn.querySelector('i');
    if (!icon) return;

    if (document.documentElement.classList.contains('dark')) {
        icon.classList.replace('fa-moon', 'fa-sun'); // Si está oscuro, muestra el sol
    } else {
        icon.classList.replace('fa-sun', 'fa-moon'); // Si está claro, muestra la luna
    }
}
```

---

### 4. Interactividad al Hacer Clic (Toggle)
Una vez que el DOM está completamente cargado (`DOMContentLoaded`), el script añade un escuchador de eventos (`addEventListener`) al botón:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(); // Ajusta el icono inicialmente
    
    const darkBtn = document.getElementById("darkBtn");
    if (darkBtn) {
        darkBtn.addEventListener("click", () => {
            // 1. Alterna la clase 'dark' en el elemento html
            document.documentElement.classList.toggle("dark");
            
            // 2. Comprueba el estado resultante
            const isDark = document.documentElement.classList.contains('dark');
            
            // 3. Guarda la nueva preferencia en LocalStorage
            localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
            
            // 4. Actualiza visualmente el icono del botón
            updateThemeIcon();
        });
    }
});
```

Cuando el usuario hace clic:
1. Se añade/quita la clase `dark` de `<html>`.
2. Se almacena el nuevo estado en el `localStorage` (así la preferencia persistirá la próxima vez que el usuario visite cualquier página del sitio).
3. Se actualiza el icono (cambia la luna por el sol, o viceversa).

---

## 💎 Ventajas de este Diseño
* **Persistencia**: La elección del usuario se recuerda indefinidamente gracias al uso de `localStorage`.
* **Cero Parpadeos (FOUC-free)**: Carga y evalúa el tema en el `<head>` antes de construir la página.
* **Integración con Tailwind**: Permite añadir estilos específicos para modo oscuro de forma extremadamente rápida añadiendo el prefijo `dark:` en las clases HTML.
* **Soporte Multipage**: Al buscar el botón `#darkBtn` de forma segura (`if (darkBtn)`), el script `theme.js` se puede importar de forma universal en todas las páginas sin provocar errores de JavaScript si alguna de ellas no llegara a tener el botón.
