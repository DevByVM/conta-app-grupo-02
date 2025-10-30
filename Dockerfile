# Imagen ligera de Node
FROM node:lts-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Si algún paquete necesita compilarse
# RUN apk add --no-cache python3 make g++ git

# Copiar solo los package*
COPY package*.json ./

# Instalamos dependencias
RUN npm ci || npm install

# Montaremos el código con volumes, pero copiamos todo por si acaso
COPY . .

# React corre en 3000
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
