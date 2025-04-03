FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Instalar dependencias de construcción de Sharp para Alpine
RUN apk add --no-cache python3 make g++

# Copiar archivos de configuración de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorio para almacenar las imágenes generadas
RUN mkdir -p public/images && chmod 777 public/images

# Crear archivo .env vacío (se rellenará con las variables de entorno)
RUN echo "GEMINI_API_KEY=\${GEMINI_API_KEY}" > .env

# Exponer el puerto
EXPOSE 3000

# Definir comando para ejecutar la aplicación
CMD ["node", "server.js"]