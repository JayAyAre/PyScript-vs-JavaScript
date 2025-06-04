# Comparativa de Rendimiento entre JavaScript y PyScript en el Navegador

Este proyecto forma parte de mi Trabajo de Fin de Grado (TFG), cuyo objetivo principal es comparar de forma rigurosa el rendimiento de **JavaScript** y **Python** ejecutado en el navegador. Para ello, se utiliza **PyScript** como entorno de ejecución Python basado en WebAssembly.

A través de diversos benchmarks interactivos, se analizan y comparan ambos lenguajes en distintos escenarios reales de cómputo, incluyendo operaciones matemáticas intensivas, manipulación de datos, algoritmos de machine learning, y verificación criptográfica.

## 📌 Objetivo del proyecto

Este TFG tiene como objetivos:

- Evaluar de forma sistemática el rendimiento de **JavaScript** (nativo del navegador) frente a **Python** ejecutado mediante **PyScript/Pyodide**.
- Diseñar una interfaz web interactiva con Astro para visualizar y comparar resultados de pruebas computacionales.
- Entender las implicaciones prácticas del uso de Python en navegador mediante WebAssembly (coste de arranque, uso de memoria, compatibilidad de librerías).
- Aprender y consolidar conocimientos en tecnologías web modernas: Astro, Web Workers, librerías de ML en JS y Python, WebSocket, Tailwind CSS, etc.

## 🧪 Ámbitos de análisis

Los benchmarks se agrupan en distintas categorías según el tipo de carga computacional:

- 🔢 **Cálculos matemáticos intensivos**: Ejecucion de algoritmos como multiplicación de matrices, calculo de digitos de pi...
- 🧠 **Procesamiento de grandes volúmenes de datos**: Ejecución de operaciones sobre muchos datos.
- 📊 **Carga de graficos complejos**: Impacto del renderizado de graficos de puntos de dispersion y series temporales.
- 📡 **Manejo de peticiones concurrentes**: pruebas que utilizan WebSocket o APIs locales para simular cargas distribuidas.
- 🔐 **Cálculo criptográfico y verificación de integridad**: cifrado AES, autenticación de datos.
- 🧬 **Reconocimiento de patrones**: clasificación de imágenes (Iris, Digits).

Todas las pruebas están diseñadas para ejecutarse **directamente en el navegador**, sin necesidad de backend, excepto en pruebas específicas donde se compara el rendimiento con entornos servidor.

## 🧰 Tecnologías empleadas

### Frontend

- [Astro](https://astro.build/) — Framework para UI estática moderna
- [Tailwind CSS](https://tailwindcss.com/) — Estilos responsivos y reutilizables
- Componentes reactivos (HTML, JS, PyScript)

### Backend (solo para entorno local)

- Servidor de pruebas en Python con `Flask`, `websockets`, `cryptography`
- Servidor en Node.js para pruebas en paralelo

### Entorno Python (PyScript)

- [PyScript](https://pyscript.net/)
- Pyodide (Python compilado a WebAssembly)
- `numpy`, `scikit-learn`, `pickle`, `crypto`...
- Web Workers en Python

### Entorno JavaScript

- Librerías científicas: `ml-knn`, `ml-random-forest`, `math.js`...
- Web Workers para paralelismo
- `performance.now()` y otras herramientas nativas para medir tiempos

## 🚀 Ejecución del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/JayAyAre/PyScript-vs-JavaScript.git
cd PyScript-vs-JavaScript
```

### 2. Ejecutar el repositorio

#### a) Si ejecutas el **LOCAL-TFG**

1. Instala las dependencias de Python:

```bash
cd LOCAL-TFG
pip install -r requirements.txt
```

2. Instala las dependencias de Node.js:

```bash
npm install
cd ASTRO-TFG
npm install
```

3. Escoge el ámbito a testear, la prueba y la versión si está disponible.

4. Ejecuta el script para iniciar los servidores:

```bash
python ./start_servers.py
```

5. Accede desde el navegador a:

```
http://localhost:8000
```

o bien

```
https://localhost:8000
```

dependiendo de la prueba.

#### b) Si ejecutas el **ASTRO-TFG**

1. Instala las dependencias de Node.js:

```bash
npm install
```

2. Ejecuta el entorno de desarrollo:

```bash
npm run dev
```

3. Accede desde el navegador a:

```
http://localhost:4321
```
