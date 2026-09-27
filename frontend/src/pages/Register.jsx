import {useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {FcGoogle} from 'react-icons/fc';
import {useAuth} from '../contexts/AuthContext';

export default function Register(){
    const [err,setErr]=useState('');
    const {googleLogin}=useAuth();
    const nav=useNavigate();

    async function go(){
        setErr('');
        try{
            await googleLogin();
            nav('/member');
        }catch(x){
            setErr(x.response?.data?.error||x.message||'Google registration failed');
        }
    }

    return <div className="auth-page simple">
        <div className="auth-card">
            <span className="eyebrow">COMMUNITY REGISTRATION</span>
            <h2>Create your member account</h2>
            <p className="muted">Your Google account is used as your secure member identity. You can choose live location or enter your own coordinates after signing in.</p>
            <button className="primary" onClick={go}><FcGoogle size={18}/> Sign up with Google</button>
            {err&&<div className="error">{err}</div>}
            <p className="auth-link"><Link to="/login/member">Back to login</Link></p>
        </div>
    </div>;
}
