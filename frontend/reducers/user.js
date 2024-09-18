import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: { isLogged: false, token: null, username: null, firstname: null, email: null, picture: null, liked: [] },
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.value.isLogged = true;
            state.value.token = action.payload.token;
            state.value.username = action.payload.username;
            state.value.firstname = action.payload.firstname;
            state.value.email = action.payload.email;
            state.value.picture = action.payload.picture
        },
        logout: (state) => {
            state.value.isLogged = false;
            state.value.token = null;
            state.value.username = null;
            state.value.firstname = null;
            state.value.email = null;
            state.value.picture = null
        },
        setLikedList: (state, action) => {
            state.value.liked = action.payload;
        },
    },
});

export const { login, logout, setLikedList } = userSlice.actions;
export default userSlice.reducer;
