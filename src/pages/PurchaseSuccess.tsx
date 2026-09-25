import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/utils/analytics";

const DOWNLOAD_URL = "/downloads/grocery-budget-tracker-2026.xlsx";

function triggerDownload() {
  const a = document.createElement("a");
  a.href = DOWNLOAD_URL;
  a.download = "grocery-budget-tracker-2026.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function PurchaseSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "paid" | "error">(sessionId ? "loading" : "error");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverState, setRecoverState] = useState<"idle" | "checking" | "found" | "notfound">("idle");

  useEffect(() => {
    if (!sessionId) return;
    supabase.functions
      .invoke("verify-template-purchase", { body: { session_id: sessionId } })
      .then(({ data, error }) => {
        if (error || !data?.paid) {
          setStatus("error");
        } else {
          setStatus("paid");
          trackEvent("purchase", { value: 5, currency: "USD", item: "grocery_budget_template" });
          triggerDownload();
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  const recover = async () => {
    if (!recoverEmail.trim()) return;
    setRecoverState("checking");
    try {
      const { data, error } = await supabase.functions.invoke("verify-template-purchase", {
        body: { email: recoverEmail.trim() },
      });
      if (!error && data?.paid) {
        setRecoverState("found");
        trackEvent("download_recovered", { item: "grocery_budget_template" });
        triggerDownload();
      } else {
        setRecoverState("notfound");
      }
    } catch {
      setRecoverState("notfound");
    }
  };

  return (
    <div className="container max-w-xl mx-auto px-4 py-16 relative z-10">
      <Helmet>
        <title>Thank You — Grocery Budget Tracker</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Card className="p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Confirming your payment…</h1>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">You're all set!</h1>
            <p className="text-muted-foreground">
              Your download should have started automatically. If it didn't, use the button below.
            </p>
            <a href="/downloads/grocery-budget-tracker-2026.xlsx" download>
              <Button size="lg" className="w-full text-lg">
                <Download className="h-5 w-5 mr-2" />
                Download your template
              </Button>
            </a>
            <p className="text-sm text-muted-foreground">
              Opens in Excel and Google Sheets (File → Import → Upload).
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              We couldn't confirm your payment. If you were charged, contact us and we'll sort it out.
            </p>
            <Link to="/">
              <Button variant="outline">Back to the calculator</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
