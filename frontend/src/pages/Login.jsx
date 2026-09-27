import {useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {ShieldCheck,Users,Phone,LockKeyhole} from 'lucide-react';
import {FcGoogle} from 'react-icons/fc';
import {useAuth} from '../contexts/AuthContext';

export default function Login(){
    const {role='member'}=useParams();
    const [mobile,setMobile]=useState('');
    const [password,setPassword]=useState('');
    const [err,setErr]=useState('');
    const {login,googleLogin}=useAuth();
    const nav=useNavigate();

    async function submit(e){
        e.preventDefault();
        setErr('');
        try{
            const u=await login({mobile,password,role});
            nav(u.role==='admin'?'/admin':'/member');
        }catch(x){
            setErr(x.response?.data?.error||'Login failed');
        }
    }

    async function google(){
        setErr('');
        try{
            const u=await googleLogin();
            nav(u.role==='admin'?'/admin':'/member');
        }catch(x){
            setErr(x.response?.data?.error||x.message||'Google login failed');
        }
    }

    return <div className="auth-page">
        <div className="auth-visual">
            <div className="grid-glow"/>
            <span className="eyebrow">FLOODGUARD • EARLY WARNING NETWORK</span>
            <h1>Detect early.<br/><em>Respond faster.</em></h1>
            <p>Live sensor telemetry, four-stage alerts and location-aware evacuation guidance in one command surface.</p>
            <div className="auth-stats">
                <span><b>4</b><small>alert levels</small></span>
                <span><b>24/7</b><small>live monitoring</small></span>
                <span><b>LAN</b><small>hardware ready</small></span>
            </div>
        </div>

        <form className="auth-card" onSubmit={submit}>
            <div className="role-switch">
                <Link className={role==='member'?'selected':''} to="/login/member"><Users size={18}/> Member</Link>
                <Link className={role==='admin'?'selected':''} to="/login/admin"><ShieldCheck size={18}/> Admin</Link>
            </div>

            <span className="eyebrow">SECURE ACCESS</span>
            <h2>{role==='admin'?'Admin control':'Community access'}</h2>

            {role==='member'
                ? <>
                    <p className="muted">Members sign in securely with their registered Google account.</p>
                    <button type="button" className="primary" onClick={google}>
                        <FcGoogle size={20}/> Continue with Google
                    </button>
                    <p className="auth-link">New member? <Link to="/register">Create account with Google</Link></p>
                </>
                : <>
                    <p className="muted">Use your mobile number as the username.</p>
                    <label>Mobile number<div className="input"><Phone size={18}/><input value={mobile} onChange={e=>setMobile(e.target.value)} required placeholder="e.g. 9876543210"/></div></label>
                    <label>Password<div className="input"><LockKeyhole size={18}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Your password"/></div></label>
                    <button className="primary">Enter command center</button>
                </>
            }

            {err&&<div className="error">{err}</div>}
        </form>
    </div>;
}
