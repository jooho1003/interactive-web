import { z } from "zod";

export const i18nSchema = z.object({ ko: z.string(), en: z.string() });

export const timecodeSchema = z.string().regex(/^\d{2}:\d{2}(\.\d)?$/);

const transformSchema = z.object({
  scale: z.number().positive(),
  x: z.number(),
  y: z.number(),
});

const mediaSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("still"),
    src: z.string().min(1),
    duration: z.number().positive(),
    kenBurns: z.object({ from: transformSchema, to: transformSchema }).optional(),
  }),
  z.object({
    kind: z.literal("video"),
    src: z.string().min(1),
    duration: z.number().positive(),
    poster: z.string().optional(),
  }),
]);

const hotspotSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().positive().max(100),
  h: z.number().positive().max(100),
});

const boxSchema = hotspotSchema;

const arrowSchema = z.enum(["left", "up", "right"]);

const edgeSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string().min(1),
    kind: z.literal("arrow"),
    arrow: arrowSchema,
    to: z.string().min(1),
  }),
  z.object({
    id: z.string().min(1),
    kind: z.literal("menu"),
    text: i18nSchema,
    to: z.string().min(1),
    arrow: arrowSchema.optional(),
    hotspot: hotspotSchema.optional(),
  }),
  z.object({
    id: z.string().min(1),
    kind: z.literal("hidden"),
    from: timecodeSchema,
    until: timecodeSchema,
    to: z.string().min(1),
    box: z.object({ desktop: boxSchema, mobile: boxSchema }),
    previewEnabled: z.boolean().optional(),
  }),
]);

const cueSchema = z.object({
  start: timecodeSchema,
  end: timecodeSchema,
  text: z.string(),
  fadeIn: z.boolean().optional(),
  fadeOut: z.boolean().optional(),
});

const nodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["intro", "hub", "branch", "link", "ending"]),
  title: i18nSchema,
  media: mediaSchema,
  available: z.boolean(),
  loop: z.boolean().optional(),
  skippable: z.boolean(),
  buttonShowBeforeEnd: z.number().nonnegative(),
  setsFlag: z.string().optional(),
  question: i18nSchema.optional(),
  edges: z.array(edgeSchema),
  glow: z.object({
    primary: z.string().nullable(),
    secondary: z.string().nullable().optional(),
    switchWhen: z.array(z.string()).optional(),
  }).optional(),
  timeline: z.object({
    chapters: z.array(z.object({ at: timecodeSchema, title: i18nSchema })),
  }).optional(),
  subtitles: z.object({ ko: z.array(cueSchema), en: z.array(cueSchema) }).optional(),
  audio: z.object({ bgm: z.enum(["on", "off", "resumeAtEnd"]) }).optional(),
});

export const storySchema = z.object({
  meta: z.object({
    id: z.string(),
    title: i18nSchema,
    subtitle: i18nSchema,
    creator: z.string(),
    creatorLink: z.string(),
    aiDisclosure: i18nSchema,
    defaultLang: z.enum(["ko", "en"]),
    langs: z.array(z.enum(["ko", "en"])),
  }),
  start: z.string(),
  nodes: z.array(nodeSchema),
});

export type Story = z.infer<typeof storySchema>;
export type Node = Story["nodes"][number];
export type Edge = Node["edges"][number];
export type MenuEdge = Extract<Edge, { kind: "menu" }>;
export type HiddenEdge = Extract<Edge, { kind: "hidden" }>;
export type Lang = Story["meta"]["defaultLang"];

