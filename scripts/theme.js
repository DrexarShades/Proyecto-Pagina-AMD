(function() {
    // Aplicar el tema inmediatamente para evitar el parpadeo (FOUC)
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Función para actualizar el icono del botón
    function updateThemeIcon() {
        const darkBtn = document.getElementById("darkBtn");
        if (!darkBtn) return;
        const icon = darkBtn.querySelector('i');
        if (!icon) return;

        if (document.documentElement.classList.contains('dark')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Configurar el evento de toggle cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        updateThemeIcon();
        
        const darkBtn = document.getElementById("darkBtn");
        if (darkBtn) {
            darkBtn.addEventListener("click", () => {
                document.documentElement.classList.toggle("dark");
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
                updateThemeIcon();
            });
        }
    });
})();
