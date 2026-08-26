import { CATEGORIES, TOOLS, getCategoryBySlug, getToolBySlug, type Category, type ContentSection, type FAQPair, type Tool, type UsageStep } from "./tools";
import type { Lang } from "../i18n/ui";

export const PUBLISHED_LOCALES: Exclude<Lang, "en">[] = ["es", "hi"];

export const LOCALIZED_TOOL_SLUGS = [
  "image-compressor",
  "json-formatter",
  "pdf-compressor",
  "pdf-merger",
  "word-counter",
  "qr-code-generator",
  "jwt-decoder",
  "epoch-converter",
  "word-cloud-generator",
  "grammar-checker",
  "csv-to-json",
  "json-to-csv",
  "unit-converter",
  "color-contrast-checker",
  "character-counter",
  "image-resizer",
  "image-cropper",
  "markdown-to-html",
  "password-generator",
  "regex-tester",
] as const;

export type LocalizedToolSlug = (typeof LOCALIZED_TOOL_SLUGS)[number];

type LocalizedToolCopy = {
  name: string;
  description: string;
  longDescription: string;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
};

type LocalizedCategoryCopy = Pick<Category, "name" | "description" | "metaTitle" | "metaDescription" | "seoContent">;

const categoryTranslations: Record<Exclude<Lang, "en">, Record<string, LocalizedCategoryCopy>> = {
  es: {
    "text-tools": {
      name: "Herramientas de texto",
      description: "Cuenta, analiza, revisa y transforma texto directamente en tu navegador.",
      metaTitle: "Herramientas de texto gratis online",
      metaDescription: "Usa herramientas de texto gratis para contar palabras, revisar gramática, crear nubes de palabras y limpiar contenido en tu navegador.",
      seoContent: "Estas herramientas de texto en español están pensadas para escritores, estudiantes, marketers y equipos de contenido que necesitan revisar, contar y transformar texto sin subir borradores privados a un servidor.",
    },
    "developer-tools": {
      name: "Herramientas para desarrolladores",
      description: "Formatea, valida y depura datos técnicos como JSON, JWT, Regex y CSV.",
      metaTitle: "Herramientas para desarrolladores gratis",
      metaDescription: "Formatea JSON, prueba regex, decodifica JWT y convierte datos con herramientas para desarrolladores que funcionan en el navegador.",
      seoContent: "Las herramientas para desarrolladores localizadas ayudan a limpiar payloads, validar tokens, probar expresiones regulares y transformar datos sin pegar código sensible en servicios remotos.",
    },
    calculators: {
      name: "Calculadoras",
      description: "Calculadoras online para tareas rápidas de porcentajes, fechas, propinas y decisiones cotidianas.",
      metaTitle: "Calculadoras online gratis",
      metaDescription: "Explora calculadoras online gratis para matemáticas rápidas y decisiones cotidianas desde el navegador.",
      seoContent: "La categoría de calculadoras se está localizando por fases. Mientras tanto, puedes acceder a la colección completa en inglés desde la página principal de herramientas.",
    },
    converters: {
      name: "Convertidores",
      description: "Convierte datos, unidades, markdown, imágenes y formatos sin subir archivos.",
      metaTitle: "Convertidores online gratis",
      metaDescription: "Usa convertidores online gratis para CSV, JSON, markdown, unidades e imágenes con procesamiento en tu navegador.",
      seoContent: "Los convertidores localizados cubren flujos comunes como CSV a JSON, JSON a CSV, markdown a HTML, unidades e imágenes. Son útiles para trabajo técnico, contenido y tareas rápidas.",
    },
    "pdf-tools": {
      name: "Herramientas PDF",
      description: "Comprime, une y procesa PDF localmente en tu navegador.",
      metaTitle: "Herramientas PDF gratis online",
      metaDescription: "Comprime y une PDF online gratis con herramientas privadas que funcionan en el navegador.",
      seoContent: "Las herramientas PDF localizadas priorizan privacidad: los archivos se procesan en el navegador cuando la herramienta lo permite, evitando subidas innecesarias.",
    },
    "seo-tools": {
      name: "Herramientas SEO",
      description: "Utilidades SEO para revisar contenido, metadatos, SERP y estructura de páginas.",
      metaTitle: "Herramientas SEO gratis online",
      metaDescription: "Usa herramientas SEO gratis para revisar metadatos, contenido y páginas desde el navegador.",
      seoContent: "Estas herramientas SEO ayudan a comprobar longitud de contenido, estructura y señales básicas antes de publicar páginas o campañas.",
    },
    "design-tools": {
      name: "Herramientas de diseño",
      description: "Comprueba contraste, colores y detalles visuales para interfaces accesibles.",
      metaTitle: "Herramientas de diseño gratis online",
      metaDescription: "Usa herramientas de diseño gratis para contraste WCAG, color y CSS desde el navegador.",
      seoContent: "Las herramientas de diseño localizadas ayudan a revisar contraste, accesibilidad y decisiones visuales sin instalar software adicional.",
    },
  },
  hi: {
    "text-tools": {
      name: "टेक्स्ट टूल्स",
      description: "टेक्स्ट गिनें, जांचें, सुधारें और बदलें, सीधे अपने ब्राउज़र में.",
      metaTitle: "मुफ्त ऑनलाइन टेक्स्ट टूल्स",
      metaDescription: "Word count, grammar, word cloud और text cleanup के लिए मुफ्त online text tools इस्तेमाल करें.",
      seoContent: "हिंदी locale में उपलब्ध text tools writers, students और content teams के लिए हैं जिन्हें private drafts upload किए बिना quick checks चाहिए.",
    },
    "developer-tools": {
      name: "डेवलपर टूल्स",
      description: "JSON, JWT, Regex और CSV जैसे technical data को format, validate और debug करें.",
      metaTitle: "मुफ्त डेवलपर टूल्स ऑनलाइन",
      metaDescription: "JSON format करें, regex test करें, JWT decode करें और browser-based developer tools से data convert करें.",
      seoContent: "Localized developer tools API payloads, tokens, regex patterns और data files पर काम करने में मदद करते हैं, बिना sensitive snippets remote servers पर भेजे.",
    },
    calculators: {
      name: "कैलकुलेटर",
      description: "Percentages, dates, tips और daily math के लिए quick online calculators.",
      metaTitle: "मुफ्त ऑनलाइन कैलकुलेटर",
      metaDescription: "Daily math और quick decisions के लिए मुफ्त online calculators explore करें.",
      seoContent: "Calculator category चरणों में localize हो रही है. तब तक पूरी English collection tools directory में उपलब्ध है.",
    },
    converters: {
      name: "कन्वर्टर",
      description: "Data, units, markdown, images और formats को बिना upload convert करें.",
      metaTitle: "मुफ्त ऑनलाइन कन्वर्टर",
      metaDescription: "CSV, JSON, markdown, units और images के लिए browser-based converters इस्तेमाल करें.",
      seoContent: "Localized converters common data और content workflows के लिए बनाए गए हैं, जैसे CSV to JSON, JSON to CSV, markdown to HTML और image resize.",
    },
    "pdf-tools": {
      name: "PDF टूल्स",
      description: "PDF compress, merge और process करें, जहां संभव हो browser में.",
      metaTitle: "मुफ्त PDF टूल्स ऑनलाइन",
      metaDescription: "PDF compress और merge करने के लिए मुफ्त browser-based PDF tools इस्तेमाल करें.",
      seoContent: "PDF tools privacy-first workflows के लिए बनाए गए हैं ताकि files unnecessary server upload के बिना process हो सकें.",
    },
    "seo-tools": {
      name: "SEO टूल्स",
      description: "Content, metadata, SERP और page structure की quick SEO checks करें.",
      metaTitle: "मुफ्त SEO टूल्स ऑनलाइन",
      metaDescription: "Metadata, content और page checks के लिए मुफ्त online SEO tools इस्तेमाल करें.",
      seoContent: "Localized SEO tools publishing से पहले basic page signals, content length और search snippets check करने में मदद करते हैं.",
    },
    "design-tools": {
      name: "डिजाइन टूल्स",
      description: "Accessible interfaces के लिए contrast, colors और CSS details check करें.",
      metaTitle: "मुफ्त डिजाइन टूल्स ऑनलाइन",
      metaDescription: "WCAG contrast, color और CSS checks के लिए मुफ्त design tools इस्तेमाल करें.",
      seoContent: "Localized design tools contrast और visual decisions को जल्दी review करने में मदद करते हैं.",
    },
  },
};

