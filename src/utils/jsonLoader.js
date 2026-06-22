// src/utils/jsonLoader.js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  useDefaults: true,
  removeAdditional: true,
  allErrors: true,
  coerceTypes: true,
});

addFormats(ajv);

// Cache for compiled validators
const validators = new Map();

/**
 * Get or compile a validator for a given schema
 * @param {string} schemaKey - e.g. 'config', 'manifest', 'quiz'
 * @param {Object} schema - The JSON Schema object
 */
function getValidator(schemaKey, schema) {
  if (!validators.has(schemaKey)) {
    validators.set(schemaKey, ajv.compile(schema));
  }
  return validators.get(schemaKey);
}

// Deep merge utility: merges `source` into `target` creating a new object.
function deepMerge(target, source) {
  if (target === null || typeof target !== 'object') return source;
  if (source === null || typeof source !== 'object') return source;

  // Arrays: prefer source replacement
  if (Array.isArray(target) || Array.isArray(source)) {
    return Array.isArray(source) ? source.slice() : source;
  }

  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (key in target) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

/**
 * Safely load and validate any JSON resource
 * @param {string} url - Path to the JSON file (e.g. '/config.json')
 * @param {string} schemaKey - Key matching a schema (e.g. 'config')
 * @param {Object} schema - The imported JSON schema
 * @param {Object} fallback - Default values if loading/validation fails
 * @returns {Promise<{ data: Object, valid: boolean, errors: Array|null }>}
 */
export async function loadAndValidate(url, schemaKey, schema, fallback = {}) {
  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const validate = getValidator(schemaKey, schema);
    const valid = validate(data);

    if (!valid) {
      console.warn(`Validation failed for ${url}:`, validate.errors);
      return {
        data: deepMerge(fallback, data),
        valid: false,
        errors: validate.errors,
      };
    }

    // Always merge engine-owned safe defaults with validated data so missing
    // fields are preserved from the fallback (shallow merge).
    return { data: deepMerge(fallback, data), valid: true, errors: null };

  } catch (err) {
    console.error(`Failed to load/validate ${url}:`, err);
    return {
      data: fallback,
      valid: false,
      errors: [err.message],
    };
  }
}