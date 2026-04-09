import { meridiansData } from '../data/meridians';

// 1. A list of interesting TCM Facts
const TCM_FACTS = [
  "In TCM, the 'Kidney' is not just an organ but the root of energy and reproduction.",
  "The tongue is considered the map of the internal body in TCM diagnosis.",
  "Acupuncture needles are often thinner than a human hair.",
  "Qi (pronounced 'chee') is the vital energy that flows through meridians.",
  "The liver is associated with the emotion of anger and stress in TCM.",
  "Cupping therapy helps pull toxins out of the body and improve circulation.",
  "TCM follows the circadian clock; 3 AM to 5 AM is 'Lung Time'.",
  "Yin and Yang are opposite forces that must be balanced for health.",
  "Ginger is considered a 'warming' herb used to expel cold and improve digestion.",
  "The ears contain acupuncture points that map to the entire body (Auriculotherapy).",
  "Dampness is a concept in TCM often caused by eating too much sugar or dairy.",
  "The Heart is considered the 'Emperor' of all organs in Chinese Medicine."
];

// 2. The Logic Function
export function getDailyContent() {
  // A. Get the "Day of the Year" (1 to 365)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // B. Get All Points into one big list
  // We flatten the meridian array to get just the points
  const allPoints = meridiansData.flatMap(meridian => meridian.points);

  // C. Pick a Point based on the date
  // We use the remainder (%) operator so it cycles through the list repeatedly
  const pointIndex = dayOfYear % allPoints.length;
  const dailyPoint = allPoints[pointIndex];

  // D. Pick a Fact based on the date
  const factIndex = dayOfYear % TCM_FACTS.length;
  const dailyFact = TCM_FACTS[factIndex];

  return { dailyPoint, dailyFact };
}