const toolTranslations: Record<Exclude<Lang, "en">, Record<LocalizedToolSlug, LocalizedToolCopy>> = {
  es: {
    "image-compressor": copy("Compresor de imágenes", "Comprime imágenes JPG, PNG y WebP en tu navegador sin subir archivos.", "Comprime imágenes online y reduce el peso de archivos para web, email o redes sociales. La vista previa y la descarga se generan localmente para mantener tus imágenes privadas.", "comprimir imagen online", "Comprimir imagen online gratis", "Comprime imágenes online gratis en tu navegador. Reduce JPG, PNG y WebP sin subir archivos ni crear una cuenta."),
    "json-formatter": copy("Formateador JSON", "Formatea, valida y limpia JSON para leer datos y APIs con más claridad.", "Pega JSON sin formato y obtén una versión legible con indentación, validación y errores claros. Ideal para APIs, logs y configuraciones privadas.", "formateador JSON online", "Formateador JSON online gratis", "Formatea y valida JSON online gratis. Limpia respuestas de API y datos técnicos directamente en tu navegador."),
    "pdf-compressor": copy("Compresor PDF", "Reduce el tamaño de archivos PDF directamente en tu navegador.", "Comprime PDF online para compartir documentos más livianos sin enviar tus archivos a un servidor. Funciona mejor con PDFs comunes y mantiene el flujo privado.", "comprimir PDF online", "Comprimir PDF online gratis", "Comprime PDF online gratis desde el navegador. Reduce el tamaño de documentos sin subirlos a un servidor."),
    "pdf-merger": copy("Unir PDF", "Une varios archivos PDF en un solo documento desde el navegador.", "Organiza PDFs, cambia el orden y crea un archivo combinado sin subir documentos privados. Útil para facturas, apuntes, formularios y entregas.", "unir PDF online", "Unir PDF online gratis", "Une PDFs online gratis en tu navegador. Combina documentos sin subir archivos ni registrarte."),
    "word-counter": copy("Contador de palabras", "Cuenta palabras, caracteres, frases y tiempo de lectura mientras escribes.", "Pega texto para medir longitud, densidad y lectura aproximada. Ideal para artículos, ensayos, posts y metadescripciones.", "contador de palabras online", "Contador de palabras online gratis", "Cuenta palabras y caracteres online gratis. Revisa texto en tiempo real sin subir contenido."),
    "qr-code-generator": copy("Generador de códigos QR", "Crea códigos QR para enlaces, texto y datos simples en segundos.", "Genera un código QR descargable para URLs, notas o información breve. Todo se crea en el navegador para un flujo rápido y privado.", "generador de QR online", "Generador de QR online gratis", "Crea códigos QR online gratis para URLs y texto. Descarga el resultado desde tu navegador."),
    "jwt-decoder": copy("Decodificador JWT", "Decodifica encabezado y payload de tokens JWT sin enviarlos a un servidor.", "Pega un JWT para inspeccionar claims, fechas y estructura. Es útil para depurar autenticación sin exponer tokens privados.", "decodificador JWT online", "Decodificador JWT online gratis", "Decodifica JWT online gratis en tu navegador. Inspecciona claims y payload sin subir tokens."),
    "epoch-converter": copy("Conversor Epoch", "Convierte timestamps Unix a fechas legibles y viceversa.", "Transforma segundos o milisegundos epoch en fechas claras para logs, APIs y eventos. También convierte fechas humanas a timestamp.", "conversor epoch online", "Conversor Epoch online gratis", "Convierte timestamps Unix y fechas online gratis. Trabaja con segundos y milisegundos desde el navegador."),
    "word-cloud-generator": copy("Generador de nube de palabras", "Crea una nube visual con las palabras más frecuentes de tu texto.", "Analiza texto y genera una nube de palabras para detectar temas, términos repetidos y patrones de contenido sin subir el documento.", "generador de nube de palabras", "Generador de nube de palabras gratis", "Crea una nube de palabras online gratis desde tu texto. Visualiza términos frecuentes en el navegador."),
    "grammar-checker": copy("Corrector gramatical", "Detecta problemas comunes de gramática, estilo y claridad en texto.", "Revisa texto para encontrar frases largas, repeticiones y mejoras básicas. Es una ayuda rápida para borradores privados antes de publicar.", "corrector gramatical online", "Corrector gramatical online gratis", "Revisa gramática y estilo online gratis. Mejora borradores en tu navegador sin subir texto."),
    "csv-to-json": copy("Convertidor CSV a JSON", "Convierte datos CSV en JSON limpio para APIs y desarrollo.", "Pega una tabla CSV y genera JSON estructurado para pruebas, integraciones o prototipos. El procesamiento ocurre localmente.", "convertidor CSV a JSON", "Convertidor CSV a JSON online", "Convierte CSV a JSON online gratis. Transforma tablas en datos estructurados desde tu navegador."),
    "json-to-csv": copy("Convertidor JSON a CSV", "Convierte arrays JSON en CSV descargable y fácil de abrir.", "Transforma datos JSON en una tabla CSV para hojas de cálculo, reportes o análisis rápido sin depender de un servidor.", "convertidor JSON a CSV", "Convertidor JSON a CSV online", "Convierte JSON a CSV online gratis. Exporta datos estructurados a tabla desde tu navegador."),
    "unit-converter": copy("Conversor de unidades", "Convierte unidades de longitud, peso, volumen y más al instante.", "Elige una unidad de origen y destino para obtener conversiones rápidas para trabajo, estudio o tareas cotidianas.", "conversor de unidades online", "Conversor de unidades online gratis", "Convierte unidades online gratis para medidas comunes. Obtén resultados rápidos en el navegador."),
    "color-contrast-checker": copy("Comprobador de contraste WCAG", "Comprueba si dos colores cumplen contraste WCAG para accesibilidad.", "Introduce colores de texto y fondo para revisar ratios AA y AAA. Útil para interfaces legibles y accesibles.", "comprobador contraste WCAG", "Comprobador de contraste WCAG gratis", "Revisa contraste WCAG online gratis. Comprueba colores AA y AAA para accesibilidad web."),
    "character-counter": copy("Contador de caracteres", "Cuenta caracteres, palabras y longitud de texto en tiempo real.", "Mide texto para títulos, mensajes, anuncios, snippets y formularios con límites estrictos de caracteres.", "contador de caracteres online", "Contador de caracteres online gratis", "Cuenta caracteres online gratis. Revisa longitud de texto en tiempo real desde tu navegador."),
    "image-resizer": copy("Redimensionar imagen", "Cambia el tamaño de imágenes por píxeles o porcentaje sin subir archivos.", "Ajusta ancho, alto y formato para publicar imágenes más ligeras en web, perfiles o documentación.", "redimensionar imagen online", "Redimensionar imagen online gratis", "Redimensiona imágenes online gratis en tu navegador. Cambia tamaño sin subir archivos."),
    "image-cropper": copy("Recortar imagen", "Recorta imágenes en el navegador con vista previa y descarga local.", "Selecciona el área que necesitas y exporta una imagen recortada para perfiles, miniaturas o documentos.", "recortar imagen online", "Recortar imagen online gratis", "Recorta imágenes online gratis. Ajusta el área y descarga el resultado desde tu navegador."),
    "markdown-to-html": copy("Markdown a HTML", "Convierte Markdown en HTML limpio con vista previa segura.", "Pega Markdown y genera HTML para blogs, documentación o correos. La vista previa se sanitiza para reducir riesgos de scripts.", "markdown a HTML online", "Markdown a HTML online gratis", "Convierte Markdown a HTML online gratis. Previsualiza y copia HTML desde tu navegador."),
    "password-generator": copy("Generador de contraseñas", "Crea contraseñas fuertes con longitud y caracteres configurables.", "Genera contraseñas aleatorias para cuentas, pruebas o credenciales temporales sin enviar nada a un servidor.", "generador de contraseñas online", "Generador de contraseñas online gratis", "Genera contraseñas seguras online gratis. Ajusta longitud y tipos de caracteres en el navegador."),
    "regex-tester": copy("Probador Regex", "Prueba expresiones regulares contra texto de ejemplo con coincidencias visibles.", "Escribe un patrón, ajusta flags y depura coincidencias sin salir del navegador. Ideal para validaciones, logs y limpieza de texto.", "probador regex online", "Probador Regex online gratis", "Prueba expresiones regulares online gratis. Depura patrones y coincidencias en tu navegador."),
  },
  hi: {
    "image-compressor": copy("इमेज कम्प्रेसर", "JPG, PNG और WebP images को browser में compress करें, बिना upload.", "Images को online compress करके web, email या social sharing के लिए हल्का बनाएं. Preview और download local बनते हैं ताकि files private रहें.", "image compress online", "Image Compress Online Free", "Images online free compress करें. JPG, PNG और WebP को browser में reduce करें, बिना upload."),
    "json-formatter": copy("JSON Formatter", "JSON को readable format में clean, validate और inspect करें.", "Raw JSON paste करें और indentation, validation और clear errors के साथ readable output पाएं. APIs, logs और configs के लिए उपयोगी.", "JSON formatter online", "JSON Formatter Online Free", "JSON online free format और validate करें. API responses और data browser में clean करें."),
    "pdf-compressor": copy("PDF Compressor", "PDF file size को directly browser में reduce करें.", "PDF online compress करें ताकि documents share करना आसान हो. Files server पर upload किए बिना private workflow रखें.", "compress PDF online", "Compress PDF Online Free", "PDF online free compress करें. Documents का size browser में reduce करें, बिना upload."),
    "pdf-merger": copy("PDF Merger", "कई PDF files को एक document में merge करें.", "PDFs को order करें और combined file बनाएं. Invoices, notes और forms के लिए private browser workflow.", "merge PDF online", "Merge PDF Online Free", "PDFs online free merge करें. Documents combine करें, बिना upload या signup."),
    "word-counter": copy("Word Counter", "Words, characters, sentences और reading time तुरंत count करें.", "Text paste करके length, count और approximate reading time देखें. Articles, essays और SEO copy के लिए useful.", "word counter online", "Word Counter Online Free", "Words और characters online free count करें. Text browser में real-time check करें."),
    "qr-code-generator": copy("QR Code Generator", "Links, text और simple data के लिए QR codes बनाएं.", "URLs या short text से downloadable QR code बनाएं. Result browser में generate होता है.", "QR code generator online", "QR Code Generator Online Free", "URLs और text के लिए QR codes online free बनाएं और download करें."),
    "jwt-decoder": copy("JWT Decoder", "JWT token का header और payload browser में decode करें.", "JWT paste करके claims, dates और structure inspect करें. Auth debugging के लिए useful, token upload किए बिना.", "JWT decoder online", "JWT Decoder Online Free", "JWT online free decode करें. Claims और payload browser में inspect करें."),
    "epoch-converter": copy("Epoch Converter", "Unix timestamps को readable dates में और वापस convert करें.", "Seconds या milliseconds epoch को clear dates में बदलें. Logs, APIs और events के लिए useful.", "epoch converter online", "Epoch Converter Online Free", "Unix timestamps और dates online free convert करें."),
    "word-cloud-generator": copy("Word Cloud Generator", "Text की frequent words से visual word cloud बनाएं.", "Text analyze करके common words और themes देखें. Drafts upload किए बिना patterns पहचानें.", "word cloud generator", "Word Cloud Generator Free", "Text से word cloud online free बनाएं और frequent terms देखें."),
    "grammar-checker": copy("Grammar Checker", "Text में common grammar, style और clarity issues खोजें.", "Draft text check करें, long sentences और repeated phrases पहचानें. Publishing से पहले quick cleanup के लिए useful.", "grammar checker online", "Grammar Checker Online Free", "Grammar और style online free check करें. Drafts browser में improve करें."),
    "csv-to-json": copy("CSV to JSON Converter", "CSV data को clean JSON में convert करें.", "CSV table paste करें और APIs, tests या prototypes के लिए structured JSON generate करें. Processing local होता है.", "csv to json converter", "CSV to JSON Converter Online", "CSV को JSON online free convert करें. Tables को structured data में बदलें."),
    "json-to-csv": copy("JSON to CSV Converter", "JSON arrays को downloadable CSV table में convert करें.", "JSON data को spreadsheet-friendly CSV में बदलें. Reports, analysis और exports के लिए useful.", "json to csv converter", "JSON to CSV Converter Online", "JSON को CSV online free convert करें और table export करें."),
    "unit-converter": copy("Unit Converter", "Length, weight, volume और common units instantly convert करें.", "Source और target unit चुनें और quick conversion पाएं. Study, work और daily tasks के लिए useful.", "unit converter online", "Unit Converter Online Free", "Common units online free convert करें. Browser में fast results पाएं."),
    "color-contrast-checker": copy("WCAG Contrast Checker", "दो colors का WCAG contrast ratio check करें.", "Text और background colors डालें और AA/AAA accessibility ratios देखें. Accessible UI के लिए useful.", "wcag color contrast checker", "WCAG Contrast Checker Free", "WCAG contrast online free check करें. AA और AAA accessibility colors verify करें."),
    "character-counter": copy("Character Counter", "Characters, words और text length real-time count करें.", "Titles, messages, ads और snippets के लिए strict character limits check करें.", "character counter online", "Character Counter Online Free", "Characters online free count करें. Text length browser में real-time देखें."),
    "image-resizer": copy("Image Resizer", "Images का size pixels या percentage से बदलें, बिना upload.", "Width, height और format adjust करके web, profiles या documents के लिए images तैयार करें.", "resize image online", "Resize Image Online Free", "Images online free resize करें. Size browser में बदलें, बिना upload."),
    "image-cropper": copy("Image Cropper", "Images को browser में crop करें और local download लें.", "Needed area select करें और profile, thumbnail या document के लिए cropped image export करें.", "crop image online", "Crop Image Online Free", "Images online free crop करें. Area select करके result download करें."),
    "markdown-to-html": copy("Markdown to HTML", "Markdown को clean HTML में convert करें with safe preview.", "Markdown paste करें और blogs, docs या emails के लिए HTML generate करें. Preview sanitized रहती है.", "markdown to html online", "Markdown to HTML Online Free", "Markdown को HTML online free convert करें और browser में preview करें."),
    "password-generator": copy("Password Generator", "Configurable length और characters से strong passwords बनाएं.", "Accounts, tests या temporary credentials के लिए random passwords generate करें, बिना server request.", "password generator online", "Password Generator Online Free", "Strong passwords online free generate करें. Length और character types चुनें."),
    "regex-tester": copy("Regex Tester", "Sample text पर regular expressions test करें.", "Pattern लिखें, flags adjust करें और matches debug करें. Validation, logs और text cleanup के लिए useful.", "regex tester online", "Regex Tester Online Free", "Regular expressions online free test करें. Matches browser में debug करें."),
  },
};

