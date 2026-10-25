// @use(kind, contract, limit, scope, goodPractice, test)
// @kind(util)
// @limit(lines: 100)
// @contract(in: data with potential PII -> out: sanitized copy with masked/replaced PII fields)
// @scope(shared)
// @goodPractice("sanitizeForLogs() preserves structure but replaces PII with placeholder — safe for debugging while protecting privacy.")
// @goodPractice("Masking preserves format (email: ***@domain.com, phone: +56*********) for visual identification.")
// @goodPractice("All functions return new objects — never mutate the input.")
// @test("sanitizeForLogs strips email, phone, full name from context objects")
// @test("maskEmail preserves domain, replaces local part")
// @test("maskPhone preserves country code and length, replaces digits with *")
// @test("isPIIField correctly identifies known PII field names")
//
// PII Protection Utilities (BUG-036)
// ===================================
// Provides sanitization, masking, and detection utilities for Personally
// Identifiable Information across the application. Used primarily by the
// error-logger to prevent PII leakage into persistent logs.

/**
 * Known PII field name patterns (case-insensitive).
 * Used by stripPIIFromObject() to detect and redact sensitive fields.
 */
const PII_FIELD_PATTERNS: RegExp[] = [
    /^email$/i,
    /^e-?mail$/i,
    /^phone$/i,
    /^cel(ular)?$/i,
    /^telefono$/i,
    /^first_?name$/i,
    /^last_?name$/i,
    /^full_?name$/i,
    /^name$/i,
    /^nombre$/i,
    /^apellido$/i,
    /^direccion$/i,
    /^address$/i,
    /^rut$/i,
    /^dni$/i,
    /^passport$/i,
    /^token$/i,
    /^password$/i,
    /^secret$/i,
    /^ip_address$/i,
    /^ip$/i,
];

/** Known PII field substrings (matched against object keys) */
const PII_FIELD_SUBSTRINGS = [
    'email',
    'phone',
    'telefono',
    'celular',
    'password',
    'secret',
    'token',
    'rut',
    'dni',
];

/**
 * Checks if a field name is likely to contain PII.
 * Used to decide whether to redact before logging.
 */
export function isPIIField(key: string): boolean {
    if (PII_FIELD_PATTERNS.some(pattern => pattern.test(key))) return true;
    return PII_FIELD_SUBSTRINGS.some(sub => key.toLowerCase().includes(sub));
}

/**
 * Masks an email address: "user@domain.com" → "***@domain.com".
 * Returns the original string if it doesn't look like an email.
 */
export function maskEmail(value: string): string {
    const atIndex = value.indexOf('@');
    if (atIndex <= 0) return value;
    const domain = value.slice(atIndex);
    return `***${domain}`;
}

/**
 * Masks a phone number: "+56912345678" → "+569********".
 * Preserves country code and formatting characters, replaces digit characters with *.
 * Returns original if it doesn't look like a phone number.
 */
export function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 4) return value;

    // How many leading digits to keep visible (typically 3 for country code)
    const visibleDigitCount = Math.min(3, Math.max(2, digits.length - 5));

    // Walk through the string, replacing digit characters after visible count with *
    let digitIndex = 0;
    const result = value.split('').map(char => {
        if (char >= '0' && char <= '9') {
            digitIndex++;
            if (digitIndex > visibleDigitCount) {
                return '*';
            }
        }
        return char;
    }).join('');

    return result;
}

/**
 * Masks a name: "Juan Pérez" → "J*** P***".
 * Preserves first letter of each word, replaces rest with *.
 */
export function maskName(value: string): string {
    return value
        .split(' ')
        .filter(Boolean)
        .map(word => {
            if (word.length <= 1) return word;
            return word[0] + '*'.repeat(word.length - 1);
        })
        .join(' ');
}

/** Name-specific PII field pattern (names should be masked, not fully redacted) */
const NAME_FIELD_PATTERNS: RegExp[] = [
    /^first_?name$/i,
    /^last_?name$/i,
    /^full_?name$/i,
    /^name$/i,
    /^nombre$/i,
    /^apellido$/i,
];

function isNameField(key: string): boolean {
    return NAME_FIELD_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Deep-clones an object and redacts any known PII fields.
 * Returns a new object (original is never mutated).
 *
 * - Name fields (name, nombre, etc.) → maskName (preserves first letter)
 * - Email fields → maskEmail (preserves domain)
 * - Phone-like fields (≥6 digits) → maskPhone (preserves prefix)
 * - Other PII fields (token, password, etc.) → [REDACTED]
 * - Nested objects → recursively sanitized
 * - Arrays → each element sanitized
 * - Non-string scalars → passed through unchanged
 */
export function stripPIIFromObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj } as Record<string, unknown>;

    for (const key of Object.keys(result)) {
        const value = result[key];

        if (typeof value === 'string') {
            if (isPIIField(key)) {
                if (isNameField(key)) {
                    // Names are masked (first letter preserved) even for single words
                    result[key] = maskName(value);
                } else if (value.includes('@') && value.split('@').length === 2 && value.split('@')[1].includes('.')) {
                    result[key] = maskEmail(value);
                } else if (/\d{6,}/.test(value)) {
                    result[key] = maskPhone(value);
                } else {
                    // Tokens, passwords, secrets, addresses → fully redacted
                    result[key] = '[REDACTED]';
                }
            }
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = stripPIIFromObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'object' && item !== null
                    ? stripPIIFromObject(item as Record<string, unknown>)
                    : item
            );
        }
    }

    return result as T;
}

/**
 * High-level sanitizer for error logging.
 * Takes a context object (Record<string, unknown>) and returns a sanitized copy
 * with all PII fields masked/redacted.
 *
 * This is the primary function consumed by error-logger.ts.
 */
export function sanitizeForLogs(context: Record<string, unknown>): Record<string, unknown> {
    return stripPIIFromObject(context);
}

/**
 * Masks PII in a plain error message string.
 * Replaces common PII patterns (email, phone, RUT) with placeholders.
 */
export function sanitizeMessage(message: string): string {
    return message
        // Email: user@domain.com → ***@domain.com
        .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@$2')
        // Phone: +56912345678 → +569*******
        .replace(/(\+?\d{1,3}[\s.-]?)(\d{4,}[\d\s.-]*)/g, (_, prefix, digits) => {
            const cleanDigits = digits.replace(/\D/g, '');
            if (cleanDigits.length < 4) return _;
            return prefix + '*******';
        })
        // RUT/Chilean ID: 12.345.678-9 → **.***.***-*
        .replace(/\b\d{1,2}\.\d{3}\.\d{3}[-][\dkK]\b/g, '**.***.***-*');
}
