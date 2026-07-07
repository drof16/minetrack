export default function AuthLayout({ children }) {
    return (
        <main className="min-h-screen bg-muted/40 px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
                {children}
            </div>
        </main>
    );
}
