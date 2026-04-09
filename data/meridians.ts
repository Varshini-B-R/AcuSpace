import { TCMMeridian } from '../types/tcm';

export const meridiansData: TCMMeridian[] = [
  // 1. LUNG MERIDIAN
  {
    id: 'lung',
    name: 'Lung Meridian',
    element: 'Metal',
    type: 'Yin',
    description: 'The Lung Meridian governs respiration and creates the rhythm of life. It regulates the Wei Qi (Defensive Qi) that protects against colds and flu.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'LU11',
        name: 'Shao Shang (Lesser Shang)',
        shuPoint: 'Jing-Well',
        locationText: 'On the radial side of the thumb, 0.1 cun posterior to the corner of the nail.',
        benefits: ['Revives consciousness', 'Helps in respiratory attack', 'Relieves acute sore throat'],
        stimulationMethod: ['Needle', 'Pressure', 'Pricking to bleed'],
        safetyNote: 'Can be very painful to needle.',
        imageUrl: require('../assets/images/LU11.jpg')
      },
      {
        code: 'LU10',
        name: 'Yu Ji (Fish Border)',
        shuPoint: 'Ying-Spring',
        locationText: 'On the palmar surface of the thumb, midpoint of the 1st metacarpal bone.',
        benefits: ['Clears Lung heat', 'Benefits the throat', 'Relieves cough'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LU10.png')
      },
      {
        code: 'LU9',
        name: 'Tai Yuan (Supreme Abyss)',
        shuPoint: 'Shu-Stream',
        locationText: 'At the wrist crease, on the radial artery.',
        benefits: ['Tonifies Lung Qi', 'Promotes circulation', 'Transforms phlegm'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Caution: Avoid the radial artery during needling.',
        imageUrl: require('../assets/images/LU9.jpg')
      },
      {
        code: 'LU8',
        name: 'Jing Qu (Channel Canal)',
        shuPoint: 'Jing-River',
        locationText: '1 cun above the wrist crease on the radial artery.',
        benefits: ['Descends Lung Qi', 'Alleviates cough and wheezing'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Caution: Avoid the radial artery.',
        imageUrl: require('../assets/images/lu8.jpg')
      },
      {
        code: 'LU5',
        name: 'Chi Ze (Cubit Marsh)',
        shuPoint: 'He-Sea',
        locationText: 'At the elbow crease, on the radial side of the biceps tendon.',
        benefits: ['Clears heat from the Lung', 'Relaxes sinews', 'Descends rebellious Qi'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/lu5.png')
      }
    ]
  },

  // 2. LARGE INTESTINE MERIDIAN
  {
    id: 'li',
    name: 'Large Intestine Meridian',
    element: 'Metal',
    type: 'Yang',
    description: 'The Large Intestine Meridian is responsible for receiving and discharging waste, letting go of what is no longer needed physically and emotionally.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'LI1',
        name: 'Shang Yang (Metal Yang)',
        shuPoint: 'Jing-Well',
        locationText: 'Radial side of the index finger, 0.1 cun posterior to the corner of the nail.',
        benefits: ['Revives consciousness', 'Alleviates finger pain', 'Relieves facial pain'],
        stimulationMethod: ['Needle', 'Pressure', 'Bleeding'],
        safetyNote: 'Painful to needle.',
        imageUrl: require('../assets/images/LI1.png')
      },
      {
        code: 'LI2',
        name: 'Er Jian (Second Space)',
        shuPoint: 'Ying-Spring',
        locationText: 'Radial side of the index finger, distal to the 2nd metacarpophalangeal joint.',
        benefits: ['Expels wind', 'Clears heat', 'Reduces swelling', 'Reduces fever', 'Relieves tooth pain'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LI2.png')
      },
      {
        code: 'LI3',
        name: 'San Jian (Third Space)',
        shuPoint: 'Shu-Stream',
        locationText: 'Radial side of the index finger, proximal to the 2nd metacarpophalangeal joint.',
        benefits: ['Benefits eyes and throat', 'Dispels fullness', 'Relieves neck pain'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/LI3.png')
      },
      {
        code: 'LI5',
        name: 'Yang Xi (Yang Ravine)',
        shuPoint: 'Jing-River',
        locationText: 'In the anatomical snuffbox at the wrist joint.',
        benefits: ['Clears heat', 'Calms the spirit', 'Benefits the wrist', 'Relieves shoulder pain'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LI5.png')
      },
      {
        code: 'LI11',
        name: 'Qu Chi (Pool at the Crook)',
        shuPoint: 'He-Sea',
        locationText: 'At the lateral end of the transverse cubital crease.',
        benefits: ['Clears heat all over the body', 'Cools blood', 'Resolves dampness', 'Good for skin disorders'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/LI11.png')
      }
    ]
  },

  // 3. STOMACH MERIDIAN
  {
    id: 'st',
    name: 'Stomach Meridian',
    element: 'Earth',
    type: 'Yang',
    description: 'Responsible for digestion, assimilation, and the extraction of energy from food. It grounds us to the earth.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'ST45',
        name: 'Li Dui (Strict Exchange)',
        shuPoint: 'Jing-Well',
        locationText: 'Lateral side of the 2nd toe, 0.1 cun from the corner of the nail.',
        benefits: ['Calms the spirit', 'Clears sudden heat from the Stomach', 'Restores consciousness'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/ST45.jpg')
      },
      {
        code: 'ST44',
        name: 'Nei Ting (Inner Courtyard)',
        shuPoint: 'Ying-Spring',
        locationText: 'Between the 2nd and 3rd toes, at the web margin.',
        benefits: ['Clears heat', 'Resolves damp-heat', 'Relieves toothache and facial pain', 'Relieves headache'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/ST44.png')
      },
      {
        code: 'ST43',
        name: 'Xian Gu (Sunken Valley)',
        shuPoint: 'Shu-Stream',
        locationText: 'Dorsum of foot, between 2nd and 3rd metatarsal bones.',
        benefits: ['Regulates Spleen', 'Dispels edema', 'Relieves abdominal pain', 'Good for speech and voice disorders'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/ST43.png')
      },
      {
        code: 'ST41',
        name: 'Jie Xi (Ravine Divide)',
        shuPoint: 'Jing-River',
        locationText: 'On the dorsum of the ankle, in the depression between tendons.',
        benefits: ['Clears heat', 'Calms the spirit', 'Benefits the ankle joint', 'Relieves ankle pain'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/ST41.png')
      },
      {
        code: 'ST36',
        name: 'Zu San Li (Leg Three Miles)',
        shuPoint: 'He-Sea',
        locationText: '3 cun below ST35, one finger width lateral from the anterior crest of the tibia.',
        benefits: ['Tonifies Qi and Blood', 'Harmonizes the Stomach', 'Boosts immune system', 'Increases the natural steroids in the body'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/ST36.png')
      }
    ]
  },

  // 4. SPLEEN MERIDIAN
  {
    id: 'sp',
    name: 'Spleen Meridian',
    element: 'Earth',
    type: 'Yin',
    description: 'Transforms and transports food essence and fluids. It governs the blood and muscles.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'SP1',
        name: 'Yin Bai (Hidden White)',
        shuPoint: 'Jing-Well',
        locationText: 'Medial side of the big toe, 0.1 cun from the corner of the nail.',
        benefits: ['Stops bleeding', 'Calms the spirit', 'Regulates the Spleen'],
        stimulationMethod: ['Needle', 'Moxa'],
        imageUrl: require('../assets/images/SP1.png')
      },
      {
        code: 'SP2',
        name: 'Da Du (Great Metropolis)',
        shuPoint: 'Ying-Spring',
        locationText: 'Medial side of the big toe, distal to the 1st metatarsophalangeal joint.',
        benefits: ['Clears damp-heat', 'Harmonizes the middle jiao'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SP2.png')
      },
      {
        code: 'SP3',
        name: 'Tai Bai (Supreme White)',
        shuPoint: 'Shu-Stream',
        locationText: 'Medial side of the foot, proximal to the 1st metatarsophalangeal joint.',
        benefits: ['Tonifies the Spleen', 'Resolves dampness', 'Regulates Qi'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/SP3.png')
      },
      {
        code: 'SP5',
        name: 'Shang Qiu (Shang Mound)',
        shuPoint: 'Jing-River',
        locationText: 'Medial side of the ankle, anterior and inferior to the medial malleolus.',
        benefits: ['Strengthens the Spleen', 'Benefits the sinews and joints'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SP5.png')
      },
      {
        code: 'SP9',
        name: 'Yin Ling Quan (Yin Mound Spring)',
        shuPoint: 'He-Sea',
        locationText: 'Medial side of the lower leg, below the medial condyle of the tibia.',
        benefits: ['Resolves dampness', 'Regulates the Spleen', 'Opens water passages', 'Alleviates edema'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SP9.png')
      }
    ]
  },

  // 5. HEART MERIDIAN
  {
    id: 'ht',
    name: 'Heart Meridian',
    element: 'Fire',
    type: 'Yin',
    description: 'Houses the mind (Shen) and governs blood and blood vessels. Deeply connected to joy and sleep.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'HT9',
        name: 'Shao Chong (Lesser Rushing)',
        shuPoint: 'Jing-Well',
        locationText: 'Radial side of the little finger, 0.1 cun from the corner of the nail.',
        benefits: ['Revives consciousness', 'Clears heat', 'Calms the spirit'],
        stimulationMethod: ['Needle', 'Pressure', 'Bleeding'],
        imageUrl: require('../assets/images/HT9.png')
      },
      {
        code: 'HT8',
        name: 'Shao Fu (Lesser Mansion)',
        shuPoint: 'Ying-Spring',
        locationText: 'Palmar surface, between the 4th and 5th metacarpal bones.',
        benefits: ['Clears Heart heat', 'Solves insomnia', 'Reduces anxiety'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/HT8.jpg')
      },
      {
        code: 'HT7',
        name: 'Shen Men (Spirit Gate)',
        shuPoint: 'Shu-Stream',
        locationText: 'At the ulnar end of the transverse crease of the wrist.',
        benefits: ['Tonifies Heart Blood', 'Relieves insomnia', 'Calms the mind'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/HT7.jpg')
      },
      {
        code: 'HT4',
        name: 'Ling Dao (Spirit Path)',
        shuPoint: 'Jing-River',
        locationText: '1.5 cun above the wrist crease on the radial side of flexor carpi ulnaris.',
        benefits: ['Calms the spirit', 'Reduces restlessness', 'Relieves sudden loss of voice'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/HT4.png')
      },
      {
        code: 'HT3',
        name: 'Shao Hai (Lesser Sea)',
        shuPoint: 'He-Sea',
        locationText: 'Medial end of the transverse cubital crease when elbow is flexed.',
        benefits: ['Transforms phlegm', 'Clears heat', 'Helps with long term sleep issues'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/HT3.jpg')
      }
    ]
  },

  // 6. SMALL INTESTINE MERIDIAN
  {
    id: 'si',
    name: 'Small Intestine Meridian',
    element: 'Fire',
    type: 'Yang',
    description: 'Separates the pure from the impure, aiding in both physical digestion and mental clarity.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'SI1',
        name: 'Shao Ze (Lesser Marsh)',
        shuPoint: 'Jing-Well',
        locationText: 'Ulnar side of the little finger, 0.1 cun from the corner of the nail.',
        benefits: ['Promotes lactation', 'Improves mental clarity', 'Revives consciousness'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SI1.png')
      },
      {
        code: 'SI2',
        name: 'Qian Gu (Front Valley)',
        shuPoint: 'Ying-Spring',
        locationText: 'Ulnar edge of the little finger, distal to the 5th metacarpophalangeal joint.',
        benefits: ['Clears heat', 'Benefits the eyes and ears', 'Clears inflammation'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SI2.png')
      },
      {
        code: 'SI3',
        name: 'Hou Xi (Back Stream)',
        shuPoint: 'Shu-Stream',
        locationText: 'Ulnar edge of the hand, proximal to the 5th metacarpophalangeal joint.',
        benefits: ['Benefits the spine', 'Clears the mind', 'Relieves neck stiffness'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/SI3.png')
      },
      {
        code: 'SI5',
        name: 'Yang Gu (Yang Valley)',
        shuPoint: 'Jing-River',
        locationText: 'Ulnar border of the wrist, in the depression between the styloid process and triquetrum.',
        benefits: ['Benefits chest pain', 'Calms the spirit', 'Reduces swelling'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/SI5.png')
      },
      {
        code: 'SI8',
        name: 'Xiao Hai (Small Sea)',
        shuPoint: 'He-Sea',
        locationText: 'In the depression between the olecranon and medial epicondyle.',
        benefits: ['Calms the spirit', 'Resolves damp-heat', 'Relieves elbow pain', 'Clears long standing confusion'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Ulnar nerve runs directly through this area.',
        imageUrl: require('../assets/images/SI8.png')
      }
    ]
  },

  // 7. BLADDER MERIDIAN
  {
    id: 'bl',
    name: 'Urinary Bladder Meridian',
    element: 'Water',
    type: 'Yang',
    description: 'Stores and excretes urine, and is the longest meridian in the body, running down the entire back.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'UB67',
        name: 'Zhi Yin (Reaching Yin)',
        shuPoint: 'Jing-Well',
        locationText: 'Lateral side of the little toe, 0.1 cun from the corner of the nail.',
        benefits: ['Turns the fetus (breech presentation)', 'Clears the head and eyes'],
        stimulationMethod: ['Needle', 'Moxa'],
        safetyNote: 'Contraindicated during pregnancy unless attempting to turn a breech baby.',
        imageUrl: require('../assets/images/UB67.png')
      },
      {
        code: 'UB66',
        name: 'Zu Tong Gu (Foot Connecting Valley)',
        shuPoint: 'Ying-Spring',
        locationText: 'Lateral side of the foot, distal to the 5th metatarsophalangeal joint.',
        benefits: ['Clears the heat', 'Descends Lung Qi'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/UB66.png')
      },
      {
        code: 'UB65',
        name: 'Shu Gu (Restraining Bone)',
        shuPoint: 'Shu-Stream',
        locationText: 'Lateral side of the foot, proximal to the 5th metatarsophalangeal joint.',
        benefits: ['Clears the head and eyes', 'Relaxes sinews', 'Relieves neck pain'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/UB65.png')
      },
      {
        code: 'UB60',
        name: 'Kun Lun (Kunlun Mountains)',
        shuPoint: 'Jing-River',
        locationText: 'In the depression between the lateral malleolus and Achilles tendon.',
        benefits: ['Relaxes the sinews', 'Promotes labor', 'Alleviates lower back pain', 'Helps in sciatica'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Contraindicated during pregnancy.',
        imageUrl: require('../assets/images/UB60.png')
      },
      {
        code: 'UB40',
        name: 'Wei Zhong (Middle of the Crook)',
        shuPoint: 'He-Sea',
        locationText: 'Midpoint of the transverse crease of the popliteal fossa.',
        benefits: ['Benefits the lower back', 'Cools the blood', 'Clears summer-heat', 'Clears skin disorders'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/UB40.png')
      }
    ]
  },

  // 8. KIDNEY MERIDIAN
  {
    id: 'kd',
    name: 'Kidney Meridian',
    element: 'Water',
    type: 'Yin',
    description: 'Stores Jing (essence) and rules reproduction, growth, and development. The root of life.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'K1',
        name: 'Yong Quan (Gushing Spring)',
        shuPoint: 'Jing-Well',
        locationText: 'On the sole of the foot, between the 2nd and 3rd metatarsal bones.',
        benefits: ['Reducs dizziness', 'Calms the spirit', 'Revives consciousness'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Very sensitive area.',
        imageUrl: require('../assets/images/K1.png')
      },
      {
        code: 'K2',
        name: 'Ran Gu (Blazing Valley)',
        shuPoint: 'Ying-Spring',
        locationText: 'Medial side of the foot, distal and inferior to the navicular tuberosity.',
        benefits: ['Clears deficiency heat', 'Regulates the Kidneys', 'Helps in menopause'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/K2.png')
      },
      {
        code: 'K3',
        name: 'Tai Xi (Supreme Stream)',
        shuPoint: 'Shu-Stream',
        locationText: 'In the depression between the medial malleolus and Achilles tendon.',
        benefits: ['Tonifies Kidneys', 'Nourishes Yin', 'Strengthens lower back'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/K3.png')
      },
      {
        code: 'K7',
        name: 'Fu Liu (Returning Current)',
        shuPoint: 'Jing-River',
        locationText: '2 cun above KD3 on the anterior border of the Achilles tendon.',
        benefits: ['Regulates sweating', 'Tonifies Kidneys', 'Improves circulation'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/K7.png')
      },
      {
        code: 'K10',
        name: 'Yin Gu (Yin Valley)',
        shuPoint: 'He-Sea',
        locationText: 'Medial side of the popliteal fossa.',
        benefits: ['Clears damp-heat from lower jiao', 'Benefits the Kidneys'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/K10.png')
      }
    ]
  },

  // 9. PERICARDIUM MERIDIAN
  {
    id: 'pc',
    name: 'Pericardium Meridian',
    element: 'Fire',
    type: 'Yin',
    description: 'Protects the Heart from external pathogens and emotional trauma.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'PC9',
        name: 'Zhong Chong (Middle Rushing)',
        shuPoint: 'Jing-Well',
        locationText: 'At the tip of the middle finger.',
        benefits: ['Clears heat', 'Revives consciousness', 'Helps in shocking situations'],
        stimulationMethod: ['Needle', 'Pressure', 'Bleeding'],
        imageUrl: require('../assets/images/PC9.png')
      },
      {
        code: 'PC8',
        name: 'Lao Gong (Palace of Toil)',
        shuPoint: 'Ying-Spring',
        locationText: 'At the center of the palm, between the 2nd and 3rd metacarpal bones.',
        benefits: ['Clears Heart fire', 'Calms the spirit', 'Cools the blood', 'Relieves anxiety'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/PC8.png')
      },
      {
        code: 'PC7',
        name: 'Da Ling (Great Mound)',
        shuPoint: 'Shu-Stream',
        locationText: 'Middle of the transverse crease of the wrist.',
        benefits: ['Calms the spirit', 'Clears heat', 'Harmonizes the stomach'],
        stimulationMethod: ['Needle', 'Pressure'],
        safetyNote: 'Needle with caution to avoid the median nerve.',
        imageUrl: require('../assets/images/PC7.png')
      },
      {
        code: 'PC5',
        name: 'Jian Shi (Intermediate Messenger)',
        shuPoint: 'Jing-River',
        locationText: '3 cun above the wrist crease, between the tendons of palmaris longus and flexor carpi radialis.',
        benefits: ['Transforms phlegm', 'Calms the spirit', 'Clears emotional blockages'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/PC5.png')
      },
      {
        code: 'PC3',
        name: 'Qu Ze (Marsh at the Crook)',
        shuPoint: 'He-Sea',
        locationText: 'On the transverse cubital crease, at the ulnar side of the biceps tendon.',
        benefits: ['Clears heat', 'Cools blood', 'Helps in arthritis'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/PC3.png')
      }
    ]
  },

  // 10. SAN JIAO MERIDIAN
  {
    id: 'sj',
    name: 'San Jiao Meridian (Triple Warmer)',
    element: 'Fire',
    type: 'Yang',
    description: 'Regulates water passages and directs Qi throughout the body\'s three regions (upper, middle, lower).',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'TW1',
        name: 'Guan Chong (Rushing Pass)',
        shuPoint: 'Jing-Well',
        locationText: 'Ulnar side of the ring finger, 0.1 cun from the corner of the nail.',
        benefits: ['Clears upper body heat', 'Benefits the ears', 'Revives consciousness'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/TW1.png')
      },
      {
        code: 'TW2',
        name: 'Ye Men (Fluid Gate)',
        shuPoint: 'Ying-Spring',
        locationText: 'Between the ring and little fingers, at the web margin.',
        benefits: ['Clears heat', 'Benefits the ears and eyes'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/TW2.png')
      },
      {
        code: 'TW3',
        name: 'Zhong Zhu (Central Islet)',
        shuPoint: 'Shu-Stream',
        locationText: 'On the dorsum of the hand, proximal to the 4th and 5th metacarpophalangeal joints.',
        benefits: ['Alleviates neck stiffness', 'Clears the head', 'Relieves tinnitus'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/TW3.png')
      },
      {
        code: 'TW6',
        name: 'Zhi Gou (Branch Ditch)',
        shuPoint: 'Jing-River',
        locationText: '3 cun above the wrist crease on the dorsal aspect of the forearm.',
        benefits: ['Moves the bowels', 'Clears heat', 'Improves circulation'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/TW6.png')
      },
      {
        code: 'TW10',
        name: 'Tian Jing (Heavenly Well)',
        shuPoint: 'He-Sea',
        locationText: '1 cun superior to the olecranon when the elbow is flexed.',
        benefits: ['Helps in chronic fevers', 'Calms the spirit', 'Dispels lumps'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/TW10.png')
      }
    ]
  },

  // 11. GALLBLADDER MERIDIAN
  {
    id: 'gb',
    name: 'Gallbladder Meridian',
    element: 'Wood',
    type: 'Yang',
    description: 'Stores and excretes bile, and controls decision making and courage.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'GB44',
        name: 'Zu Qiao Yin (Yin Portals of the Foot)',
        shuPoint: 'Jing-Well',
        locationText: 'Lateral side of the 4th toe, 0.1 cun from the corner of the nail.',
        benefits: ['Helps in migrane', 'Benefits the head and eyes', 'Reduces nightmares'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/GB44.png')
      },
      {
        code: 'GB43',
        name: 'Xia Xi (Clamped Stream)',
        shuPoint: 'Ying-Spring',
        locationText: 'Between the 4th and 5th toes, at the web margin.',
        benefits: ['Clears heat', 'Benefits the ears', 'Relieves tounge ulcers'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/GB43.png')
      },
      {
        code: 'GB41',
        name: 'Zu Lin Qi (Foot Governor of Tears)',
        shuPoint: 'Shu-Stream',
        locationText: 'On the dorsum of the foot, posterior to the 4th metatarsophalangeal joint.',
        benefits: ['Alliviates premenstrual syndrome', 'Benefits the eyes', 'Helps in urinary disorders'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/GB41.png')
      },
      {
        code: 'GB38',
        name: 'Yang Fu (Yang Assistance)',
        shuPoint: 'Jing-River',
        locationText: '4 cun above the lateral malleolus, anterior to the fibula.',
        benefits: ['Clears Gallbladder heat', 'Harmonizes Shaoyang'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/GB38.png')
      },
      {
        code: 'GB34',
        name: 'Yang Ling Quan (Yang Mound Spring)',
        shuPoint: 'He-Sea',
        locationText: 'In the depression anterior and inferior to the head of the fibula.',
        benefits: ['Benefits the sinews', 'Relieves muscle spasms', 'Helps with tics in the eyes'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/GB34.png')
      }
    ]
  },

  // 12. LIVER MERIDIAN
  {
    id: 'lv',
    name: 'Liver Meridian',
    element: 'Wood',
    type: 'Yin',
    description: 'Ensures the smooth flow of Qi and stores blood. Connected to anger and stress.',
    image: require('../assets/images/subrahmanya.jpg'),
    points: [
      {
        code: 'LV1',
        name: 'Da Dun (Great Mound)',
        shuPoint: 'Jing-Well',
        locationText: 'Lateral side of the big toe, 0.1 cun from the corner of the nail.',
        benefits: ['Regulates menses', 'Helps in lower abdominal pain', 'Restores consciousness'],
        stimulationMethod: ['Needle', 'Pressure', 'Moxa'],
        imageUrl: require('../assets/images/LV1.png')
      },
      {
        code: 'LV2',
        name: 'Xing Jian (Moving Between)',
        shuPoint: 'Ying-Spring',
        locationText: 'Between the 1st and 2nd toes, at the web margin.',
        benefits: ['Clears Liver fire', 'Reduces headache after stress', 'Cools blood'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LV2.png')
      },
      {
        code: 'LV3',
        name: 'Tai Chong (Great Rushing)',
        shuPoint: 'Shu-Stream',
        locationText: 'On the dorsum of the foot, in the depression distal to the junction of the 1st and 2nd metatarsal bones.',
        benefits: ['Helps with mood swings', 'Nourishes Liver Blood', 'Calms spasms'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LV3.png')
      },
      {
        code: 'LV4',
        name: 'Zhong Feng (Middle Seal)',
        shuPoint: 'Jing-River',
        locationText: '1 cun anterior to the medial malleolus.',
        benefits: ['Spreads Liver Qi', 'Clears heat in the lower jiao', 'Helps with ankle stiffness'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LV4.png')
      },
      {
        code: 'LV8',
        name: 'Qu Quan (Spring at the Crook)',
        shuPoint: 'He-Sea',
        locationText: 'Medial end of the transverse popliteal crease.',
        benefits: ['Clears cramps', 'Nourishes Liver Blood', 'Benefits the genitals'],
        stimulationMethod: ['Needle', 'Pressure'],
        imageUrl: require('../assets/images/LV8.png')
      }
    ]
  }
];