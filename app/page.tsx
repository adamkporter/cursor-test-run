import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-4">
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Adam Porter</CardTitle>
          <CardDescription className="text-xl">Software Engineer</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            I&apos;m a software engineer with a passion for building products that help people live better lives.
          </p>
          <p className="text-muted-foreground">
            I&apos;m currently working at <a href="https://www.google.com" className="text-primary hover:underline">Google</a> as a software engineer.
          </p>
          <div className="flex justify-center pt-4">
            <Button variant="outline">
              Get in Touch
            </Button>
          </div>
        </CardContent>

      </Card>
    </div>
  )
}