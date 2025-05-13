export const tests = [
    {
        title: '1. Cálculos matemáticos intensivos',
        link: '4.1-calculos-matematicos',
        description:
            'Estas pruebas medirán la eficiencia de cada tecnología al ejecutar operaciones matemáticas de alto costo computacional, como transformaciones numéricas, factorizaciones, cálculos algebraicos, entre otros. Con el objetivo principal de evaluar el rendimiento en operaciones típicas que se usarían en el ámbito científico del desarrollo web.',
        warning:
            'En estos escenarios también se decidió evaluar el rendimiento de las pruebas teniendo en cuenta que se ejecutan en el hilo principal. Es decir, no habrá un worker que ejecute las pruebas para que se pueda interactuar con la página web. Por ello, al ejecutar las pruebas, se congelará el hilo principal hasta que finalice la prueba. Por otro lado, al ser PyScript, habrá un tiempo de carga de la página web que no se puede evitar, por lo que es posible que la prueba tarde un poco antes de estar disponible.',
        tests: [
            {
                title: 'Multiplicación de matrices',
                description:
                    'El propósito de esta prueba es principalmente evaluar y comparar el rendimiento del manejo de matrices, tanto en su manipulación como en su operación, de tal manera que se observe cuán eficiente es el uso de las estructuras nativas de ambas herramientas y de aquellas incluidas en librerías externas.',
                versions: [
                    {
                        title: 'Estructuras de Datos Nativas',
                        description:
                            'Esta versión usará estructuras de datos nativas sin usar librerías externas. Consistirá en realizar la operación de multiplicación de matrices mediante bucles anidados. La matriz a operar será de 300×300 y con valores entre 0 y 1.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: true,
                        useBackend: true,
                        inputs: null,
                        graph: false,
                    },
                    {
                        title: 'Estructuras de Datos Optimizadas',
                        description:
                            'Esta versión usará estructuras de datos optimizadas que pueden ser de librerías externas, tanto en Python con NumPy como en JS usando TypedArrays. Consistirá en realizar la operación de multiplicación de matrices mediante funciones de librerías. La matriz puede ser de 500×500, 1000×1000 o 2000×2000 y con valores entre 0 y 1.',
                        jsLibs: [
                            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.5.2'
                        ],
                        pyConfig: 'pyscript.toml',
                        useNode: true,
                        useBackend: true,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
            {
                title: 'Evaluación del rendimiento en la detección de números primos',
                description:
                    'El propósito de esta prueba es evaluar y comparar el rendimiento de algoritmos convencionales y optimizados en JavaScript y Python para la detección de números primos. Con esta prueba podremos observar cuán eficiente es el uso de diferentes algoritmos matemáticos y cuál es la diferencia entre ambos.',
                versions: [
                    {
                        title: 'Algoritmos Convencionales (Estructuras Nativas)',
                        description:
                            'Esta versión usará estructuras de datos nativas y comprobará divisibilidad básica hasta la raíz cuadrada del número. El rango máximo será hasta 10⁶.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: true,
                        useBackend: true,
                        inputs: null,
                        graph: false,
                    },
                    {
                        title: 'Algoritmos Optimizados con Librerías Especializadas',
                        description:
                            'Esta versión empleará librerías optimizadas para la detección de números, usando el algoritmo de la criba de Eratóstenes. El rango máximo será hasta 10⁴ y se ejecutará 1000 veces para obtener una medición estadística.',
                        jsLibs: null,
                        pyConfig: 'pyscript.toml',
                        useNode: true,
                        useBackend: true,
                        inputs: ["num-executions", "parallel-workers"],
                        graph: false,
                    },
                ],
            },
            {
                title: 'Cálculo de dígitos de π',
                description:
                    'El objetivo de esta prueba es evaluar el rendimiento de Python y JavaScript en el cálculo de dígitos de π, tanto sin usar como usando precisión arbitraria. Se busca medir cómo afecta el uso de estructuras de datos nativas y optimizadas a la velocidad de cálculo y al consumo de memoria. Al indicar “precisión arbitraria” se quiere señalar que el algoritmo calcula dígitos que no se pueden representar exactamente con un número de bits, como un float o double.',
                versions: [
                    {
                        title: 'BBP (Estructuras nativas) sin precisión arbitraria',
                        description:
                            'Se calcularán N=10³ dígitos de π con la implementación de la fórmula BBP usando estructuras nativas. Esta simulación se ejecutará 1000 veces para obtener una medición estadística.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: true,
                        useBackend: true,
                        inputs: null,
                        graph: false,
                    },
                    {
                        title: 'Gauss–Legendre (Estructuras optimizadas) con precisión arbitraria',
                        description:
                            'Se calcularán N=10⁴ dígitos de π con la implementación de Gauss–Legendre usando estructuras optimizadas. Esta simulación se ejecutará 10 veces para obtener una medición estadística mínima.',
                        jsLibs: ["https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.7.0/math.js"],
                        pyConfig: 'pyscript.toml',
                        useNode: true,
                        useBackend: true,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
        ],
    },
    {
        title: '2. Procesamiento de grandes volúmenes de datos',
        link: '4.2-procesamiento-datos',
        description:
            'Estas pruebas medirán la capacidad de cada tecnologia para manejar y procesar grandes cantidades de datos. Se analizarán diversos escenarios que involucren manipulación de estructuras de datos a gran escala, carga masiva de información y ejecución de algoritmos de procesamiento intensivo.',
        warning:
            'En estos escenarios también se decidió evaluar el rendimiento de las pruebas teniendo en cuenta que se ejecutan en el hilo principal. Es decir, no habrá un worker que ejecute las pruebas para que se pueda interactuar con la página web. Por ello, al ejecutar las pruebas, se congelará el hilo principal hasta que finalice la prueba. Por otro lado, al ser PyScript, habrá un tiempo de carga de la página web que no se puede evitar, por lo que es posible que la prueba tarde un poco antes de estar disponible.',
        tests: [
            {
                title: 'Realizar operaciones de carga, transformación y procesamiento sobre un gran conjunto de datos.',
                description:
                    'El propósito de esta prueba es principalmente evaluar y comparar el rendimiento del manejo de matrices, tanto manipulación como de operación, de tal manera observar que tan eficiente es el uso de las estructuras nativas de ambas herramientas y de aquellas incluidas en librerías externas. Las operaciones a medir seran; crear, transformar, ordenar, buscar, filtrar y eliminar.',
                versions: [
                    {
                        title: 'Estructuras de Datos Nativas',
                        description:
                            'Esta version empleara arrays y listas nativas correspondientes a JavaScript y a PyScript. Esta version se encargara de crear y manipular un conjunto de 10 millones de numeros aleatorios entre 1 y 1000. Al ser la primera version, se usaran algoritmos no optimizados, por ejemplo; En la busqueda de un dato sobre el conjunto, se empleara un bucle donde se itera sobre cada elemento hasta encontrarlo.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                    {
                        title: 'Estructuras de Datos Optimizadas con concurrismo y paralelismo',
                        description:
                            'Esta version adicionalmente usara paralelismo y concurrencia para ejecutar las operaciones, de tal manera que ambas tecnologias usaran web workers para ejecutar las operaciones en paralelo, pero se mandaran a ejecutar de forma concurrente. Las ejecuciones seran individuales, y el conjunto de datos tendra un tamaño de 10 millones de elementos.',
                        jsLibs: null,
                        pyConfig: 'pyscript.toml',
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
            {
                title: 'Análisis Estadístico y Paralelización en Grandes Volúmenes de Datos',
                description:
                    'Este experimento evaluará la capacidad de cada tecnología para procesar y analizar grandes conjuntos de datos mediante operaciones de cálculo estadístico. Se generará un conjunto de 10 millones de números aleatorios entre 1 y 1000. Las nuevas operaciones a medir seran la suma, creacion, media, y la desviacion estandar de los datos.',
                versions: [
                    {
                        title: 'Estructuras de Datos Nativas',
                        description:
                            'En la primera version se elimino la restriccion de la anterior prueba de usar estructuras basicas como bucles for, aquello conlleva, que ambos lenguajes usen funciones disponibles nativamente como sum() en Python y otros metodos equivalentes en JavaScript. Se genera el conjunto de 10 millones de números aleatorios entre 1 y 1000, y se analizará la suma, creación, media y desviación estandar de los datos.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                    {
                        title: 'Algoritmos Optimizados con Librerías Especializadas',
                        description:
                            'Esta version empleara librerias optimizadas para la deteccion de los numeros, para ello, se usara el algoritmo de la criba de Eratosthenes. El rango maximo sera hasta 10^4 y se ejecutara 1000 veces para tener un numero de medicion estadistico.',
                        jsLibs: ["https://cdn.jsdelivr.net/npm/danfojs@1.2.0/lib/bundle.min.js"],
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-executions", "parallel-workers"],
                        graph: false,
                    },
                ],
            },
            {
                title: 'Pandas vs Danfo.js',
                description:
                    'Esta prueba tendrá el objetivo de comparar el rendimiento de Pandas (Python) y Danfo.js (JavaScript) en operaciones estadísticas sobre datasets de 100.000 elementos, utilizando paralelización con workers para optimizar el procesamiento. Esta prueba emplea las mismas operaciones que el apartado anterior, sin embargo se usarán librerías especializadas en análisis estadístico diferentes a las anteriores, esto nos proporciona una visión más amplia de las opciones de crear algoritmos.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba contiene una unica version que representa un codigo de la forma mas optimizada posible para simular un codigo del mundo real. Se usara en PyScript Pandas y Numpy, y en JavaScript Danfo.js y Arrays.',
                        jsLibs: ["https://cdn.jsdelivr.net/npm/danfojs@1.2.0/lib/bundle.min.js"],
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-executions", "parallel-workers"],
                        graph: false,
                    },
                ],
            },
        ],
    }, {
        title: '3. Carga y representación de gráficos complejos',
        link: '4.3-carga-graficos-complejos',
        description:
            'Este apartado compara el rendimiento de las librerías estándar de visualización científica en Python y JavaScript cuando operan en el navegador, analizando su eficiencia en escenarios reales de investigación. Las métricas clave incluyen: RAM, Tiempo de ejecucion, latencia, rendimiento con Web Workers, FPS en graficos interactivos.',
        warning:
            'En estos escenarios se emplean WebWorkers, por lo que no se bloquearan las pruebas mientras se ejecutan. Sin embargo, siempre que se use PyScript, seguira existiendo el PLT.',
        tests: [
            {
                title: 'Renderizado de gráficos de dispersión masivos (100,000 puntos',
                description:
                    'Esta prueba evaluará la capacidad de Python (Matplotlib) y JavaScript (Canvas) para renderizar un gráfico de dispersión con 100,000 puntos de datos. En JavaScript se usara Float64Array y Canvas 2D, mientras que en PyScript se usara Numpy y Matplotlib. Con eso se lograra generar y renderizar un PNG con el grafico de dispersión.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba unicamente incluye una version, una version la cual seria la mas optimizada para simular un codigo del mundo real.',
                        jsLibs: null,
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-executions"],
                        graph: true,
                    },
                ],
            },
            {
                title: 'Visualización Interactiva de Series Temporales Complejas',
                description:
                    'Cada lenguaje renderizará una serie temporal compleja con múltiples líneas (por ejemplo, 5 series de 10,000 puntos), usando librerías gráficas interactivas. La prueba permitira observar el grafico e interactuar con el ultimo renderizado permitiendo realizar; zoom, activar y desactivar series, cambiar la escala de los ejes, etc.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba contiene una unica version que representa un codigo de la forma mas optimizada posible para simular un codigo del mundo real. Permitira cambiar el numero de puntos y series disponibles, siendo ejecutados por un unico worker.',
                        jsLibs: ["https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.33.1/plotly.min.js"],
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-series", "num-points"],
                        graph: true,
                    },
                ],
            },
        ],
    }, {
        title: '4. Manejo múltiples solicitudes concurrentes',
        link: '4.4-manejo-peticiones',
        description:
            'Este apartado permitira evaluar el funcionamiento de ambas tecnologias en el manejo de peticiones HTTP, que permiten realizar operaciones concurrentes en diferentes partes del mismo servidor. Tambien por otro lado, podremos observar su funcionamiento utilizando peticiones mediante WebSockets.',
        warning:
            'En estos escenarios se emplean WebWorkers, por lo que no se bloquearan las pruebas mientras se ejecutan. Sin embargo, siempre que se use PyScript, seguira existiendo el PLT.',
        tests: [
            {
                title: 'Solicitudes concurrentes con Fetch/Promise.all (JavaScript) vs Asyncio/Fetch (PyScript)',
                description:
                    'Esta prueba comparara el tiempo total y la capacidad de concurrencia al hacer multiples solicitudes a un servidor',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba unicamente incluye una version, una version la cual seria la mas optimizada para simular un codigo del mundo real. Esta prueba permitira cambiar el numero de peticiones y el tiempo de espera entre ellas, siendo ejecutados por un unico worker, esto ultimo nos permite simular un delay que representa tiempo de trabajo del servidor en el mundo real.',
                        jsLibs: null,
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-requests", "request-delay"],
                        graph: false,
                    },
                ],
            },
            {
                title: 'Manejo de WebSockets para solicitudes concurrentes en JavaScript vs PyScript',
                description:
                    'Esta prueba permitira evaluar el funcionamiento de ambas tecnologias en el manejo de peticiones mediante WebSockets a un servidor.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba contiene una unica version que representa un codigo de la forma mas optimizada posible para simular un codigo del mundo real. Igual que en la version anterior, se mediran las mismas metricas ademas de tener en cuenta que seran peticiones mediante WebSockets.',
                        jsLibs: null,
                        pyConfig: "pyscript-main.json",
                        useNode: false,
                        useBackend: false,
                        inputs: ["num-requests", "request-delay"],
                        graph: false,
                    },
                ],
            },
        ],
    },
    {
        title: '5. Cálculo y verificación de integridad en datos sensibles',
        link: '4.5-criptografia',
        description:
            'Este apartado analizara las librerias disponibles para la cifrado y descifrado de datos, así como su eficiencia en el procesamiento de datos sensibles.',
        warning:
            'En estos escenarios se emplean WebWorkers, por lo que no se bloquearan las pruebas mientras se ejecutan. Sin embargo, siempre que se use PyScript, seguira existiendo el PLT.',
        tests: [
            {
                title: 'Generación y Verificación de Hashes Criptográficos SHA-256',
                description:
                    'Compararemos el rendimiento de PyCryptodome y Web Crypto API al generar y verificar hashes SHA-256 para archivos grandes, evaluando su eficiencia en la validación de integridad de datos sensibles.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba incluye una única versión optimizada para simular un escenario del mundo real. El usuario puede especificar el tamaño de un archivo simulado con contenido aleatorio, sobre el cual se calculará su hash mediante el algoritmo SHA-256 y se verificará su integridad. Se medirán métricas de rendimiento como el tiempo promedio de generación y verificación del hash, así como el tiempo total de ejecución.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
            {
                title: 'Cifrado y Descifrado Simétrico con AES-GCM (128 bits)',
                description:
                    'Evaluaremos la eficiencia de ambos entornos en tareas de cifrado/descifrado simétrico con datos sensibles, utilizando AES-GCM con clave de 128 bits, verificando además la integridad del mensaje.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba cifra y descifra un mensaje de tamaño configurable utilizando el algoritmo AES en modo GCM. Se simulan operaciones criptográficas del mundo real, incluyendo el uso de un nonce y una etiqueta de autenticación. Se mide el rendimiento en términos de tiempo promedio de cifrado y descifrado, así como la integridad de los datos. Esta versión está optimizada para evaluar el rendimiento criptográfico en condiciones realistas.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
        ],
    }, {
        title: '6. Reconocimiento de patrones y clasificación de datos',
        link: '4.6-patrones',
        description:
            'Este apartado analizara las librerias disponibles para el entrenamiento de modelos de aprendizaje automático y su eficiencia en el procesamiento de datos. Esto es importante en los tiempos actuales de la inteligencia artificial, ya que se necesitan modelos de aprendizaje automático para realizar tareas como la clasificación de imágenes, el reconocimiento facial, la detección de patrones en imágenes y la generación de texto.',
        warning:
            'En estos escenarios se emplean WebWorkers, por lo que no se bloquearan las pruebas mientras se ejecutan. Sin embargo, siempre que se use PyScript, seguira existiendo el PLT.',
        tests: [
            {
                title: 'Clasificación del dataset Iris',
                description:
                    'Compararemos los modelos disponibles en ambas tecnologias para la clasificacion del conjunto de datos Iris, evaluando su eficiencia en el procesamiento de datos. Este contiene 150 muestras de tres clases distintas, cada una con cuatro caracteristicas.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba implementa una única versión optimizada que simula un escenario de entrenamiento y evaluación de un modelo de Machine Learning del mundo real. Utiliza el dataset Iris para entrenar un clasificador Random Forest durante múltiples repeticiones configurables. En cada repetición se mide el tiempo de entrenamiento, el tiempo de inferencia, y la precisión obtenida. Al finalizar, se calcula el promedio de estas métricas y se estima el tamaño del modelo resultante en memoria.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
            {
                title: 'Clasificación del dataset Digits',
                description:
                    'Para evaluar el rendimiento de los modelos, se utilizarán conjuntos de datos y algoritmos alternativos. En esta prueba, se compara la eficiencia de scikit-learn (K-Nearest Neighbors) en PyScript con su equivalente en JavaScript, implementado con la librería ml-knn de mljs. El análisis se realizará sobre el conjunto de datos Digits (1797 imágenes de 8x8 píxeles distribuidas en 10 clases), un estándar para la clasificación de imágenes de pequeño tamaño.',
                versions: [
                    {
                        title: 'Version optimizada',
                        description:
                            'Esta prueba contiene una única versión optimizada que simula un escenario de clasificación real utilizando el dataset Digits. En cada repetición configurable, se entrena un modelo de vecinos más cercanos (KNN) con los datos de entrenamiento, se realiza interferencia sobre el conjunto de prueba y se calcula la precisión obtenida. Se miden y promedian los tiempos de entrenamiento, interferencia y precisión. Además, se estima el tamaño en memoria del modelo final para reflejar su impacto computacional.',
                        jsLibs: null,
                        pyConfig: null,
                        useNode: false,
                        useBackend: false,
                        inputs: null,
                        graph: false,
                    },
                ],
            },
        ],
    }
]