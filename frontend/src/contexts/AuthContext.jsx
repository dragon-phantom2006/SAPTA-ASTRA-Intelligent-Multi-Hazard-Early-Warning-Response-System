import {createContext,useContext,useEffect,useState} from 'react';
import API from '../services/api';
import {firebaseLogout,signInWithGoogle} from '../services/firebase';

const C=createContext();

export function AuthProvider({children}){
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        if(!localStorage.getItem('floodguard_token')){
            setLoading(false);
            return;
        }
        API.get('/auth/me')
            .then(r=>setUser(r.data.user))
            .catch(()=>localStorage.removeItem('floodguard_token'))
            .finally(()=>setLoading(false));
    },[]);

    const login=async(data)=>{
        const r=await API.post('/auth/login',data);
        localStorage.setItem('floodguard_token',r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
    };

    const googleLogin=async()=>{
        const idToken=await signInWithGoogle();
        const r=await API.post('/auth/google',{id_token:idToken});
        localStorage.setItem('floodguard_token',r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
    };

    const logout=async()=>{
        try{await firebaseLogout();}catch{}
        localStorage.removeItem('floodguard_token');
        setUser(null);
    };

    return <C.Provider value={{user,loading,login,googleLogin,logout}}>
        {children}
    </C.Provider>;
}

export const useAuth=()=>useContext(C);
