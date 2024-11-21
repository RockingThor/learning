import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { toast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace this with your actual API call
      const response = await fetch("http://localhost:3000/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setShortUrl(data.shortUrl);
      toast({
        title: "URL Shortened",
        description: "Your URL has been successfully shortened!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error shortening your URL. Please try again.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-center mb-20">
        URL Shortener with Distributed Caching
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row justify-center gap-4 "
      >
        <div className="max-w-[500px] min-w-[50vh] flex flex-col justify-start gap-2">
          <Label htmlFor="url" className="mr-auto">
            Enter your long URL
          </Label>
          <Input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
          />
        </div>
        <Button type="submit" className="mt-auto">
          Shorten URL
        </Button>
      </form>
      {shortUrl && (
        <div className="mt-4 flex flex-row justify-center items-center gap-1">
          <Label htmlFor="shortUrl" className="font-semibold">
            Your shortened URL
          </Label>
          <div className="flex mt-1">
            <Input
              type="text"
              id="shortUrl"
              value={shortUrl}
              readOnly
              className="max-w-[400px]"
            />
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
                toast({
                  title: "Copied!",
                  description:
                    "The shortened URL has been copied to your clipboard.",
                });
              }}
              className="ml-2"
            >
              Copy
            </Button>
          </div>
          <Toaster />
        </div>
      )}
    </div>
  );
}

export default App;
