import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Input } from "../components/Input";
import { BACKEND_URL } from "../config";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeOffIcon } from "../icons/EyeOffIcon";
import { signinSchema } from "../validation/auth";

export function Signin(){
    
    const usernameRef=useRef<HTMLInputElement>(null);
    const passwordRef=useRef<HTMLInputElement>(null);
    const navigate=useNavigate();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    async function signin(){
        const username=usernameRef.current?.value;
        const password=passwordRef.current?.value;
        
        // Clear previous errors
        setErrors({});
        
        // Validate form data using safeParse
        const result = signinSchema.safeParse({ username, password });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as string | undefined;
                if (field) {
                    fieldErrors[field] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }
        
        try {
            setIsLoading(true);
            const response=await axios.post(BACKEND_URL +"/api/v1/signin",{
                username: result.data.username,
                password: result.data.password
            });
            const jwt=response.data.token;
            localStorage.setItem("token",jwt)
            navigate("/dashboard")
        } catch (error: unknown) {
            console.error('Signin error:', error);
            const apiError = error as { response?: { data?: { msg?: string } } };
            alert(apiError.response?.data?.msg || 'Signin failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    return <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex justify-center items-center p-2 sm:p-4">
        <div className="w-full max-w-xs sm:max-w-md rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-indigo-100 p-6 sm:p-8 md:p-10 ">
            <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">LinkVault</h1>
            </div>
            <div className={errors.username ? "mb-4" : "mb-3"}>
                <Input 
                    reference={usernameRef} 
                    placeholder="Username"
                />{errors.username && <p className="text-red-500 text-xs mt-1 ml-2">{errors.username}</p>}
            </div>
            <div className={errors.password ? "mb-4" : "mb-3"}>
                <div className="relative">
                    <Input 
                        reference={passwordRef} 
                        placeholder="Password" 
                        type={showPassword ? "text" : "password"}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-2">{errors.password}</p>}
            </div>
            <div className="flex justify-center pt-4">
                <Button 
                    onClick={signin} 
                    variant="primary" 
                    text="Sign in" 
                    fullWidth 
                    loading={isLoading}
                    className="transition-colors duration-200 hover:bg-indigo-600 active:bg-indigo-700"
                >
                </Button>
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
                New here? <button onClick={() => navigate("/signup")} className="text-indigo-600 hover:text-indigo-700 font-medium">Create an account</button>
            </div>
        
        </div>
    </div>
}