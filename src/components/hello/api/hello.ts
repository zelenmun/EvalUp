import axios from "axios";

export const getHello = () => axios.get<{ message: string }>("http://localhost:8000/api/hello/");