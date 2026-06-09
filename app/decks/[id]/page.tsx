import { DeckDetail } from "@/components/decks/DeckDetail";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DeckDetail deckId={id} />;
}