function copy(name: string, description: string, longDescription: string, primaryKeyword: string, metaTitle: string, metaDescription: string): LocalizedToolCopy {
  return { name, description, longDescription, primaryKeyword, metaTitle, metaDescription };
}

const localizedDetails: Record<Exclude<Lang, "en">, Record<LocalizedToolSlug, { example: string; limitation: string; engine: string }>> = {
  es: {
    "image-compressor": { example: "Ejemplo: un JPEG de 2400 × 1600 se vuelve a codificar con la calidad elegida, manteniendo esas dimensiones.", limitation: "Los PNG pueden no reducirse; animación, metadatos y perfiles de color no se conservan.", engine: "Canvas API: decodificación, drawImage y toBlob." },
    "json-formatter": { example: "Ejemplo: {\"id\":7,\"active\":true} se convierte en JSON indentado y legible.", limitation: "Comentarios, comas finales, NaN y claves con comillas simples no son JSON válido.", engine: "JSON.parse y JSON.stringify nativos." },
    "pdf-compressor": { example: "Ejemplo: el resultado muestra el tamaño antes y después de reescribir el PDF.", limitation: "Un PDF ya optimizado o dominado por escaneos puede reducirse muy poco.", engine: "Carga y guardado local con pdf-lib." },
    "pdf-merger": { example: "Ejemplo: un PDF de dos páginas y otro de una página producen un documento de tres páginas.", limitation: "Los PDF cifrados o dañados pueden fallar y todos los archivos deben caber en memoria.", engine: "Copia de páginas con pdf-lib PDFDocument." },
    "word-counter": { example: "Ejemplo: «Hola mundo» contiene dos palabras y once caracteres con el espacio.", limitation: "Idiomas sin espacios, emoji y puntuación inusual pueden contarse de forma distinta en otras plataformas.", engine: "Segmentación y estadísticas de texto en JavaScript." },
    "qr-code-generator": { example: "Ejemplo: una URL se codifica en un QR descargable como PNG.", limitation: "La descarga actual es solo PNG; textos muy largos crean códigos más densos.", engine: "Biblioteca qrcode dibujada en canvas." },
    "jwt-decoder": { example: "Ejemplo: un payload con {\"sub\":\"123\"} muestra el claim sub, pero no prueba su autenticidad.", limitation: "Decodificar no verifica firma, emisor, audiencia ni revocación.", engine: "Decodificación Base64URL y análisis JSON." },
    "epoch-converter": { example: "Ejemplo: 0 segundos corresponde a 1970-01-01T00:00:00.000Z.", limitation: "Confundir segundos y milisegundos produce fechas muy alejadas; la hora local depende de la zona del navegador.", engine: "JavaScript Date y aritmética de timestamps." },
    "word-cloud-generator": { example: "Ejemplo: si «privacidad» aparece tres veces, se dibuja más grande que una palabra que aparece una vez.", limitation: "Frecuencia no equivale a sentimiento o tema; stop words y tokenización cambian el resultado.", engine: "Conteo de tokens y renderizado visual en JavaScript." },
    "grammar-checker": { example: "Ejemplo: «Esto esto tiene  doble espacio» detecta repetición y espacio duplicado.", limitation: "Es un corrector heurístico de inglés, no una revisión humana ni un sistema de IA contextual.", engine: "Reglas deterministas de gramática y estilo." },
    "csv-to-json": { example: "Ejemplo: name,age seguido de Ada,36 produce un array con un objeto.", limitation: "Comillas mal cerradas, encabezados duplicados y saltos de línea incrustados requieren revisión.", engine: "Parser local de delimitadores y campos entrecomillados." },
    "json-to-csv": { example: "Ejemplo: [{\"name\":\"Ada\"}] produce una cabecera name y una fila Ada.", limitation: "Objetos anidados necesitan aplanado y claves inconsistentes generan celdas vacías.", engine: "JSON.parse y escape de campos CSV." },
    "unit-converter": { example: "Ejemplo: 1 kilómetro se convierte en 1000 metros.", limitation: "Los valores redondeados no sustituyen cálculos científicos o de calibración regulada.", engine: "Factores de conversión JavaScript por categoría." },
    "color-contrast-checker": { example: "Ejemplo: texto #000000 sobre #FFFFFF da 21:1 y supera AA y AAA.", limitation: "No evalúa imágenes de fondo, transparencia, estados de foco ni toda la accesibilidad de la interfaz.", engine: "Fórmula de luminancia relativa y contraste WCAG." },
    "character-counter": { example: "Ejemplo: «Hola mundo» da 11 caracteres con espacio y 10 sin espacio.", limitation: "Emoji y símbolos Unicode combinados pueden contar distinto en la plataforma de destino.", engine: "Análisis de cadenas y espacios en JavaScript." },
    "image-resizer": { example: "Ejemplo: 1600 × 900 a 800 px de ancho con proporción bloqueada produce 800 × 450.", limitation: "Ampliar no recupera detalle y canvas puede eliminar metadatos o animación.", engine: "Canvas drawImage con escalado y exportación local." },
    "image-cropper": { example: "Ejemplo: una selección central de 600 × 600 produce un recorte cuadrado.", limitation: "La exportación no conserva animación ni metadatos originales.", engine: "Canvas drawImage con región de origen." },
    "markdown-to-html": { example: "Ejemplo: # Hola produce <h1>Hola</h1>.", limitation: "La vista previa elimina scripts, eventos y URL peligrosas; el CSS final depende del destino.", engine: "Parser marked más el sanitizador HTML del sitio." },
    "password-generator": { example: "Ejemplo: longitud 16 con cuatro grupos produce una contraseña aleatoria nueva de 16 caracteres.", limitation: "La seguridad también depende de guardarla correctamente y no reutilizarla.", engine: "Web Crypto getRandomValues." },
    "regex-tester": { example: "Ejemplo: \\b\\d{4}\\b encuentra 2026 en «Año 2026».", limitation: "Usa JavaScript RegExp; sintaxis exclusiva de PCRE, Python, Java o .NET puede fallar.", engine: "RegExp nativo de JavaScript." },
  },
  hi: {
    "image-compressor": { example: "उदाहरण: 2400 × 1600 JPEG चुनी हुई गुणवत्ता पर उसी आकार में दोबारा एन्कोड होता है।", limitation: "PNG हमेशा छोटा नहीं होता; एनीमेशन, मेटाडेटा और रंग प्रोफाइल सुरक्षित नहीं रहते।", engine: "Canvas API decode, drawImage और toBlob।" },
    "json-formatter": { example: "उदाहरण: {\"id\":7,\"active\":true} पढ़ने योग्य इंडेंटेड JSON बनता है।", limitation: "टिप्पणी, अंतिम कॉमा, NaN और एकल उद्धरण वाली कुंजी मान्य JSON नहीं हैं।", engine: "ब्राउज़र के JSON.parse और JSON.stringify।" },
    "pdf-compressor": { example: "उदाहरण: परिणाम मूल और दोबारा लिखी PDF का आकार दिखाता है।", limitation: "पहले से अनुकूलित या स्कैन-प्रधान PDF बहुत कम घट सकती है।", engine: "pdf-lib से स्थानीय लोड और सेव।" },
    "pdf-merger": { example: "उदाहरण: दो पृष्ठ और एक पृष्ठ की PDF मिलकर तीन पृष्ठ की PDF बनाती हैं।", limitation: "एन्क्रिप्टेड या खराब PDF विफल हो सकती है और सभी फ़ाइलें मेमोरी में आनी चाहिए।", engine: "pdf-lib PDFDocument से पृष्ठ कॉपी।" },
    "word-counter": { example: "उदाहरण: ‘Hello world’ में दो शब्द और स्पेस सहित ग्यारह अक्षर हैं।", limitation: "बिना स्पेस वाली भाषाओं, इमोजी और असामान्य विराम में दूसरी सेवाओं से गिनती अलग हो सकती है।", engine: "JavaScript पाठ विभाजन और आंकड़े।" },
    "qr-code-generator": { example: "उदाहरण: URL को PNG रूप में डाउनलोड होने वाले QR में बदला जाता है।", limitation: "वर्तमान डाउनलोड केवल PNG है; लंबा पाठ QR को अधिक घना बनाता है।", engine: "qrcode लाइब्रेरी और canvas।" },
    "jwt-decoder": { example: "उदाहरण: {\"sub\":\"123\"} वाला payload sub दिखाता है, पर उसकी सत्यता सिद्ध नहीं करता।", limitation: "डिकोड करना हस्ताक्षर, जारीकर्ता, दर्शक या निरस्तीकरण सत्यापित नहीं करता।", engine: "Base64URL डिकोड और JSON पार्सिंग।" },
    "epoch-converter": { example: "उदाहरण: 0 सेकंड 1970-01-01T00:00:00.000Z है।", limitation: "सेकंड और मिलीसेकंड की गड़बड़ी गलत तारीख देती है; स्थानीय समय ब्राउज़र क्षेत्र पर निर्भर है।", engine: "JavaScript Date और टाइमस्टैम्प गणना।" },
    "word-cloud-generator": { example: "उदाहरण: तीन बार आया शब्द एक बार आए शब्द से बड़ा दिखता है।", limitation: "आवृत्ति भावना या विषय विश्लेषण नहीं है; stop words परिणाम बदलते हैं।", engine: "JavaScript शब्द आवृत्ति और दृश्य रेंडरिंग।" },
    "grammar-checker": { example: "उदाहरण: दोहराया शब्द और दोहरा स्पेस नियमों से पहचाना जाता है।", limitation: "यह अंग्रेजी के लिए नियम-आधारित सहायता है, मानव संपादन या संदर्भ समझने वाली AI नहीं।", engine: "निश्चित व्याकरण और शैली नियम।" },
    "csv-to-json": { example: "उदाहरण: name,age और Ada,36 से एक वस्तु वाला JSON array बनता है।", limitation: "टूटा उद्धरण, दोहरे header और embedded newline को समीक्षा चाहिए।", engine: "स्थानीय delimiter और quoted-field parser।" },
    "json-to-csv": { example: "उदाहरण: [{\"name\":\"Ada\"}] से name header और Ada row बनती है।", limitation: "Nested object को flatten करना पड़ता है और अलग keys खाली cells बनाती हैं।", engine: "JSON.parse और CSV field escaping।" },
    "unit-converter": { example: "उदाहरण: 1 किलोमीटर 1000 मीटर बनता है।", limitation: "Rounded परिणाम वैज्ञानिक या विनियमित calibration का विकल्प नहीं है।", engine: "श्रेणीवार JavaScript conversion factors।" },
    "color-contrast-checker": { example: "उदाहरण: #000000 और #FFFFFF का अनुपात 21:1 है और AA/AAA पास करता है।", limitation: "यह background image, transparency, focus state या पूरी accessibility नहीं जांचता।", engine: "WCAG relative luminance और contrast formula।" },
    "character-counter": { example: "उदाहरण: ‘Hello world’ में space सहित 11 और बिना space 10 characters हैं।", limitation: "Emoji और संयुक्त Unicode symbols destination platform पर अलग गिने जा सकते हैं।", engine: "JavaScript string और whitespace analysis।" },
    "image-resizer": { example: "उदाहरण: 1600 × 900 को 800 width और locked ratio पर बदलने से 800 × 450 मिलता है।", limitation: "Upscale खोया detail वापस नहीं लाता; metadata और animation बच नहीं सकते।", engine: "Canvas drawImage scaling और local export।" },
    "image-cropper": { example: "उदाहरण: 600 × 600 चयन से square crop बनता है।", limitation: "Export मूल animation और metadata सुरक्षित नहीं रखता।", engine: "Canvas source-region drawImage।" },
    "markdown-to-html": { example: "उदाहरण: # नमस्ते से <h1>नमस्ते</h1> बनता है।", limitation: "Preview script, event handler और खतरनाक URL हटाती है; final CSS destination पर निर्भर है।", engine: "marked parser और site HTML sanitizer।" },
    "password-generator": { example: "उदाहरण: चार character groups और length 16 से नया random 16-character password बनता है।", limitation: "सुरक्षा सही storage और password reuse न करने पर भी निर्भर है।", engine: "Web Crypto getRandomValues।" },
    "regex-tester": { example: "उदाहरण: \\b\\d{4}\\b ‘Year 2026’ में 2026 खोजता है।", limitation: "यह JavaScript RegExp है; PCRE, Python, Java या .NET की खास syntax विफल हो सकती है।", engine: "JavaScript का native RegExp।" },
  },
};

