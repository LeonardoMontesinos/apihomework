# Usamos Node.js oficial como base
FROM node:18

# Crear directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero para instalar dependencias
COPY package*.json ./

# Instalar dependencias de la app
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto en el que corre tu API (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando para iniciar la API
CMD ["node", "app.js"]
