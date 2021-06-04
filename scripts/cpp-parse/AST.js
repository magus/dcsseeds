exports.AST = buildASTTypes({
  Program: { body: null },
  Using: { tokens: null },
  Assignment: { types: null, name: null, value: null },
  AssignmentTypes: { tokens: null },
  Expression: { params: null },
  CallExpression: { name: null, params: null },
  Object: { fields: null },
  ObjectValue: { values: null },
});

function buildASTTypes(object) {
  Object.keys(object).forEach((type) => {
    // pull off spec from AST object
    const spec = object[type];

    function build(fields) {
      // use spec to check fields provided to builder
      validateSpec(type, spec, fields);

      // return an object with the type and validated fields
      return { type, ...fields };
    }

    // reassign the exported object
    object[type] = { type, build };
  });

  return object;
}

function validateSpec(type, spec, fields) {
  Object.keys(spec).forEach((field) => {
    if (!fields.hasOwnProperty(field)) throw new ASTError(type, field, fields);
  });

  Object.keys(fields).forEach((field) => {
    if (!spec.hasOwnProperty(field)) throw new ASTError(type, field, fields);
  });
}

function ASTError(type, field, fields) {
  const error = new TypeError(`[${type}] missing [${field}] (${JSON.stringify(fields)})`);
  error.name = 'ASTError';
  return error;
}
