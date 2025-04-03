const fs = require("fs");
const sharp = require("sharp");
const { GoogleAuth } = require("google-auth-library");
const dotenv = require("dotenv");

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configurar la autenticación con Google
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
	console.error("Error: No se encontró la clave API. Asegúrate de tener un archivo .env con GEMINI_API_KEY definido.");
	process.exit(1);
}

// Función para generar imágenes
async function generateImage(prompt, options = {}) {
	const defaultOptions = {
		model: "imagen-3.0-generate-002",
		numberofImages: 1,
		aspectRatio: "1:1",
		safetyFilter: "BLOCK_LOW_AND_ABOVE",
		personGeneration: "ALLOW_ADULT",
	};

	const config = { ...defaultOptions, ...options };

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateImages?key=${API_KEY}`;

	const requestBody = {
		prompt: {
			text: prompt,
		},
		parameters: {
			numberofImages: config.numberofImages,
			aspectRatio: config.aspectRatio,
			safetyFilter: config.safetyFilter,
			personGeneration: config.personGeneration,
		},
	};

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error al generar la imagen: ${response.status} ${response.statusText}\n${errorText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error:", error.message);
		throw error;
	}
}

// Función para guardar las imágenes generadas
async function saveImages(imageData, outputDir = "./output") {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	if (!imageData.images || imageData.images.length === 0) {
		console.log("No se generaron imágenes.");
		return [];
	}

	const savedPaths = [];

	for (let i = 0; i < imageData.images.length; i++) {
		const image = imageData.images[i];
		const imageBuffer = Buffer.from(image.data, "base64");
		const outputPath = `${outputDir}/generated_image_${Date.now()}_${i}.png`;

		await sharp(imageBuffer).toFile(outputPath);
		savedPaths.push(outputPath);
		console.log(`Imagen guardada en: ${outputPath}`);
	}

	return savedPaths;
}

// Función principal para ejecutar ejemplos
async function main() {
	try {
		// Ejemplo 1: Generar un perro surfeando en la playa
		console.log("Generando imagen de un perro surfeando...");
		const dogSurfingResponse = await generateImage("A dog surfing at the beach");
		await saveImages(dogSurfingResponse);

		// Ejemplo 2: Generar texto con hojas de té
		console.log('Generando texto "tea" con hojas de té...');
		const teaTextResponse = await generateImage('Word "tea" made from fresh tea leaves, white background');
		await saveImages(teaTextResponse);

		// Ejemplo 3: Generar dos imágenes de cómic
		console.log("Generando paneles de cómic...");
		const comicResponse = await generateImage(
			"Single comic book panel of two people overlooking a destroyed city. A speech bubble points from one of them and says: I guess this is the end.",
			{ numberofImages: 2 }
		);
		await saveImages(comicResponse);

		// Ejemplo 4: Imagen con relación de aspecto 9:16 para fondo de teléfono
		console.log("Generando imagen con relación de aspecto 9:16...");
		const phoneWallpaperResponse = await generateImage(
			"A drone shot of a river flowing between mountains with a stormy sky.",
			{ aspectRatio: "9:16" }
		);
		await saveImages(phoneWallpaperResponse);
	} catch (error) {
		console.error("Error en la ejecución:", error);
	}
}

// Ejecutar el script
main();
