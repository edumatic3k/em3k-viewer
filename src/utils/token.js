// Token utilities: generate unique student/journey tokens
export function generateToken(length){
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let out = '';
  for (let i=0;i<length;i++){ out += chars.charAt(Math.floor(Math.random()*chars.length)); }
  return out;
}

export function generateNewCode() {
  const parts = [];
  for (let i=0;i<5;i++) parts.push(generateToken(4).toUpperCase());
  return parts.join('-');
}
