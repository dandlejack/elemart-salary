import axios from 'axios'

const currentIp = localStorage.getItem('storeIP')
const getIp = currentIp ? currentIp : 'localhost'
export const BACKEND_API = process.env.REACT_APP_BACKEND_API || `http://${getIp}:4000`;

// An unreachable server should end in an error message, not an endless loading spinner.
axios.defaults.timeout = 15000
