# MÓDULO BLOCKCHAIN: LEDGER INMUTABLE DE CERTIFICACIÓN INMOBILIARIA

Este módulo certifica la **inmutabilidad y auditoría jurídica** de tres eventos críticos de la plataforma InmoAuto:

1. **Registro de Inmuebles (`REGISTRO_INMUEBLE`):**
   - Asienta el `hashTituloPropiedad` (SHA-256) derivado del Folio Real o Alodial verificado con IA/OCR.
   - Garantiza que la titularidad del bien no pueda ser alterada de forma retroactiva ni suplantada.

2. **Firmas de Contrato (`FIRMA_CONTRATO`):**
   - Asienta las firmas electrónicas de ambas partes (`firmas.propietario` y `firmas.inquilino`) con timestamp inmutable y prueba de no repudio.
   - Sincroniza la activación automática del contrato y la generación de la comisión de la plataforma.

3. **Auditoría de Pagos Stripe (`AUDITORIA_PAGO`):**
   - Asienta el ID del pago, el `stripeSessionId` / `stripePaymentIntent` y los montos en un bloque inalterable con respaldo criptográfico.

---

## ESPECIFICACIÓN TÉCNICA DEL BLOQUE
- **Algoritmo de Hashing:** SHA-256
- **Árbol de Merkle:** Raíz criptográfica calculada para cada bloque (`merkleRoot`)
- **Dificultad de Consenso / PoW:** Prefijo `00` (validado mediante `nonce`)
- **Encadenamiento:** `previousHash` estricto en cada bloque sucesivo

---

## COMANDOS DE AUDITORÍA Y VERIFICACIÓN
Para verificar la integridad criptográfica de la cadena desde la API:
```bash
curl http://localhost:3001/api/blockchain/verify
curl http://localhost:3001/api/blockchain/ledger
```
O explora visualmente el libro mayor a través del componente interactivo `BlockchainAuditTrail` en:
`http://localhost:5173/blockchain`
