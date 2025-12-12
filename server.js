/**
 * 🚀 SERVIDOR WEB - GENÉRICO
 * Sirve cualquier sistema web (ventas, comida, blog, etc.)
 * Despliegue: GitHub + Render
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ================= CONFIGURACIÓN =================
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Tipos MIME para diferentes extensiones
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf'
};

// ================= FUNCIÓN PARA SERVIR ARCHIVOS =================
const serveFile = (filePath, contentType, response) => {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Archivo no encontrado - servir 404
                const notFoundPath = path.join(PUBLIC_DIR, '404.html');
                if (fs.existsSync(notFoundPath)) {
                    fs.readFile(notFoundPath, (err, notFoundContent) => {
                        response.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                        response.end(notFoundContent);
                    });
                } else {
                    // Si no hay 404 personalizado
                    response.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                    response.end(`
                        <!DOCTYPE html>
                        <html>
                        <head><title>404 - No Encontrado</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>404 - Página No Encontrada</h1>
                            <p>La página solicitada no existe en este servidor.</p>
                            <a href="/">Volver al inicio</a>
                        </body>
                        </html>
                    `, 'utf-8');
                }
            } else {
                // Error del servidor
                response.writeHead(500);
                response.end(`Error del servidor: ${error.code}`);
            }
        } else {
            // Archivo encontrado - servir normalmente
            const headers = {
                'Content-Type': contentType,
                'X-Developed-By': 'Laboratorio Servidor Web'
            };
            
            // Cache para archivos estáticos (1 día)
            if (contentType.includes('image') || contentType.includes('css') || contentType.includes('js')) {
                headers['Cache-Control'] = 'public, max-age=86400';
            }
            
            response.writeHead(200, headers);
            response.end(content, 'utf-8');
        }
    });
};

// ================= RUTAS DE LA API =================
const handleApiRequest = (reqUrl, response) => {
    const parsedUrl = url.parse(reqUrl, true);
    const pathname = parsedUrl.pathname;

    // Endpoint de status del servidor
    if (pathname === '/api/status') {
        const status = {
            status: 'online',
            timestamp: new Date().toISOString(),
            server: 'Node.js HTTP Server',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            deployment: process.env.RENDER ? 'Render' : 'Local',
            publicDirectory: PUBLIC_DIR,
            uptime: process.uptime()
        };
        
        response.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        response.end(JSON.stringify(status, null, 2));
        return true;
    }

    // Endpoint de información del sistema
    if (pathname === '/api/info') {
        const files = fs.readdirSync(PUBLIC_DIR);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            project: 'Sistema Web - Laboratorio',
            description: 'Servidor HTTP genérico para cualquier sistema web',
            endpoints: ['/', ...htmlFiles.map(f => `/${f}`), '/api/status', '/api/info'],
            totalFiles: files.length,
            staticFiles: htmlFiles
        }, null, 2));
        return true;
    }

    return false;
};

// ================= SERVIDOR HTTP =================
const server = http.createServer((req, res) => {
    const reqUrl = req.url;
    const method = req.method;
    const clientIP = req.socket.remoteAddress;
    
    // Log de la petición (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[${new Date().toLocaleTimeString()}] ${clientIP} ${method} ${reqUrl}`);
    }
    
    // Manejar API requests
    if (reqUrl.startsWith('/api')) {
        if (handleApiRequest(reqUrl, res)) return;
    }
    
    // Determinar la ruta del archivo
    let filePath = path.join(PUBLIC_DIR, reqUrl === '/' ? 'index.html' : reqUrl);
    const extname = path.extname(filePath);
    
    // Si no tiene extensión, asumir que es un directorio y buscar index.html
    if (!extname && !reqUrl.includes('.')) {
        if (!reqUrl.endsWith('/')) {
            // Redirigir a URL con slash
            res.writeHead(301, { 'Location': reqUrl + '/' });
            res.end();
            return;
        }
        filePath = path.join(filePath, 'index.html');
    }
    
    // Verificar si el archivo existe
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Si no es un archivo, buscar como .html
            if (!extname) {
                filePath += '.html';
            }
        }
        
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Verificar si el archivo existe después de ajustar la ruta
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Archivo no existe - servir 404
                const notFoundPath = path.join(PUBLIC_DIR, '404.html');
                fs.readFile(notFoundPath, (err, content) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 - Página no encontrada</h1><a href="/">Inicio</a>');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                serveFile(filePath, contentType, res);
            }
        });
    });
});

// ================= INICIAR SERVIDOR =================
server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SERVIDOR WEB INICIADO CORRECTAMENTE');
    console.log('='.repeat(60));
    console.log(`📂 Directorio público: ${PUBLIC_DIR}`);
    console.log(`🌐 URL local: http://localhost:${PORT}`);
    console.log(`⚡ API Status: http://localhost:${PORT}/api/status`);
    console.log(`🛠️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👨‍🎓 Para: Sistema de Ventas/Comida/Blog/etc.`);
    
    if (process.env.RENDER) {
        console.log('☁️  Desplegado en: Render.com (producción)');
    } else {
        console.log('💻 Ejecutando localmente (desarrollo)');
    }
    console.log('='.repeat(60));
    console.log('Presiona CTRL + C para detener el servidor');
    console.log('='.repeat(60));
});

// ================= MANEJO DE SEÑALES =================
process.on('SIGINT', () => {
    console.log('\n\n🔴 Recibida señal SIGINT - Deteniendo servidor...');
    server.close(() => {
        console.log('✅ Servidor detenido correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n🔴 Recibida señal SIGTERM - Deteniendo servidor...');
    server.close(() => {
        console.log('✅ Servidor detenido correctamente');
        process.exit(0);
    });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
    server.close(() => process.exit(1));
});