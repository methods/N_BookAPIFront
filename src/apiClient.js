import axios from "axios";
import 'dotenv/config';

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
});

export const getBooks = async () => {
    const response = await apiClient.get('/books');
    return response.data;
}

export const getBookById = async (bookId) => {
    const response = await apiClient.get(`/books/${bookId}`);
    return response.data;
}
