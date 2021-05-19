const currentIp = localStorage.getItem('storeIP')
console.log(currentIp)
const getIp = currentIp !== null ? currentIp : 'localhost'
export const BACKEND_API = process.env.REACT_APP_BACKEND_API || `http://${getIp}:4000`;
