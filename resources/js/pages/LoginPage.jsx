import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, csrf } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@minetrack.local');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await csrf();
            await api.post('/login', { email, password });
            window.location.assign('/');
        } catch (exception) {
            setError(exception.response?.data?.message || 'Unable to sign in.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sign in to MineTrack</CardTitle>
                    <CardDescription>Use the seeded admin account to start local testing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <LockKeyhole className="h-4 w-4" />
                            {isSubmitting ? 'Signing in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
