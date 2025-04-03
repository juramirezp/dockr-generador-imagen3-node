const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const { generateImage, saveImages } = require("./services/imageService");

// Cargar variables de entorno
dotenv.config();

// Verificar la clave API
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
	console.error("Error: No se encontró la clave API. Asegúrate de tener un archivo .env con GEMINI_API_KEY definido.");
	process.exit(1);
}

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Seguridad
app.use(cors()); // CORS
app.use(express.json()); // Parsear JSON en solicitudes
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos

// Ruta para generar imágenes
app.post("/api/generate-image", async (req, res) => {
	try {
		const { prompt, options } = req.body;

		if (!prompt) {
			return res.status(400).json({
				success: false,
				error: "El prompt es obligatorio",
			});
		}

		console.log(`Generando imagen con prompt: "${prompt}"`);

		// Generar la imagen
		const imageData = await generateImage(prompt, options, API_KEY);

		// Guardar las imágenes generadas
		const imagePaths = await saveImages(imageData);

		// Devolver las rutas de las imágenes generadas
		return res.status(200).json({
			success: true,
			images: imagePaths,
			message: `Se generaron ${imagePaths.length} imágenes exitosamente`,
		});
	} catch (error) {
		console.error("Error al procesar la solicitud:", error);
		return res.status(500).json({
			success: false,
			error: "Error al generar la imagen",
			details: error.message,
		});
	}
});

// Ruta para probar que el servidor está en funcionamiento
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "Servidor en funcionamiento" });
});

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
	console.log("Rutas disponibles:");
	console.log("- GET /api/health: Verificar estado del servidor");
	console.log("- POST /api/generate-image: Generar imagen con IA");
});
