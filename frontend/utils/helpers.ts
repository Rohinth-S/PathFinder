import { TimelineEvent } from '../types/schema';

/**
 * Extracts exactly 4 (or fewer) key milestones from a user's full timeline
 * for the horizontal mini-timeline UI on the Results Card.
 */
export function extractKeyMilestones(timeline: TimelineEvent[]): TimelineEvent[] {
  if (!timeline || timeline.length === 0) return [];
  if (timeline.length <= 4) return timeline;

  const startNode = timeline[0];
  const endNode = timeline[timeline.length - 1];
  const middleEvents = timeline.slice(1, timeline.length - 1);

  // Prefer nodes with explicit transitions (decision points)
  const decisionNodes = middleEvents.filter(
    ev => ev.expandedDetails?.transitions?.length > 0
  );

  let selected: TimelineEvent[];

  if (decisionNodes.length >= 2) {
    selected = [decisionNodes[0], decisionNodes[decisionNodes.length - 1]];
  } else if (decisionNodes.length === 1) {
    const otherIdx = Math.floor(middleEvents.length / 2);
    const other = middleEvents[otherIdx] === decisionNodes[0]
      ? middleEvents[Math.min(otherIdx + 1, middleEvents.length - 1)]
      : middleEvents[otherIdx];
    selected = [decisionNodes[0], other];
  } else {
    const step = Math.floor(middleEvents.length / 3);
    selected = [middleEvents[step], middleEvents[step * 2]];
  }

  // Dedupe by id
  const seen = new Map<string, TimelineEvent>();
  [startNode, selected[0], selected[1], endNode].forEach(n => {
    if (n?.id) seen.set(n.id, n);
  });

  return Array.from(seen.values());
}
