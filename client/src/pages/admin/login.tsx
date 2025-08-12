import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const handleGoogleSignIn = () => {
    // In production, this would redirect to NextAuth Google OAuth
    window.location.href = '/api/auth/signin/google';
  };

  return (
    <div className="min-h-screen bg-yulife-soft">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
              <p className="text-gray-600 mb-8">Please sign in with your organization email to continue.</p>
              
              <Button
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-6 rounded-2xl font-semibold text-lg bg-yulife-indigo hover:bg-yulife-purple"
              >
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
