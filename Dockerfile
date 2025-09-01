# Verwende ein leichtgewichtiges Node.js-Image auf Alpine-Basis für den Build
FROM node:22-alpine AS build-stage

# Setzt das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiert die package.json und package-lock.json (falls vorhanden) für die Installation der Abhängigkeiten
COPY package*.json ./

# Installiert alle Projektabhängigkeiten (npm install liest die package.json)
# Dies geschieht (dank Caching) nur, wenn sich die Abhängigkeiten ändern
RUN npm install

# Kopiert den gesamten restlichen Projektcode in den Container
COPY . .

# Wähle explizit die .env-Datei für die Build-Umgebung, z.B. für Produktion:
COPY .env.vue_production .env

# Baut die Vue.js-Anwendung im Produktionsmodus (Ausgabe im /dist-Ordner)
RUN npm run build

# Verwende ein schlankes Nginx-Image für die Auslieferung der gebauten App
FROM nginx:stable-alpine AS production-stage

# Kopiert die gebaute Anwendung aus der Build-Stage in das Standard-Verzeichnis von Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Kopiert die Nginx-Konfiguration in den Container (für z. B. History-Modus von Vue Router)
COPY ./nginx-frontend/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Öffnet Port 80, auf dem Nginx läuft
EXPOSE 80

# Startet Nginx im Vordergrund (wichtig für Docker)
CMD ["nginx", "-g", "daemon off;"]
