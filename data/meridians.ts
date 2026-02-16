import type { Meridian } from '../types/tcm';

export const meridiansData: Meridian[] = [
  {
    id: 'lung',
    name: 'Lung Meridian',
    element: 'Metal',
    yinYang: 'yin',
    description:
      'The Lung Meridian governs respiration and the distribution of Qi and body fluids. It is associated with the metal element and influences the skin and immune defense.',
    peakTime: '3–5 AM',
    points: [
      {
        code: 'LU1',
        name: 'Zhongfu (Central Palace)',
        locationText:
          'On the lateral aspect of the chest, in the first intercostal space, 6 cun lateral to the anterior midline, approximately level with the first rib.',
        benefits: [
          'Regulates Lung Qi and relieves cough',
          'Clears heat and benefits the throat',
          'Opens the chest and eases breathing',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Perpendicular insertion 0.5–1 cun. Avoid deep needling over the lung.',
            safetyNote: 'Do not needle deeply; risk of pneumothorax. Contraindicated in pregnancy at this point in some traditions.',
          },
          {
            type: 'pressure',
            description: 'Apply firm circular pressure for 1–2 minutes to tonify Lung Qi.',
            safetyNote: 'Use gentle pressure over the chest; avoid if ribs are injured.',
          },
        ],
        isLocked: false,
      },
      {
        code: 'LU9',
        name: 'Taiyuan (Supreme Abyss)',
        locationText:
          'At the wrist crease, in the depression on the radial side of the radial artery, between the scaphoid and radius.',
        benefits: [
          'Tonifies Lung Qi and nourishes Lung Yin',
          'Regulates the pulse and calms the spirit',
          'Benefits the throat and voice',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Perpendicular insertion 0.3–0.5 cun. Avoid the radial artery.',
            safetyNote: 'Do not needle through the radial artery. Check pulse before and after.',
          },
          {
            type: 'seed',
            description: 'Apply vaccaria seed with gentle pressure; replace every 3–5 days.',
            safetyNote: 'Ensure skin is clean and dry; remove if irritation occurs.',
          },
        ],
        isLocked: false,
      },
      {
        code: 'LU7',
        name: 'Lieque (Broken Sequence)',
        locationText:
          '1.5 cun above the wrist crease, in the depression between the tendons of extensor pollicis longus and brevis, on the radial side of the radius.',
        benefits: [
          'Releases the exterior and dispels wind-cold',
          'Opens the Lung and benefits the head and neck',
          'Useful for headache, neck stiffness, and cough',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Oblique insertion 0.5–0.8 cun toward the elbow or LI4.',
            safetyNote: 'Avoid excessive depth; point is often used in combination with LI4.',
          },
          {
            type: 'pressure',
            description: 'Press with thumb for 1–2 minutes; can be used for acute headache or cold symptoms.',
            safetyNote: 'Generally safe; reduce pressure if pain or numbness increases.',
          },
        ],
        isLocked: false,
      },
    ],
  },
  {
    id: 'large-intestine',
    name: 'Large Intestine Meridian',
    element: 'Metal',
    yinYang: 'yang',
    description:
      'The Large Intestine Meridian is responsible for receiving waste from the Small Intestine, reabsorbing fluids, and eliminating stool. It pairs with the Lung as the Metal element meridians.',
    peakTime: '5–7 AM',
    points: [
      {
        code: 'LI4',
        name: 'Hegu (Union Valley)',
        locationText:
          'On the dorsum of the hand, between the first and second metacarpal bones, in the middle of the second metacarpal bone on the radial side, at the highest point of the muscle when the thumb and index finger are brought together.',
        benefits: [
          'Dispels wind and releases the exterior',
          'Regulates the face and head; relieves pain',
          'Promotes labor and regulates Qi (use with caution in pregnancy)',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Perpendicular insertion 0.5–1 cun. Strong sensation (de qi) often obtained.',
            safetyNote: 'Contraindicated in pregnancy (may stimulate uterine contractions). Avoid in bleeding disorders.',
          },
          {
            type: 'pressure',
            description: 'Apply firm pressure with thumb for 1–2 minutes for headache or facial pain.',
            safetyNote: 'Avoid strong, sustained pressure in pregnancy.',
          },
        ],
        isLocked: false,
      },
      {
        code: 'LI11',
        name: 'Quchi (Pool at the Bend)',
        locationText:
          'At the lateral end of the transverse cubital crease when the elbow is flexed at 90°, midway between LU5 and the lateral epicondyle of the humerus.',
        benefits: [
          'Clears heat and cools the blood',
          'Dispels wind-damp and benefits the joints',
          'Regulates the intestines and supports immunity',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Perpendicular insertion 1–1.5 cun. Good for fever and elbow pain.',
            safetyNote: 'Avoid deep needling toward the joint cavity; may cause bleeding in some individuals.',
          },
          {
            type: 'magnet',
            description: 'Apply small magnet for 24–48 hours to tonify or sedate depending on polarity.',
            safetyNote: 'Remove if skin becomes irritated; avoid in those with pacemakers if using strong magnets.',
          },
        ],
        isLocked: false,
      },
      {
        code: 'LI10',
        name: 'Shousanli (Arm Three Miles)',
        locationText:
          '2 cun below LI11 (Quchi), on the line connecting LI11 with LI5 (Yangxi), on the radial side of the radius.',
        benefits: [
          'Regulates Qi and blood in the arm',
          'Benefits the Large Intestine and relieves abdominal discomfort',
          'Strengthens the arm and relieves pain along the channel',
        ],
        stimulation: [
          {
            type: 'needle',
            description: 'Perpendicular insertion 0.5–1 cun.',
            safetyNote: 'Generally safe; avoid if there is local infection or injury.',
          },
          {
            type: 'pressure',
            description: 'Press or massage along the channel for 2–3 minutes to move Qi.',
            safetyNote: 'Use moderate pressure; discontinue if numbness or tingling persists.',
          },
        ],
        isLocked: false,
      },
    ],
  },
];
