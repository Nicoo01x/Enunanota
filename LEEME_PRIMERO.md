# 👋 ¡Bienvenido a "En una nota"!

Esta es una aplicación de juego musical en tiempo real, lista para usar en GitHub Pages.

## 🎯 ¿Qué es esto?

Un juego donde:
- 1 persona es el **anfitrión** (controla el juego)
- Los demás son **jugadores** (compiten adivinando canciones)
- El anfitrión reproduce música y valida respuestas
- Los jugadores presionan un botón cuando reconocen la canción
- Sistema de puntos: +1 correcto, -1 incorrecto

## ✨ LO MÁS IMPORTANTE

**La app funciona inmediatamente sin configurar nada.**

Usa localStorage como backend simulado. Solo funciona bien en el mismo navegador (para pruebas).

Para juego **multi-dispositivo real** (varios teléfonos), necesitas configurar Firebase (5 minutos, gratis).

## 🚀 ¿Cómo empiezo?

Elige tu camino:

### Opción A: Quiero probarla en mi computadora primero

→ Lee `QUICKSTART.md`

**Resumen**:
```bash
npm install
npm run dev
```

Abre http://localhost:5173

### Opción B: Quiero subirla a internet directamente

→ Lee `DEPLOY_SIN_NODE.md`

**Resumen**:
1. Sube a GitHub
2. Activa GitHub Actions o usa Netlify/Vercel
3. Listo, tendrás una URL pública

### Opción C: Quiero configurar Firebase para multi-dispositivo

→ Lee `SETUP_GUIDE.md`

**Resumen**:
1. Crea proyecto en Firebase Console
2. Activa Firestore + Auth Anonymous
3. Edita `src/firebase/config.js`
4. Cambia `USE_MOCK_SERVICE = false`
5. Despliega

## 📚 Documentación completa

- **QUICKSTART.md** - Ejecutar localmente con Node.js
- **DEPLOY_SIN_NODE.md** - Desplegar sin instalar Node
- **README.md** - Documentación completa del proyecto
- **SETUP_GUIDE.md** - Configurar Firebase paso a paso

## 🔧 Configuración actual

Por defecto, la app está en **MODO MOCK**:
- Usa localStorage (almacenamiento del navegador)
- No requiere configuración
- Perfecto para pruebas
- ⚠️ Solo funciona en el mismo navegador

Para cambiar a **MODO FIREBASE** (multi-dispositivo):
- Edita `src/firebase/config.js`
- Cambia `USE_MOCK_SERVICE = true` → `false`
- Configura tu proyecto de Firebase

## 📱 Tecnologías

- React 18
- Tailwind CSS
- React Router (HashRouter)
- Firebase (opcional)
- Vite
- GitHub Pages compatible

## 🎮 Cómo se juega

1. **Anfitrión** crea partida → obtiene código (ej: ABC123)
2. **Jugadores** se unen con ese código desde sus teléfonos
3. **Anfitrión** inicia ronda y pone música (Spotify, YouTube, etc.)
4. **Jugadores** presionan "¡Yo la sé!" cuando reconocen la canción
5. **Anfitrión** dice si la respuesta fue correcta o incorrecta
6. Repetir hasta terminar la partida

## ❓ FAQ

### ¿Necesito pagar algo?

No. Todo es gratis:
- GitHub Pages: gratis
- Firebase (plan gratuito): 50,000 lecturas/día gratis
- Netlify/Vercel: planes gratuitos disponibles

### ¿Funciona en celulares?

Sí, 100% responsive. Diseñado especialmente para que los jugadores usen sus teléfonos.

### ¿Necesito saber programar?

Para usarla: NO
Para modificarla: Conocimientos básicos de React ayudan

### ¿Puedo personalizar los colores/textos?

Sí, todo está en español y usa Tailwind CSS. Puedes editar:
- Colores: `tailwind.config.js`
- Textos: Archivos en `src/pages/`
- Componentes: `src/components/`

### ¿Los jugadores necesitan crear cuenta?

No. La app usa autenticación anónima. Cada dispositivo recibe un ID automático.

### ¿Se guardan las partidas?

En modo mock: NO (se borran al cerrar el navegador)
Con Firebase: SÍ (persistencia real)

## 🐛 Problemas comunes

**"npm: command not found"**
→ Necesitas instalar Node.js primero

**"Los jugadores no se ven entre dispositivos"**
→ Estás en modo mock. Activa Firebase para multi-dispositivo

**"Error 404 en GitHub Pages"**
→ Verifica `homepage` en `package.json` y que uses HashRouter

## 🆘 ¿Necesitas ayuda?

1. Lee la documentación correspondiente (ver arriba)
2. Revisa la consola del navegador (F12) para errores
3. Verifica los archivos de configuración

## 📄 Licencia

MIT - Úsala libremente

---

**¡Empieza ahora!** 🎵

Elige tu opción arriba y sigue las instrucciones. En menos de 10 minutos tendrás tu juego funcionando.
