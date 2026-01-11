// agents/crypto_master_key.ts
// TIER 1: Critical Infrastructure - Cryptographic Operations
// German Engineering Standards: Typesafe, Error Handling, Secure

import crypto from 'node:crypto';

// Use environment variables for keys (simulated for prototype, MUST be in .env in prod)
const MASTER_KEY_HEX = process.env.CRYPTO_MASTER_KEY || crypto.randomBytes(32).toString('hex');

export class CryptoMasterKey {
    private key: Buffer;
    private algorithm = 'aes-256-gcm';

    constructor() {
        this.key = Buffer.from(MASTER_KEY_HEX, 'hex');
    }

    /**
     * Encrypts data using AES-256-GCM
     * @param text The plain text to encrypt
     * @returns Object containing iv, encrypted content, and auth tag
     */
    public encrypt(text: string): { iv: string; content: string; tag: string } {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            content: encrypted,
            tag: tag.toString('hex')
        };
    }

    /**
     * Decrypts data using AES-256-GCM
     * @param encryptedData Object containing iv, encrypted content, and auth tag
     * @returns Decrypted string
     */
    public decrypt(encryptedData: { iv: string; content: string; tag: string }): string {
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const tag = Buffer.from(encryptedData.tag, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Generates a new random secure key (for rotation)
     */
    public generateNewKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}

// Singleton export
export const cryptoMaster = new CryptoMasterKey();

// CLI Interface for direct testing/usage
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("--- Crypto Master Key Agent ---");
    const secret = "This is a Top Secret Message";
    console.log(`Original: ${secret}`);
    const encrypted = cryptoMaster.encrypt(secret);
    console.log(`Encrypted:`, encrypted);
    const decrypted = cryptoMaster.decrypt(encrypted);
    console.log(`Decrypted: ${decrypted}`);
}
