import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // This should be kept secure and not hard-coded in real applications

const encrypt = (data) => CryptoJS.AES.encrypt(data, SECRET_KEY).toString();

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);


  return bytes.toString(CryptoJS.enc.Utf8);
};

const storeAccessToken = (token) => {
  const encryptedToken = encrypt(token);

  localStorage.setItem('accessToken', encryptedToken);
};

const getAccessToken = () => {
  const encryptedToken = localStorage.getItem('accessToken');


  return encryptedToken ? decrypt(encryptedToken) : null;
};

const clearAccessToken = () => {
  localStorage.removeItem('accessToken');
};

export default {
  clearAccessToken,
  getAccessToken,
  storeAccessToken,
};
