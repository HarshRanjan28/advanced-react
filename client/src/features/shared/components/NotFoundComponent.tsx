import { AlertTriangle } from "lucide-react";
import Card from "./ui/Card";

export function NotFoundComponent() {
  return (
    <Card className="flex flex-col items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <p>The Page you are looing for does not exists</p>
    </Card>
  );
}
