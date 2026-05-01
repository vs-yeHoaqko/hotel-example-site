export function validateAgainstSchema(value, schema, { path = "$" } = {}) {
  const errors = [];
  validateValue(value, schema, path, errors);
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertValid(value, schema, label) {
  const result = validateAgainstSchema(value, schema);
  if (!result.valid) {
    throw new Error(
      `${label} schema validation failed:\n${result.errors.join("\n")}`,
    );
  }
}

function validateValue(value, schema, path, errors) {
  if (schema.nullable && value === null) {
    return;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${path}: expected ${schema.type}, got ${describeType(value)}`);
    return;
  }

  if (schema.enum && value !== null && !schema.enum.includes(value)) {
    errors.push(
      `${path}: expected one of ${schema.enum.join(", ")}, got ${JSON.stringify(value)}`,
    );
  }

  if (schema.type === "object") {
    validateObject(value, schema, path, errors);
  } else if (schema.type === "array") {
    validateArray(value, schema, path, errors);
  }
}

function validateObject(value, schema, path, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }

  const required = schema.required ?? [];
  for (const key of required) {
    if (!Object.hasOwn(value, key)) {
      errors.push(`${path}.${key}: required property is missing`);
    }
  }

  const properties = schema.properties ?? {};
  for (const [key, childValue] of Object.entries(value)) {
    if (Object.hasOwn(properties, key)) {
      validateValue(childValue, properties[key], `${path}.${key}`, errors);
    } else if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === "object"
    ) {
      validateValue(
        childValue,
        schema.additionalProperties,
        `${path}.${key}`,
        errors,
      );
    } else if (schema.additionalProperties === false) {
      errors.push(`${path}.${key}: additional property is not allowed`);
    }
  }
}

function validateArray(value, schema, path, errors) {
  if (!Array.isArray(value)) {
    return;
  }
  const itemSchema = schema.items ?? {};
  value.forEach((item, index) => {
    validateValue(item, itemSchema, `${path}[${index}]`, errors);
  });
}

function matchesType(value, type) {
  if (type === "integer") {
    return Number.isInteger(value);
  }
  if (type === "array") {
    return Array.isArray(value);
  }
  if (type === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  return typeof value === type;
}

function describeType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}
