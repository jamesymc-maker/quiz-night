import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { RoundMarquee } from "@/components/RoundMarquee";

export default function DesignPage() {
  return (
    <div className="min-h-screen spotlight-bg">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
        <div className="text-center">
          <Link href="/" className="text-muted hover:text-cream text-sm">
            Back to home
          </Link>
          <h1 className="font-display text-3xl font-bold text-gold mt-4">
            Design preview
          </h1>
        </div>

        <div className="flex justify-center">
          <RoundMarquee
            roundNumber={2}
            totalRounds={5}
            title="Geography"
            topic="Capital cities of Europe"
            level="adult"
          />
        </div>

        <QuestionCard
          questionText="What is the capital of France?"
          options={["London", "Paris", "Berlin", "Madrid"]}
          correctIndex={1}
          questionNumber={3}
          totalQuestions={10}
          showRevealButton={false}
        />

        <div className="flex justify-center">
          <RoundMarquee
            roundNumber={4}
            totalRounds={5}
            title="Emma's Specialist Round"
            topic="Harry Potter"
            level="junior"
            isSpecialist
            playerName="Emma"
          />
        </div>
      </div>
    </div>
  );
}
