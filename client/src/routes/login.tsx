import { LoginForm } from '@/features/auth/components/loginForm'
import Card from '@/features/shared/components/ui/Card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return <main>
    <Card>
      <LoginForm/>
    </Card>
  </main>
}