function localizedSteps(lang: Exclude<Lang, "en">, slug: LocalizedToolSlug, toolName: string, keyword: string): UsageStep[] {
  const detail = localizedDetails[lang][slug];
  if (lang === "es") {
    return [
      { title: "Pega o carga tus datos", content: `Abre ${toolName} y añade el texto, archivo o valor que quieres procesar. La herramienta está pensada para ${keyword} con un flujo rápido.` },
      { title: "Ajusta y comprueba", content: `${detail.engine} ${detail.example}` },
      { title: "Copia o descarga el resultado", content: "Cuando el resultado esté listo, cópialo o descárgalo desde el navegador. No necesitas crear una cuenta." },
    ];
  }
  return [
    { title: "डेटा जोड़ें", content: `${toolName} खोलें और text, file या value जोड़ें. यह ${keyword} workflow के लिए fast browser-based tool है.` },
    { title: "विकल्प चुनें और जांचें", content: `${detail.engine} ${detail.example}` },
    { title: "Result copy या download करें", content: "Result ready होने पर उसे browser से copy या download करें. Account की जरूरत नहीं है." },
  ];
}

function localizedFaq(lang: Exclude<Lang, "en">, slug: LocalizedToolSlug, toolName: string, keyword: string): FAQPair[] {
  const detail = localizedDetails[lang][slug];
  if (lang === "es") {
    return [
      { question: `¿${toolName} es gratis?`, answer: `Sí. Puedes usar ${toolName} gratis para ${keyword}, sin registro y sin instalar software.` },
      { question: `¿Qué limitaciones tiene ${toolName}?`, answer: detail.limitation },
    ];
  }
  return [
    { question: `क्या ${toolName} मुफ्त है?`, answer: `हाँ. ${toolName} को ${keyword} के लिए मुफ्त इस्तेमाल किया जा सकता है, बिना signup या installation.` },
    { question: `${toolName} की सीमा क्या है?`, answer: detail.limitation },
  ];
}

