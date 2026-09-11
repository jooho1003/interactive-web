import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { storySchema, type Story } from "../src/schema/story";
import { parseTimecode } from "../src/graph/time";

const root = resolve(import.meta.dirname, "..");
const story = storySchema.parse(JSON.parse(await readFile(resolve(root, "public/story.json"), "utf8")));
const nodeMap = new Map(story.nodes.map((node) => [node.id, node]));
const errors: string[] = [];
const warnings: string[] = [];

function error(message: string) {
  errors.push(message);
}

function validateEdges(current: Story["nodes"][number]) {
  for (const edge of current.edges) {
    if (!nodeMap.has(edge.to)) {
      error(`${current.id}/${edge.id}: destination '${edge.to}' does not exist`);
      continue;
    }
    const destination = nodeMap.get(edge.to)!;
    if (!destination.available) {
      warnings.push(`${current.id}/${edge.id}: destination '${edge.to}' is unavailable`);
    }
    if (edge.kind === "hidden" && parseTimecode(edge.until) > current.media.duration) {
      error(`${current.id}/${edge.id}: hidden link ends after media duration`);
    }
  }
}

function validateTiming(current: Story["nodes"][number]) {
  for (const language of ["ko", "en"] as const) {
    for (const cue of current.subtitles?.[language] ?? []) {
      if (parseTimecode(cue.start) >= parseTimecode(cue.end)) {
        error(`${current.id}/${language}: subtitle start must be before end`);
      }
      if (parseTimecode(cue.end) > current.media.duration) {
        error(`${current.id}/${language}: subtitle ends after media duration`);
      }
    }
  }
  for (const chapter of current.timeline?.chapters ?? []) {
    if (parseTimecode(chapter.at) > current.media.duration) {
      error(`${current.id}: chapter '${chapter.title.en}' is after media duration`);
    }
  }
}

function validateGraph() {
  if (!nodeMap.has(story.start)) error(`start node '${story.start}' does not exist`);

  const incoming = new Set<string>();
  for (const node of story.nodes) {
    validateEdges(node);
    validateTiming(node);
    for (const edge of node.edges) incoming.add(edge.to);
    if (node.type === "ending" && node.edges.some((edge) => edge.kind !== "hidden")) {
      error(`${node.id}: ending nodes cannot have regular outgoing edges`);
    }
    const edgeIds = new Set<string>();
    for (const edge of node.edges) {
      if (edgeIds.has(edge.to)) warnings.push(`${node.id}: multiple edges point to '${edge.to}'`);
      edgeIds.add(edge.to);
    }
  }

  for (const node of story.nodes) {
    if (node.id !== story.start && !incoming.has(node.id)) {
      error(`${node.id}: only start may have no incoming edges`);
    }
  }

  const reachable = new Set<string>();
  const queue = [story.start];
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    const node = nodeMap.get(id);
    for (const edge of node?.edges ?? []) {
      if (nodeMap.get(edge.to)?.available) queue.push(edge.to);
    }
  }
  for (const node of story.nodes) {
    if (node.available && !reachable.has(node.id)) {
      error(`${node.id}: available node is unreachable from start`);
    }
  }
}

validateGraph();
if (warnings.length) warnings.forEach((message) => console.warn(`WARN ${message}`));
if (errors.length) {
  errors.forEach((message) => console.error(`ERROR ${message}`));
  process.exitCode = 1;
} else {
  console.log(`Graph valid: ${story.nodes.length} nodes, ${warnings.length} warning(s).`);
}

