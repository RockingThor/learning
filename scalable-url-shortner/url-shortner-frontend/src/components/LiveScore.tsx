"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface GoalEvent {
  id: string;
  score: string;
  homeTeam: string;
  awayTeam: string;
  scorer: string;
  timestamp: string;
}

function useSSE(url: string) {
  const [data, setData] = useState<GoalEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.addEventListener("goal", (event) => {
      const goalData = JSON.parse(event.data);
      setData((prevData) => [goalData, ...prevData].slice(0, 10));
    });

    return () => {
      eventSource.close();
    };
  }, [url]);

  return data;
}

export default function LiveScore() {
  const goals = useSSE("http://localhost:8080/api/events/123"); // Replace with your actual SSE endpoint

  const latestGoal = goals[0];

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Live Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestGoal && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">{latestGoal.score}</div>
              <div className="text-xl">
                {latestGoal.homeTeam} vs {latestGoal.awayTeam}
              </div>
            </div>
          )}
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{goal.scorer} scores!</div>
                      <div className="text-sm text-muted-foreground">
                        {goal.score}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {goal.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
