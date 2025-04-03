const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Función para generar imágenes
async function generateImage(prompt, options = {}, apiKey) {
	const defaultOptions = {
		model: "imagen-3.0-generate-002",
		numberofImages: 1,
		aspectRatio: "1:1",
		safetyFilter: "BLOCK_LOW_AND_ABOVE",
		personGeneration: "ALLOW_ADULT",
	};

	const config = { ...defaultOptions, ...options };

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateImages?key=${apiKey}`;

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
async function saveImages(imageData, outputDir = "./public/images") {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	if (!imageData.images || imageData.images.length === 0) {
		console.log("No se generaron imágenes.");
		return [];
	}

	const savedPaths = [];
	const timestamp = Date.now();

	for (let i = 0; i < imageData.images.length; i++) {
		const image = imageData.images[i];
		const imageBuffer = Buffer.from(image.data, "base64");
		const filename = `generated_image_${timestamp}_${i}.png`;
		const outputPath = path.join(outputDir, filename);

		await sharp(imageBuffer).toFile(outputPath);

		// Devolvemos la ruta relativa para acceder desde la API
		savedPaths.push(`/images/${filename}`);
	}

	return savedPaths;
}

module.exports = {
	generateImage,
	saveImages,
};
