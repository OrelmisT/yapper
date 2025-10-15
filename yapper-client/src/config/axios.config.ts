import axios from 'axios'
import config from './config'



const client = axios.create({
    baseURL: config.serverUrl,
    withCredentials: true
})


export default client