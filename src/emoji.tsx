const capacityEmoji = [
  { max: 1, emoji: "🧍" },
  { max: 2, emoji: "🚲" },
  { max: 3, emoji: "🛺" },
  { max: 5, emoji: "🚗" },
  { max: 8, emoji: "🚐" },
  { max: 12, emoji: "🎈" },
  { max: 18, emoji: "🚤" },
  { max: 25, emoji: "🚎" },
  { max: 40, emoji: "🚌" },
  { max: 60, emoji: "🚌" },
  { max: 100, emoji: "🚍" },
  { max: 200, emoji: "✈️" },
  { max: 500, emoji: "✈️" },
  { max: Infinity, emoji: "🏟️" },
];

export function ReprIdeaCount(listCount: number) {

  const match = capacityEmoji.find(({ max }) => listCount <= max);

  return (<span>{match?.emoji} idea(s)</span>)
}