function localizedContent(lang: Exclude<Lang, "en">, slug: LocalizedToolSlug, toolName: string): ContentSection[] {
  const detail = localizedDetails[lang][slug];
  if (lang === "es") {
    return [
      { heading: `Cómo funciona ${toolName}`, content: `${detail.engine} ${detail.example}` },
      { heading: "Límites y revisión", content: detail.limitation },
    ];
  }
  return [
    { heading: `${toolName} कैसे काम करता है`, content: `${detail.engine} ${detail.example}` },
    { heading: "सीमाएँ और समीक्षा", content: detail.limitation },
  ];
}

export function getLocalizedCategory(lang: Lang, slug: string): Category | undefined {
  const category = getCategoryBySlug(slug);
  if (!category) return undefined;
  if (lang === "en") return category;
  const translation = categoryTranslations[lang]?.[slug];
  if (!translation) return category;
  return { ...category, ...translation };
}

export function getLocalizedCategories(lang: Lang): Category[] {
  if (lang === "en") return CATEGORIES;
  return CATEGORIES.filter((category) => hasLocalizedCategory(lang, category.slug))
    .map((category) => getLocalizedCategory(lang, category.slug) ?? category);
}

export function hasLocalizedCategory(lang: Lang, categorySlug: string): boolean {
  return lang === "en" ? Boolean(getCategoryBySlug(categorySlug)) : getLocalizedToolsByCategory(lang, categorySlug).length > 0;
}

