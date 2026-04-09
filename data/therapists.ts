import { Therapist } from '../types/tcm';

export const therapistsData: Therapist[] = [
  // THERAPIST 1
  {
    id: '31ae5e59-a791-48a4-89c3-737b84103542',
    name: 'Subrahmanya H C', 
    specialty: 'Acupuncture & Herbal Medicine',
    location: 'Kashyap studios, Salgame road, Hassan, Karnataka, India',
    experience: '5 Years Experience',
    bio: 'Specializes in chronic pain management and stress relief using traditional pulse diagnosis and targeted acupuncture.',
    imageUrl: require('../assets/images/subrahmanya.jpg'),
    phone: '+91 8050043633',
    email: 'subrahmanyahc@acuspace.in',
    website: 'https://subramanya-profile.vercel.app/',
    therapistId: '31ae5e59-a791-48a4-89c3-737b84103542'
  },

  // THERAPIST 2
  {
    id: '2',
    name: 'Varshini B R', 
    specialty: 'Acupuncture',
    location: 'Near Netaji public school, Vidyanagar, Hassan, Karnataka, India',
    experience: '1 Year Experience',
    bio: 'Expert in detoxification and sports recovery. Uses a combination of colors and needles. ',
    imageUrl: require('../assets/images/varshini.jpg'),
    phone: '+91 9483559935',
    email: 'varshinibr05@acuspace.in',
    website: 'https://therapist-varshini.vercel.app/' 
  }
];