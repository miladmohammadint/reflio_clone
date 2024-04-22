import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoadingDots from '@/components/LoadingDots';
import { useUser } from '@/utils/useUser';
import { SEOMeta } from '@/templates/SEOMeta'; 
import { AuthForm } from '@/components/AuthForm';
import Testimonials from '@/components/Testimonials';
import { signin, signup } from '/pages/api/auth';

const AuthTemplate = ({ type }) => {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    let authState = type === 'signin' ? "Sign in" : type === "signup" ? "Sign up" : "Sign in";

    useEffect(() => {
        if (user) {
            router.replace('/dashboard');
        }
    }, [user]);

    const handleSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const { email, password } = data;
            
            let authFunction;
            if (type === 'signin') {
                authFunction = signin;
            } else if (type === 'signup') {
                authFunction = signup;
            }

            const response = await authFunction(email, password);

            // No redirection logic here
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user)
        return (
            <>
                <SEOMeta title={authState}/>
                <div className="py-24 px-4 bg-white md:bg-gradient-to-b md:from-gray-100 md:to-white">
                    <div className="p-10 rounded-xl bg-white border-4 border-gray-200 max-w-lg mx-auto">
                        <AuthForm onSubmit={handleSubmit} error={error} type={type} loading={loading}/>
                    </div>
                </div>
                <div className="py-12 border-t-4 border-dashed">
                    <div className="wrapper">
                        <Testimonials/>
                    </div>
                </div>
            </>
        );

    return (
        <>
            <SEOMeta title="Sign Up"/>
            <div className="m-6">
                <LoadingDots />
            </div>
        </>
    );
};

export default AuthTemplate;
