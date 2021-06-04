exports.AST = buildASTTypes({
  Program: { body: null },
  Using: { tokens: null },
  Assignment: { name: null, value: null },
  AssignmentName: { tokens: null },
  AssignmentValue: { value: null },
  Expression: { params: null },
  CallExpression: { name: null, params: null },
  Object: { fields: null },
  ObjectValue: { values: null },
});

function buildASTTypes(object) {
  Object.keys(object).forEach((type) => {
    // pull off spec from AST object
    const spec = object[type];

    // reassign the exported object to builder function
    object[type] = function builder(fields) {
      // use spec to check fields provided to builder
      validateSpec(type, spec, fields);

      // return an object with the type and validated fields
      return { type, ...fields };
    };
  });

  return object;
}

function validateSpec(type, spec, fields) {
  const specFields = Object.keys(spec);
  for (let i = 0; i < specFields.length; i++) {
    const field = specFields[i];
    const hasSpecField = fields.hasOwnProperty(field);
    if (!hasSpecField) throw new ASTError(type, field, fields);
  }
}

function ASTError(type, field, fields) {
  const error = new Error(`AST[${type}] missing [${field}] (${JSON.stringify(fields)})`);
  error.name = 'ASTError';
  return error;
}
