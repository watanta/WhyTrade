import api from './api';

export interface User {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

const authService = {
    login: async (formData: FormData) => {
        const response = await api.post<LoginResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    register: async (data: RegisterRequest) => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
};

export default authService;