export function getPublishedLocalizedCategorySlugs(lang: Lang): string[] {
  return getLocalizedCategories(lang).map((category) => category.slug);
}

export function getLocalizedTool(lang: Lang, slug: string): Tool | undefined {
  const tool = getToolBySlug(slug);
  if (!tool) return undefined;
  if (lang === "en") return tool;
  const translation = toolTranslations[lang]?.[slug as LocalizedToolSlug];
  if (!translation) return undefined;
  return {
    ...tool,
    ...translation,
    keywords: [translation.primaryKeyword, ...tool.keywords.filter((keyword) => keyword !== translation.primaryKeyword).slice(0, 5)],
    usageSteps: localizedSteps(lang, slug as LocalizedToolSlug, translation.name, translation.primaryKeyword),
    faq: localizedFaq(lang, slug as LocalizedToolSlug, translation.name, translation.primaryKeyword),
    additionalContent: localizedContent(lang, slug as LocalizedToolSlug, translation.name),
  };
}

export function getLocalizedTools(lang: Lang): Tool[] {
  if (lang === "en") return TOOLS;
  return LOCALIZED_TOOL_SLUGS.map((slug) => getLocalizedTool(lang, slug)).filter((tool): tool is Tool => Boolean(tool));
}

export function getLocalizedToolsByCategory(lang: Lang, categorySlug: string): Tool[] {
  return getLocalizedTools(lang).filter((tool) => tool.categorySlug === categorySlug);
}

export function getLocalizedRelatedTools(lang: Lang, currentSlug: string, limit = 4): Tool[] {
  const current = getLocalizedTool(lang, currentSlug);
  if (!current) return [];
  return getLocalizedToolsByCategory(lang, current.categorySlug).filter((tool) => tool.slug !== currentSlug).slice(0, limit);
}

export function hasLocalizedTool(lang: Lang, slug: string): boolean {
  return lang === "en" ? Boolean(getToolBySlug(slug)) : Boolean(toolTranslations[lang]?.[slug as LocalizedToolSlug]);
}
