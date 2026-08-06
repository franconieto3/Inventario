function validarPrimeros3Digitos(str) {
  if (str !== ""){
    return /^\d{3}/.test(str);
  }
  return true;
}

export default validarPrimeros3Digitos;