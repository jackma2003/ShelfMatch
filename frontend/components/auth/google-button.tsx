import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function GoogleButton() {
  return (
    <Button
      render={<a href={`${API_URL}/api/auth/google`} />}
      nativeButton={false}
      type="button"
      variant="outline"
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}
