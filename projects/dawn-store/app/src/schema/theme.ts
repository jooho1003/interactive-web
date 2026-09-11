import { z } from "zod";

const responsive = z.record(z.string(), z.unknown());

export const themeSchema = z.object({
  colors: z.record(z.string(), z.string()),
  font: z.object({
    family: z.string(),
    stack: z.string(),
    weights: z.array(z.number()),
    subsets: z.array(z.string()),
    maxFiles: z.number().int().positive(),
  }),
  arrow: z.object({ desktop: responsive, mobile: responsive }),
  question: z.object({ desktop: responsive, mobile: responsive }),
  menu: z.object({ desktop: responsive, mobile: responsive }),
  hotspot: responsive,
  subtitle: z.object({ desktop: responsive, mobile: responsive }),
  skip: z.object({ desktop: responsive, mobile: responsive }),
  langToggle: z.object({ desktop: responsive, mobile: responsive }),
  mute: z.object({ desktop: responsive, mobile: responsive }),
  timeline: z.object({ desktop: responsive, mobile: responsive }),
  replay: z.object({ desktop: responsive, mobile: responsive }),
  hiddenLink: responsive,
  footer: z.object({ desktop: responsive, mobile: responsive }),
  aiDisclosure: z.object({ desktop: responsive, mobile: responsive }),
  transition: z.record(z.string(), z.unknown()),
  audio: z.record(z.string(), z.unknown()),
  breakpoint: z.object({ mobileMaxWidth: z.number() }),
  zIndex: z.record(z.string(), z.number()),
});

export type Theme = z.infer<typeof themeSchema>;

