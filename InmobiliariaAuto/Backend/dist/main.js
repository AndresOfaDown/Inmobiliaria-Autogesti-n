"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`=======================================================`);
    logger.log(`🚀 Inmobiliaria Backend escuchando en http://localhost:${port}/api`);
    logger.log(`🔗 WebSockets Gateway activo en ws://localhost:${port}`);
    logger.log(`=======================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map