# Usa una imagen base de Node
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --omit=dev

# Copia el resto de la aplicación
COPY . .

# Expone el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
