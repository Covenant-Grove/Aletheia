import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Unambiguous alphabet for a code a child reads off a card and types --
// excludes 0/O/1/I/l, which are easy to mis-type or mis-read.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

// Deliberately module-local rather than reusing identity's PasswordHasher --
// cross-module imports may only go through application/public-api.ts
// (scripts/check-module-boundaries.mjs), and this scrypt primitive is
// generic enough not to warrant expanding identity's public surface for it.
@Injectable()
export class CodeHasher {
  private readonly keyLength = 64;

  generateCode(): string {
    const bytes = randomBytes(CODE_LENGTH);
    let code = '';
    for (const byte of bytes) {
      code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    }
    return code;
  }

  hash(code: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(code, salt, this.keyLength).toString('hex');
    return `${salt}:${derivedKey}`;
  }

  verify(code: string, combined: string): boolean {
    const [salt, key] = combined.split(':');
    if (!salt || !key) {
      return false;
    }
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = scryptSync(code, salt, this.keyLength);
    if (keyBuffer.length !== derivedBuffer.length) {
      return false;
    }
    return timingSafeEqual(keyBuffer, derivedBuffer);
  }
}
