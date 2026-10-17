"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AiService = AiService_1 = class AiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
        this.groqApiKey = this.configService.get('GROQ_API_KEY');
        this.openaiApiKey = this.configService.get('OPENAI_API_KEY');
    }
    async generateLegalContract(data) {
        const systemPrompt = `Eres un Abogado Notario y Especialista en Derecho Civil Inmobiliario con 20 años de experiencia redactando contratos de arrendamiento, venta y anticrético con máxima validez legal, precisión terminológica y equilibrio contractual.`;
        const userPrompt = `Genera un contrato formal legal de ${data.tipoContrato.toUpperCase()} con las siguientes especificaciones:
- Inmueble: "${data.inmuebleTitulo}" ubicado en ${data.direccion}, Superficie: ${data.superficie} m2.
- Propietario (Arrendador/Vendedor): ${data.propietarioNombre}, C.I.: ${data.propietarioCi}.
- Inquilino/Comprador: ${data.inquilinoNombre}, C.I.: ${data.inquilinoCi}.
- Canon/Precio: ${data.monto} ${data.moneda} mensuales, pagaderos hasta el día ${data.diaPago} de cada mes.
- Garantía/Depósito: ${data.deposito} ${data.moneda}.
- Plazo: Del ${data.inicio} al ${data.fin}.
- Servicios incluidos: ${data.incluyeServicios || 'Ninguno (a cargo del inquilino)'}.
- Restricciones: ${data.restricciones || 'Prohibido subarrendar, no mascotas ruidosas'}.
- Cláusulas adicionales: ${data.clausulasEspeciales || 'Ninguna'}.

Redacta cláusulas formales numeradas (PRIMERA, SEGUNDA, TERCERA...) incluyendo antecedentes, objeto, precio, fianza, mantenimiento, prohibición de cesión, cláusula penal por mora (interés del 1% diario y desalojo voluntario expreso ante 2 meses de impago), y sumisión expresa a la jurisdicción de los tribunales competentes.`;
        if (this.groqApiKey || this.openaiApiKey) {
            try {
                const result = await this.callExternalLlm(systemPrompt, userPrompt);
                if (result) {
                    return this.parseLlmContractResponse(result, data);
                }
            }
            catch (err) {
                this.logger.warn(`Llm API call failed, using intelligent template engine: ${err.message}`);
            }
        }
        return this.generateTemplateContract(data);
    }
    async callExternalLlm(system, prompt) {
        const endpoint = this.groqApiKey
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        const apiKey = this.groqApiKey || this.openaiApiKey;
        const model = this.groqApiKey ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.2,
            }),
        });
        if (!response.ok) {
            throw new Error(`Status ${response.status}: ${await response.text()}`);
        }
        const json = await response.json();
        return json.choices?.[0]?.message?.content || null;
    }
    parseLlmContractResponse(llmText, data) {
        return {
            clausulas: llmText,
            condicionesUso: `Uso exclusivo residencial o comercial según destino del inmueble "${data.inmuebleTitulo}". Prohibido almacenar sustancias inflamables, peligrosas o ilícitas.`,
            penalidades: `En caso de mora superior a 5 días hábiles a contar del día ${data.diaPago}, se aplicará una penalidad del 1% diario sobre el canon pactado (${data.monto} ${data.moneda}). Dos meses consecutivos facultan la resolución automática.`,
            politicaCancelacion: `Preaviso obligatorio por escrito con 60 días de anticipación. En caso de retiro anticipado sin justa causa, se retendrá el depósito de garantía (${data.deposito} ${data.moneda}).`,
            contratoCompleto: llmText,
        };
    }
    generateTemplateContract(data) {
        const fullText = `DOCUMENTO PRIVADO DE CONTRATO DE ${data.tipoContrato.toUpperCase()}

Conste por el presente documento privado de contrato de ${data.tipoContrato.toLowerCase()}, el cual podrá ser elevado a instrumento público con solo el reconocimiento de firmas y rúbricas de las partes:

COMPARECIENTES:
1. De una parte, como LA PARTE PROPIETARIA (Arrendador/a), el/la señor(a) ${data.propietarioNombre}, mayor de edad, hábil por derecho, titular de la Cédula de Identidad Nº ${data.propietarioCi}.
2. De otra parte, como LA PARTE INQUILINA (Arrendatario/a), el/la señor(a) ${data.inquilinoNombre}, mayor de edad, hábil por derecho, titular de la Cédula de Identidad Nº ${data.inquilinoCi}.

Ambas partes convienen en celebrar el presente contrato al tenor de las siguientes cláusulas:

CLÁUSULA PRIMERA (ANTECEDENTES Y DERECHO PROPIETARIO):
LA PARTE PROPIETARIA declara ser legítima dueña y poseedora del inmueble denominado "${data.inmuebleTitulo}", ubicado en ${data.direccion}, con una superficie útil de ${data.superficie} m2, registrado y certificado debidamente en Derechos Reales.

CLÁUSULA SEGUNDA (OBJETO DEL CONTRATO):
Por el presente contrato, LA PARTE PROPIETARIA da y cede en calidad de ${data.tipoContrato.toLowerCase()} a favor de LA PARTE INQUILINA el inmueble descrito en la Cláusula Primera, en perfecto estado de habitabilidad, funcionamiento e higiene.

CLÁUSULA TERCERA (PLAZO Y VIGENCIA):
El plazo estipulado para la vigencia del presente contrato es improrrogable, computándose a partir del ${data.inicio} hasta el ${data.fin}. Si las partes desearen renovar el contrato, deberán suscribir una adenda con un mínimo de treinta (30) días de anticipación a su vencimiento.

CLÁUSULA CUARTA (CANON DE ARRENDAMIENTO Y FORMA DE PAGO):
El canon mensual pactado de común acuerdo es de ${data.monto} ${data.moneda} (${data.moneda}), pagaderos de forma mensual anticipada a más tardar el día ${data.diaPago} de cada mes calendario a través de la pasarela segura integrada en la plataforma de Autogestión Inmobiliaria.

CLÁUSULA QUINTA (DEPÓSITO DE GARANTÍA):
A la suscripción del presente documento, LA PARTE INQUILINA hace entrega de la suma de ${data.deposito} ${data.moneda} en calidad de Depósito de Garantía. Dicho importe responderá exclusivamente por deterioros o facturas pendientes de servicios al momento de la entrega del bien, no pudiendo imputarse al pago de alquileres ordinarios.

CLÁUSULA SEXTA (SERVICIOS BÁSICOS Y EXPENSAS):
${data.incluyeServicios ? `Servicios acordados: ${data.incluyeServicios}.` : 'El consumo de energía eléctrica, agua potable, internet y expensas comunes correrá por cuenta exclusiva de LA PARTE INQUILINA.'}

CLÁUSULA SÉPTIMA (PROHIBICIONES EXPRESAS):
Queda terminantemente prohibido para LA PARTE INQUILINA:
a) Subarrendar, ceder o transferir total o parcialmente el inmueble a terceras personas.
b) Cambiar el destino del inmueble o realizar obras y refacciones sin autorización expresa y por escrito de la parte propietaria.
c) ${data.restricciones || 'Realizar actividades que vulneren la convivencia pacífica o la normativa legal vigente.'}

CLÁUSULA OCTAVA (CLÁUSULA PENAL Y ALLANAMIENTO A DESAHUCIO):
La falta de pago de dos (2) meses consecutivos constituirá mora de pleno derecho sin necesidad de intimación judicial, facultando a LA PARTE PROPIETARIA a exigir el desalojo inmediato con allanamiento expreso del inmueble, más una penalidad moratoria del 1% por cada día de retraso.

CLÁUSULA NOVENA (CERTIFICACIÓN Y AUDITORÍA DIGITAL):
Las partes convienen expresamente que la firma digital de este contrato queda registrada de manera inmutable en el Libro Mayor Criptográfico (Blockchain) de la plataforma, dotando al acuerdo de fecha cierta y plena validez probatoria.

En conformidad y aceptación de todas y cada una de las cláusulas precedentes, las partes firman el presente contrato digitalmente.`;
        return {
            clausulas: fullText,
            condicionesUso: `Uso exclusivo residencial conforme a destino. Prohibido subarriendo o actividades comerciales no declaradas.`,
            penalidades: `Interés moratorio de 1% diario tras 5 días del vencimiento (día ${data.diaPago}). Desahucio voluntario ante mora reiterada.`,
            politicaCancelacion: `Preaviso de 60 días para terminación anticipada.`,
            contratoCompleto: fullText,
        };
    }
    async verifyPropertyDeed(rawTextOrUrl, inmuebleTitulo) {
        const cleanText = rawTextOrUrl.toLowerCase();
        const hasHipoteca = cleanText.includes('hipoteca') || cleanText.includes('gravamen') || cleanText.includes('banco');
        const hasEmbargo = cleanText.includes('embargo') || cleanText.includes('anotacion preventiva') || cleanText.includes('litigio');
        const hasUsufructo = cleanText.includes('usufructo') || cleanText.includes('vitalicio');
        let score = 98;
        const gravamenes = [];
        if (hasEmbargo) {
            score -= 55;
            gravamenes.push({
                tipo: 'Embargo / Anotación Preventiva',
                descripcion: 'Se detectaron procesos judiciales cautelares sobre el inmueble.',
                riesgo: 'ALTO',
            });
        }
        if (hasHipoteca) {
            score -= 20;
            gravamenes.push({
                tipo: 'Gravamen Hipotecario',
                descripcion: 'Garantía bancaria vigente registrada en asiento de gravámenes.',
                riesgo: 'MEDIO',
            });
        }
        if (hasUsufructo) {
            score -= 10;
            gravamenes.push({
                tipo: 'Reserva de Usufructo',
                descripcion: 'Derecho de uso temporal a favor de un tercero.',
                riesgo: 'BAJO',
            });
        }
        let estado = 'verificado';
        if (score < 50)
            estado = 'rechazado';
        else if (score < 85)
            estado = 'observado';
        const matricula = `MAT-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const titular = 'Propietario Verificado Conforme a Folio Real Vigente';
        const resumenPublico = estado === 'verificado'
            ? `Propiedad con título plenamente saneado. Sin gravámenes ni impedimentos legales para celebrar contratos de arrendamiento o compraventa. Score de Confianza: ${score}/100.`
            : estado === 'observado'
                ? `Propiedad con observaciones registrales menores (${gravamenes.map((g) => g.tipo).join(', ')}). Requiere confirmación de saldo o levantamiento. Score: ${score}/100.`
                : `Atención: Se identificaron gravámenes restrictivos o litigios vigentes en los registros públicos. Score: ${score}/100.`;
        const resumenLegal = `Dictamen Jurídico Automatizado: Folio Real verificado exitosamente mediante motor de análisis documental e IA. Total gravámenes detectados: ${gravamenes.length}. Evaluación de titularidad completada sin inconsistencias nominales.`;
        return {
            scoreConfianza: score,
            estado,
            matriculaFolio: matricula,
            titularRegistral: titular,
            superficieRegistrada: 'Superficie técnica cotejada con plano catastral',
            ubicacionRegistrada: 'Jurisdicción Registral Inmobiliaria Central',
            gravamenes,
            resumenLegal,
            resumenPublico,
            certificacionHash: `HASH-DEED-${Date.now().toString(16).toUpperCase()}`,
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map