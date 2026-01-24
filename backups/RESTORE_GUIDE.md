# 🔄 ClientLabs Backup Restore Guide

## 📋 Emergency Restore Instructions

**Importante:** Siempre haz backup del estado actual antes de restaurar.

---

## 1️⃣ Listar Backups Disponibles

Para ver todos los backups disponibles en Google Drive:

```bash
rclone ls gdrive-secure:backups/code/
```

**Ejemplo de salida:**
```
   456789 backup_2026-01-22_03-00-01.zip
   456789 backup_2026-01-21_03-00-01.zip
   456789 backup_2026-01-20_03-00-01.zip
```

Cada línea muestra el tamaño en bytes y el nombre del archivo.

---

## 2️⃣ Descargar un Backup Específico

Elige el backup que quieres restaurar y descárgalo:

```bash
# Reemplaza la fecha con la que necesites
rclone copy gdrive-secure:backups/code/backup_2026-01-22_03-00-01.zip .
```

**Ejemplo real:**
```bash
rclone copy gdrive-secure:backups/code/backup_2026-01-22_03-00-01.zip .
```

Esto descargará el archivo `backup_2026-01-22_03-00-01.zip` a tu directorio actual.

---

## 3️⃣ Extraer el Backup

Descomprime el archivo ZIP descargado:

```bash
unzip backup_2026-01-22_03-00-01.zip
```

Esto creará una carpeta llamada `backup/` con todos los archivos del proyecto.

---

## 4️⃣ Restaurar los Archivos del Proyecto

⚠️ **ADVERTENCIA:** Esto sobrescribirá los archivos existentes. Haz backup primero.

### Paso 1: Backup del estado actual (recomendado)

```bash
# Crear backup de seguridad
mkdir ../backup-emergency-$(date +%Y%m%d-%H%M%S)
cp -r app prisma lib scripts components ../backup-emergency-$(date +%Y%m%d-%H%M%S)/
```

### Paso 2: Remover archivos antiguos

```bash
# Eliminar carpetas existentes
rm -rf app prisma lib scripts components
```

### Paso 3: Restaurar desde backup

```bash
# Mover carpetas restauradas
mv backup/app .
mv backup/prisma .
mv backup/lib .
mv backup/scripts .
mv backup/components .
```

### Paso 4: Limpiar archivos temporales

```bash
# Eliminar carpeta de backup y archivo ZIP
rm -rf backup
rm backup_2026-01-22_03-00-01.zip
```

---

## 5️⃣ Verificar y Reiniciar el Proyecto

### Instalar dependencias

```bash
npm install
```

### Verificar estructura

```bash
ls -la app/ lib/ scripts/
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

### Verificar que funciona

Abre http://localhost:3000 en tu navegador para confirmar que la aplicación funciona.

---

## 🚨 Comando Completo de Emergencia

Si necesitas hacer todo en un solo comando (reemplaza la fecha):

```bash
# Descargar, extraer y restaurar en un comando
rclone copy gdrive-secure:backups/code/backup_2026-01-22_03-00-01.zip . && \
unzip backup_2026-01-22_03-00-01.zip && \
rm -rf app prisma lib scripts components && \
mv backup/app . && mv backup/prisma . && mv backup/lib . && mv backup/scripts . && mv backup/components . && \
rm -rf backup backup_2026-01-22_03-00-01.zip && \
npm install && npm run dev
```

---

## 🔍 Troubleshooting

### Error: "backup file not found"
- Verifica que la fecha en el nombre del archivo sea correcta
- Lista los backups disponibles con: `rclone ls gdrive-secure:backups/code/`

### Error: "permission denied"
- Asegúrate de que tienes permisos para escribir en el directorio actual
- Verifica que rclone esté configurado correctamente

### Error: "unzip command not found"
- Instala unzip: `brew install unzip`

### Error: "npm install fails"
- Verifica que tienes Node.js instalado
- Borra node_modules y package-lock.json, luego vuelve a intentar

### Los backups no aparecen en Google Drive
- Verifica que el cron job esté funcionando: `crontab -l | grep auto-backup`
- Revisa los logs: `tail -f backups/cron.log`
- Fuerza un backup manual: `bash scripts/auto-backup.sh`

---

## 📞 Contacto y Soporte

Si encuentras problemas:

1. Revisa los logs del sistema:
   ```bash
   tail -50 backups/auto-backup.log
   tail -50 backups/cron.log
   ```

2. Verifica el estado del sistema:
   ```bash
   bash scripts/validate-backup-system.sh
   ```

3. Contacta al equipo de DevOps si persisten los problemas.

---

## 📊 Información del Sistema de Backup

- **Frecuencia:** Diaria a las 3:00 AM
- **Ubicación:** Google Drive (gdrive-secure:backups/code/)
- **Retención:** Últimos 7 backups
- **Compresión:** ZIP
- **Logs:** backups/auto-backup.log y backups/cron.log

---

*Esta guía se actualiza automáticamente con cada backup. Última actualización: $(date '+%Y-%m-%d %H:%M:%S')*