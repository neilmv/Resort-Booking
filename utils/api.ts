import axios from "axios";
export const API_URL = "http://yourIpaddress:5000";
export const API_BASE_URL = "http://yourIpaddress.111:5000/api";

export const api = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
      phone,
    });
    return response.data;
  },

  getProfile: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getResorts: async () => {
    const response = await axios.get(`${API_BASE_URL}/resorts`);
    return response.data;
  },

  getResort: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/resorts/${id}`);
    return response.data;
  },

  createBooking: async (
    resortId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    token: string
  ) => {
    const response = await axios.post(
      `${API_BASE_URL}/resorts/${resortId}/book`,
      {
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getUserBookings: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/resorts/user/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateProfile: async (formData: FormData, token: string) => {
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string,
    token: string
  ) => {
    const response = await axios.put(
      `${API_BASE_URL}/auth/password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
