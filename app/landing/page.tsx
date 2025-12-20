"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { CheckCircle2, ArrowRight, PlayCircle, Users, Target, FileText, Linkedin, MessageSquare, Calendar, ChevronDown, Instagram, Award, TrendingUp, Clock, Sparkles, Menu, X, Star, Quote, FileCheck, ChevronLeft, ChevronRight } from "lucide-react"

type Language = "en" | "fr"

interface Content {
  header: {
    logo: string
    nav: {
      program: string
      forWho: string
      price: string
      faq: string
    }
  }
  hero: {
    headline: string
    subheading: string
    forWho: string
    ctaPrimary: string
    ctaSecondary: string
  }
  socialProof: {
    title: string
    stats: {
      number: string
      label: string
    }[]
  }
  problem: {
    title: string
    subtitle?: string
    emotional?: string
    positioning?: string
    reasons: {
      number: string
      title: string
      description: string
    }[]
  }
  solution: {
    title: string
    subtitle: string
    points: string[]
  }
  cvScorer: {
    title: string
    subtitle: string
    description: string
    features: string[]
    cta: string
    ctaSecondary: string
  }
  trainer: {
    title: string
    name: string
    role: string
    image: string
    bio: string[]
    stats: {
      label: string
      value: string
    }[]
    social: {
      instagram: string
      linkedin: string
    }
  }
  transformation: {
    title: string
    points: string[]
  }
  modules: {
    title: string
    items: {
      title: string
      description: string
    }[]
  }
  platform: {
    title: string
    subtitle?: string
    points: string[]
  }
  whoItsFor: {
    title: string
    points: string[]
  }
  price: {
    title: string
    plans: {
      basic: {
        name: string
        originalPrice: string
        currentPrice: string
        features: string[]
      }
      premium: {
        name: string
        originalPrice: string
        currentPrice: string
        specialOffer: string
        features: string[]
      }
    }
  }
  faq: {
    title: string
    items: {
      question: string
      answer: string
    }[]
  }
  testimonials: {
    title: string
    items: {
      name: string
      role: string
      text: string
      rating: number
      image: string
    }[]
  }
  form: {
    title: string
    subtitle: string
    fields: {
      fullName: string
      phone: string
      lookingFor: string
      offer: string
      submit: string
    }
    lookingForOptions: {
      stagePFE: string
      premierEmploi: string
      progresserCarriere: string
      reconversion: string
    }
    offerOptions: {
      xperiencePro: string
      xperience: string
    }
  }
}

const content: Record<Language, Content> = {
  en: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Program",
        forWho: "For Who?",
        price: "Price",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Ignored by recruiters? Put an end to applications without response.",
      subheading: "You send applications. You make efforts. But responses don't come. And you don't know why.",
      forWho: "For candidates who want to understand what's blocking them and how to fix it.",
      ctaPrimary: "Fix My Job Search Now",
      ctaSecondary: "See How It Works",
    },
    socialProof: {
      title: "Proven Method",
      stats: [
        { number: "+5000", label: "candidates accompanied" },
        { number: "92%", label: "reached their professional goals" },
        { number: "80%", label: "did it in less than 3 months" },
      ],
    },
    problem: {
      title: "3 reasons why you don't reach your professional goals",
      reasons: [
        {
          number: "01",
          title: "You don't use the right tools (including AI) to adapt your CV to job offers",
          description: "Generic CV with no keywords, not attractive to recruiters.",
        },
        {
          number: "02",
          title: "You don't know how to handle interviews like a pro",
          description: "Your answers are not structured and not convincing.",
        },
        {
          number: "03",
          title: "You don't prepare in advance to seize opportunities",
          description: "Great opportunities pass by and you end up accepting a job you don't really want.",
        },
      ],
    },
    solution: {
      title: "Xperience Pro: The Complete Solution",
      subtitle: "Xperience Pro is a structured 1-month program, designed for candidates who want to:",
      points: [
        "Identify why their applications don't lead to results",
        "Fix what's really blocking them from the recruiter's perspective",
        "Stop applying blindly",
      ],
    },
    cvScorer: {
      title: "Try Our Free CV Scorer",
      subtitle: "Get instant feedback on your CV",
      description: "Upload your CV and get a detailed analysis with scores on structure, content quality, relevance, professionalism, and ATS compatibility. Get personalized feedback to improve your CV before applying.",
      features: [
        "AI-powered CV analysis in seconds",
        "5-dimension scoring system",
        "Personalized improvement suggestions",
        "ATS compatibility check",
        "Match your CV to job descriptions",
      ],
      cta: "Score My CV Now",
      ctaSecondary: "Learn More",
    },
    trainer: {
      title: "Meet your coach",
      name: "Ali El Harti",
      role: "Certified Trainer & Employability Manager",
      image: "/ali.jpg", // Trainer image located in /public/ali.jpg
      bio: [
        "Certified trainer with 7+ years of experience helping young people prepare for the job market.",
        "Specializes in job and internship search techniques.",
        "More than 5000 people have benefited from his career coaching.",
        "Has spoken in over 100 conferences in Morocco and internationally.",
        "Works as an Employability Manager and collaborates with several well-known universities in Morocco, focusing on company relations and industrial partnerships.",
        "Has been invited by major media such as Al Aoula, Le Matin, and M24.",
      ],
      stats: [
        { label: "Years of Experience", value: "7+" },
        { label: "People Coached", value: "5000+" },
        { label: "Conferences", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "What you'll be able to do after Xperience Pro",
      points: [
        "Create a clear, professional CV that recruiters actually want to read.",
        "Quickly adapt your CV to each job without starting from scratch.",
        "Have a clean, attractive LinkedIn profile that works for you.",
        "Arrive to interviews prepared, with clear answers and smart questions.",
      ],
    },
    modules: {
      title: "What's inside Xperience Pro",
      items: [
        {
          title: "Module 1 – CV fundamentals",
          description: "Build a CV that looks professional and clearly shows your value, even if you don't have a lot of experience.",
        },
        {
          title: "Module 2 – Adapting your CV to each job",
          description: "How to read a job offer, pick the right keywords, and adapt your CV fast.",
        },
        {
          title: "Module 3 – Mastering LinkedIn",
          description: "Optimize your photo, headline, About section, and start being visible to recruiters.",
        },
        {
          title: "Module 4 – Interview preparation",
          description: "How to introduce yourself, answer classic questions, and ask smart questions at the end.",
        },
        {
          title: "Module 5 – Action plan",
          description: "A 30-day action plan to apply, follow up, and track your progress without feeling lost.",
        },
      ],
    },
    platform: {
      title: "Xperience Pro: A Unique Experience",
      subtitle: "Understanding alone isn't enough. Applying alone is difficult.",
      points: [
        "Clear video capsules, accessible at any time, to understand the real rules of recruitment and what recruiters really expect.",
        "A 1-month structure with live sessions, concrete exercises, and guided practice.",
        "With Xperience: you get real feedback, you know exactly what to fix, you move forward with a clear framework.",
        "Important: Videos remain accessible even after the program ends.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro is for you if…",
      points: [
        "You're a student, employee, or job seeker.",
        "You're tired of sending CVs and hearing nothing back.",
        "You want a clear structure instead of random YouTube videos.",
      ],
    },
    price: {
      title: "Choose Your Plan",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "700 DH",
          features: [
            "Access to a single module of the program. You choose between:",
            "Mastered interview techniques",
            "Professional CV",
            "Personal branding and analysis of offers on LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1500 DH",
          currentPrice: "999 DH",
          specialOffer: "SPECIAL OFFER",
          features: [
            "Access to all modules of the program:",
            "Professional CV",
            "Mastered interview techniques",
            "Personal branding and analysis of offers on LinkedIn",
            "Free ebooks and resources",
            "Regular WhatsApp follow-up",
            "1 month of training: 4 live sessions and 18 recorded capsules",
          ],
        },
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How do I access the program after payment?",
          answer: "After payment, you'll receive an email with your login credentials and access to the online platform within 24 hours.",
        },
        {
          question: "Is it suitable for beginners?",
          answer: "Yes! Xperience Pro is designed for everyone, whether you're just starting your career or looking to make a change. No prior experience needed.",
        },
        {
          question: "How long do I keep access?",
          answer: "You get lifetime access to all the content. Once you join, you can revisit the lessons anytime, anywhere.",
        },
        {
          question: "What if I'm not satisfied?",
          answer: "We're confident you'll love the program. If you're not satisfied within the first 7 days, contact us for a full refund.",
        },
        {
          question: "Can I access it on mobile?",
          answer: "Yes! The platform is fully responsive and works perfectly on your phone, tablet, or computer.",
        },
      ],
    },
    testimonials: {
      title: "What our students say",
      items: [
        {
          name: "Sarah M.",
          role: "Recent Graduate",
          text: "Xperience Pro completely transformed my job search. I went from zero responses to multiple interviews in just 2 months. The CV adaptation techniques are game-changers!",
          rating: 5,
          image: "/public/ali.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Ahmed K.",
          role: "Career Changer",
          text: "I was stuck in a job I didn't like. This program gave me the confidence and tools to make a successful career transition. The interview preparation module is excellent.",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Fatima L.",
          role: "Student",
          text: "As a student with no experience, I thought finding an internship would be impossible. Xperience Pro showed me how to highlight my skills and I got 3 internship offers!",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Youssef B.",
          role: "Job Seeker",
          text: "The LinkedIn optimization tips alone are worth the investment. I started getting messages from recruiters within weeks. Highly recommend!",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
      ],
    },
    form: {
      title: "Join Xperience Pro",
      subtitle: "Fill out the form and we'll contact you via WhatsApp",
      fields: {
        fullName: "Full Name",
        phone: "Phone Number",
        lookingFor: "What are you looking for?",
        offer: "Which offer interests you?",
        submit: "Send via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 999 DH",
        xperience: "COACHING BASIC - 700 DH",
      },
    },
  },
  fr: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Programme",
        forWho: "Pour qui ?",
        price: "Prix",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Ignoré par les recruteurs ? Mettez fin aux candidatures sans réponse.",
      subheading: "Vous envoyez des candidatures. Vous faites des efforts. Mais les réponses n'arrivent pas. Et vous ne savez pas pourquoi.",
      forWho: "Pour les candidats qui veulent comprendre ce qui les bloque et comment le corriger.",
      ctaPrimary: "Corriger ce qui bloque",
      ctaSecondary: "Voir comment ça marche",
    },
    socialProof: {
      title: "Xperience Pro: Un programme testé et approuvé",
      stats: [
        { number: "+6000", label: "candidats accompagnés" },
        { number: "92%", label: "ont atteint leurs objectifs professionnels" },
        { number: "80%", label: "l'ont fait en moins de 3 mois" },
      ],
    },
    problem: {
      title: "Vous postulez sans réponse. Vous passez parfois des entretiens, sans suite. Vous améliorez votre CV, sans impact réel.",
      subtitle: "Le plus dur n'est pas le refus. C'est de ne pas savoir quoi corriger.",
      emotional: "Vous voyez d'autres avancer. Parfois avec moins d'expérience. Parfois avec un parcours similaire. Et vous vous demandez : \"Pourquoi pas moi ?\"",
      positioning: "Ce n'est pas une question de compétence. C'est une question de positionnement.",
      reasons: [
        {
          number: "01",
          title: "Tu n'utilises pas les bons outils (dont l'IA) pour adapter ton CV aux offres d'emploi",
          description: "CV générique, sans mots-clés, qui n'attire pas l'attention du recruteur.",
        },
        {
          number: "02",
          title: "Tu ne sais pas comment gérer ton entretien comme un pro",
          description: "Tes réponses sont mal structurées, peu convaincantes.",
        },
        {
          number: "03",
          title: "Tu ne te prépares pas à l'avance pour saisir les opportunités",
          description: "Les bonnes opportunités te passent sous le nez et tu te contentes d'un job qui ne t'intéresse pas.",
        },
      ],
    },
    solution: {
      title: "Xperience Pro: La solution complète",
      subtitle: "Xperience Pro est un programme structuré sur 1 mois, pensé pour les candidats qui veulent :",
      points: [
        "Identifier pourquoi leurs candidatures n'aboutissent pas",
        "Corriger ce qui bloque réellement côté recruteur",
        "Arrêter de postuler à l'aveugle",
      ],
    },
    cvScorer: {
      title: "Essayez Notre Évaluateur de CV Gratuit",
      subtitle: "Obtenez un retour instantané sur votre CV",
      description: "Téléchargez votre CV et obtenez une analyse détaillée avec des scores sur la structure, la qualité du contenu, la pertinence, le professionnalisme et la compatibilité ATS. Recevez des suggestions personnalisées pour améliorer votre CV avant de postuler.",
      features: [
        "Analyse de CV par IA en quelques secondes",
        "Système de notation à 5 dimensions",
        "Suggestions d'amélioration personnalisées",
        "Vérification de compatibilité ATS",
        "Adaptez votre CV aux descriptions de poste",
      ],
      cta: "Évaluer mon CV maintenant",
      ctaSecondary: "En savoir plus",
    },
    trainer: {
      title: "Préparez-vous au marché d'emploi avec notre expert",
      name: "Ali El Harti",
      role: "Formateur Certifié & Responsable Employabilité",
      image: "/ali.jpg", // Trainer image located in /public/ali.jpg
      bio: [
        "Formateur certifié avec plus de 7 ans d'expérience dans l'accompagnement des jeunes vers le marché de l'emploi.",
        "Spécialisé dans les techniques de recherche d'emploi et de stage.",
        "Plus de 5000 personnes ont bénéficié de son coaching de carrière.",
        "A animé plus de 100 conférences au Maroc et à l'international.",
        "Travaille en tant que Responsable Employabilité et collabore avec plusieurs universités reconnues au Maroc, axé sur les relations entreprises et partenariats industriels.",
        "A été invité par les grands médias tels qu'Al Aoula, Le Matin et M24.",
      ],
      stats: [
        { label: "Années d'expérience", value: "7+" },
        { label: "Personnes coachées", value: "5000+" },
        { label: "Conférences", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "Ce que tu seras capable de faire après Xperience Pro",
      points: [
        "Construire un CV clair et professionnel que les recruteurs ont envie de lire.",
        "Adapter ton CV à chaque offre sans tout recommencer à zéro.",
        "Avoir un profil LinkedIn propre et attractif qui travaille pour toi.",
        "Arriver en entretien préparé(e), avec des réponses claires et des questions intelligentes.",
      ],
    },
    modules: {
      title: "Le contenu du programme Xperience Pro",
      items: [
        {
          title: "Module 1 – Les fondamentaux du CV",
          description: "Construire un CV professionnel qui met en valeur ton profil, même si tu n'as pas beaucoup d'expérience.",
        },
        {
          title: "Module 2 – Adapter ton CV à chaque offre",
          description: "Comment lire une offre, choisir les bons mots-clés et adapter ton CV rapidement.",
        },
        {
          title: "Module 3 – Maîtriser LinkedIn",
          description: "Optimiser ta photo, ton titre, ton 'À propos' et devenir visible pour les recruteurs.",
        },
        {
          title: "Module 4 – Préparation aux entretiens",
          description: "Comment te présenter, répondre aux questions classiques et poser des questions intelligentes en fin d'entretien.",
        },
        {
          title: "Module 5 – Plan d'action",
          description: "Un plan d'action sur 30 jours pour postuler, relancer et suivre tes candidatures sans te perdre.",
        },
      ],
    },
    platform: {
      title: "Xperience Pro: Une expérience unique",
      subtitle: "Comprendre seul ne suffit pas. Appliquer seul est difficile.",
      points: [
        "Des capsules vidéo claires, accessibles à tout moment, pour comprendre les règles réelles du recrutement et ce que les recruteurs attendent vraiment.",
        "Une structure sur 1 mois avec des lives, des exercices concrets et des mises en pratique guidées.",
        "Avec Xperience : vous avez du feedback réel, vous savez précisément quoi corriger, vous avancez avec un cadre clair.",
        "Important: Les vidéos restent accessibles même après la fin du programme.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro est fait pour toi si…",
      points: [
        "Tu es étudiant(e), salarié(e) ou en recherche d'emploi.",
        "Tu en as marre d'envoyer des CV sans réponse.",
        "Tu veux un cadre clair au lieu de vidéos YouTube au hasard.",
      ],
    },
    price: {
      title: "Choisissez votre formule",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "700 DH",
          features: [
            "Accès à un seul module du programme. Tu choisis entre:",
            "Techniques d'entretien maîtrisées",
            "CV professionnel",
            "Personal branding et analyse des offres sur LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1500 DH",
          currentPrice: "999 DH",
          specialOffer: "OFFRE SPÉCIALE",
          features: [
            "Accès à l'ensemble des modules du programme:",
            "CV professionnel",
            "Techniques d'entretien maîtrisées",
            "Personal branding et analyse des offres sur LinkedIn",
            "Ebooks et ressources gratuites",
            "Suivi régulier sur Whatsapp",
            "1 mois de formation: 4 séances live et 18 capsules enregistrées",
          ],
        },
      },
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Comment j'accède au programme après le paiement ?",
          answer: "",
        },
        {
          question: "Est-ce adapté aux débutants ?",
          answer: "Oui ! Xperience Pro est conçu pour tout le monde, que tu commences ta carrière ou que tu veuilles changer. Aucune expérience préalable nécessaire.",
        },
        {
          question: "Combien de temps je garde l'accès ?",
          answer: "Tu as un accès à vie à tout le contenu. Une fois inscrit(e), tu peux revoir les leçons quand tu veux, où tu veux.",
        },
        {
          question: "Et si je ne suis pas satisfait(e) ?",
          answer: "",
        },
        {
          question: "Je peux y accéder sur mobile ?",
          answer: "Oui ! La plateforme est entièrement responsive et fonctionne parfaitement sur ton téléphone, tablette ou ordinateur.",
        },
      ],
    },
    testimonials: {
      title: "Ce que disent nos étudiants",
      items: [
        {
          name: "Sarah M.",
          role: "Diplômée récente",
          text: "Xperience Pro a complètement transformé ma recherche d'emploi. Je suis passée de zéro réponse à plusieurs entretiens en seulement 2 mois. Les techniques d'adaptation de CV sont révolutionnaires !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Ahmed K.",
          role: "Reconversion professionnelle",
          text: "J'étais coincé dans un job qui ne me plaisait pas. Ce programme m'a donné la confiance et les outils pour faire une transition de carrière réussie. Le module de préparation aux entretiens est excellent.",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Fatima L.",
          role: "Étudiante",
          text: "En tant qu'étudiante sans expérience, je pensais que trouver un stage serait impossible. Xperience Pro m'a montré comment mettre en valeur mes compétences et j'ai reçu 3 offres de stage !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Youssef B.",
          role: "Demandeur d'emploi",
          text: "Les conseils d'optimisation LinkedIn à eux seuls valent l'investissement. J'ai commencé à recevoir des messages de recruteurs en quelques semaines. Je recommande vivement !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
      ],
    },
    form: {
      title: "Rejoindre Xperience Pro",
      subtitle: "Remplissez le formulaire et nous vous contacterons via WhatsApp",
      fields: {
        fullName: "Nom complet",
        phone: "Numéro de téléphone",
        lookingFor: "Que recherchez-vous ?",
        offer: "Quelle offre vous intéresse ?",
        submit: "Envoyer via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 999 DH",
        xperience: "COACHING BASIC - 700 DH",
      },
    },
  },
}

export default function XperienceProLandingPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [testimonialsPerView, setTestimonialsPerView] = useState(3)
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    lookingFor: "",
    offer: "",
  })
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [animatedStats, setAnimatedStats] = useState<{ [key: number]: number }>({})
  const [ctaHoverState, setCtaHoverState] = useState<{ [key: string]: boolean }>({})
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showMicroReward, setShowMicroReward] = useState(false)
  const [remainingSpots, setRemainingSpots] = useState(12) // Limited spots counter - fetched from backend
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  
  // Fetch remaining spots from backend
  useEffect(() => {
    const fetchRemainingSpots = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/landing-page/remaining-spots?t=${timestamp}`, {
          method: "GET",
          cache: "no-store", // Prevent browser caching
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched remaining spots:", data.remainingSpots)
          setRemainingSpots(data.remainingSpots || 12)
        } else {
          console.error("Failed to fetch remaining spots:", response.status)
        }
      } catch (error) {
        console.error("Error fetching remaining spots:", error)
        // Keep default value of 12
      }
    }
    fetchRemainingSpots()
    
    // Set testimonials per view based on screen size
    const updateTestimonialsPerView = () => {
      if (window.innerWidth < 640) {
        setTestimonialsPerView(1)
      } else if (window.innerWidth < 1024) {
        setTestimonialsPerView(2)
      } else {
        setTestimonialsPerView(3)
      }
    }
    
    updateTestimonialsPerView()
    window.addEventListener('resize', updateTestimonialsPerView)
    
    return () => {
      window.removeEventListener('resize', updateTestimonialsPerView)
    }
  }, [])
  
  // Testimonial images from clients_reviews folder
  const testimonialImages = [
    "/clients_reviews/screen1.jpg",
    "/clients_reviews/screen2.jpg",
    "/clients_reviews/screen3.jpg",
    "/clients_reviews/screen4.jpg",
    "/clients_reviews/screen5.jpg",
    "/clients_reviews/screen6.jpg",
    "/clients_reviews/screen7.jpg",
    "/clients_reviews/screen8.jpg",
  ]
  
  // WhatsApp number - Clean format: only digits, country code + number (e.g., 212773213060)
  const ADMIN_WHATSAPP_NUMBER = "212773213060"

  const t = content[language]

  // Animate stats when they become visible
  useEffect(() => {
    const animateStat = (index: number, targetValue: number, isPercentage: boolean) => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = targetValue / steps
      let current = 0
      let step = 0

      const timer = setInterval(() => {
        step++
        current = Math.min(current + increment, targetValue)
        
        if (isPercentage) {
          setAnimatedStats((prev) => ({ ...prev, [index]: Math.round(current) }))
        } else {
          setAnimatedStats((prev) => ({ ...prev, [index]: Math.round(current) }))
        }

        if (step >= steps) {
          clearInterval(timer)
          setAnimatedStats((prev) => ({ ...prev, [index]: targetValue }))
        }
      }, duration / steps)
    }

    // Parse and animate stats when they become visible
    t.socialProof.stats.forEach((stat, index) => {
      const statKey = `stat-${index}`
      if (visibleSections.has(statKey) && !animatedStats[index]) {
        const numberStr = stat.number.replace(/[^0-9.]/g, '')
        const numValue = parseFloat(numberStr)
        
        if (stat.number.includes('%')) {
          animateStat(index, numValue, true)
        } else if (stat.number.includes('+')) {
          // For numbers like +5000, animate to 5000
          animateStat(index, numValue, false)
        }
      }
    })
  }, [visibleSections, t.socialProof.stats, animatedStats])

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving towards top of screen (trying to close tab)
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showExitIntent])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.keys(sectionRefs.current).forEach((key) => {
      const element = sectionRefs.current[key]
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set(prev).add(key))
              }
            })
          },
          { threshold: 0.1 }
        )
        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        const sectionId = hash.substring(1) // Remove the #
        const element = document.getElementById(sectionId)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 100) // Small delay to ensure page is rendered
        }
      }
    }

    // Handle hash on initial load
    handleHashNavigation()

    // Handle hash changes (e.g., when navigating from another page)
    window.addEventListener("hashchange", handleHashNavigation)

    return () => {
      window.removeEventListener("hashchange", handleHashNavigation)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileMenuOpen(false)
    }
  }

  // Clean phone number - remove all non-digit characters
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, "")
  }

  // Format WhatsApp number - ensure it's clean and properly formatted
  const formatWhatsAppNumber = (phone: string): string => {
    const cleaned = cleanPhoneNumber(phone)
    // If it starts with +, remove it
    // If it starts with 00, replace with country code
    if (cleaned.startsWith("00212")) {
      return cleaned.replace("00212", "212")
    }
    // If it starts with 0, replace with country code
    if (cleaned.startsWith("0")) {
      return "212" + cleaned.substring(1)
    }
    // If it already has country code, return as is
    if (cleaned.startsWith("212")) {
      return cleaned
    }
    // Otherwise, assume it's a local number and add country code
    return "212" + cleaned
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const t = content[language]
    const lookingForText = formData.lookingFor === "stagePFE" 
      ? t.form.lookingForOptions.stagePFE
      : formData.lookingFor === "premierEmploi"
      ? t.form.lookingForOptions.premierEmploi
      : formData.lookingFor === "progresserCarriere"
      ? t.form.lookingForOptions.progresserCarriere
      : t.form.lookingForOptions.reconversion

    const message = language === "en"
      ? `Hi, my name is ${formData.fullName} and I'm looking for ${lookingForText}. I chose this offer: ${formData.offer}. My phone number is ${formData.phone}.`
      : `Bonjour, je m'appelle ${formData.fullName} et je recherche ${lookingForText}. J'ai choisi cette offre : ${formData.offer}. Mon numéro de téléphone est ${formData.phone}.`

    // Save to database first
    try {
      console.log("💾 Saving lead to database:", {
        fullName: formData.fullName,
        phone: formData.phone,
        lookingFor: formData.lookingFor,
        offer: formData.offer,
      })
      
      const response = await fetch("/api/landing-page/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          lookingFor: formData.lookingFor,
          offer: formData.offer,
        }),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        console.error("❌ Failed to save lead to database:", response.status, responseData)
        // Continue anyway - still send WhatsApp message
      } else {
        console.log("✅ Lead saved successfully:", responseData)
      }
    } catch (error) {
      console.error("❌ Error saving lead to database:", error)
      // Continue anyway - still send WhatsApp message
    }

    // Clean and format the WhatsApp number - ensure only digits
    let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
    
    // For WhatsApp Business, ensure proper format
    // Remove leading + or 00 if present
    if (cleanedNumber.startsWith("00212")) {
      cleanedNumber = cleanedNumber.replace("00212", "212")
    }
    if (cleanedNumber.startsWith("+212")) {
      cleanedNumber = cleanedNumber.replace("+212", "212")
    }
    // Remove leading 0 if country code is missing
    if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber.substring(1)
    }
    // Ensure it starts with country code
    if (!cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber
    }
    
    // Validate number format
    if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
      alert(language === "en" 
        ? "Invalid phone number format. Please check the WhatsApp number configuration."
        : "Format de numéro invalide. Veuillez vérifier la configuration du numéro WhatsApp.")
      return
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Try multiple WhatsApp URL formats for business numbers
    // Primary: wa.me (works for both personal and business)
    const whatsappUrl1 = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
    
    // Alternative: api.whatsapp.com (sometimes works better for business)
    const whatsappUrl2 = `https://api.whatsapp.com/send?phone=${cleanedNumber}&text=${encodedMessage}`
    
    // Try primary format first, with fallback
    try {
      const win = window.open(whatsappUrl1, "_blank", "noopener,noreferrer")
      // If window didn't open (blocked), try alternative
      if (!win || win.closed || typeof win.closed === "undefined") {
        setTimeout(() => {
          window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
        }, 100)
      }
    } catch (error) {
      // Fallback to alternative format
      window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
    }
    
    // Show micro-reward
    setShowMicroReward(true)
    setTimeout(() => {
      setShowMicroReward(false)
    }, 3000)

    // Reset form
    setFormData({
      fullName: "",
      phone: "",
      lookingFor: "",
      offer: "",
    })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("program")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.program}
              </button>
              <button
                onClick={() => scrollToSection("for-who")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.forWho}
              </button>
              <button
                onClick={() => scrollToSection("price")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.price}
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {language === "en" ? "Testimonials" : "Témoignages"}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.faq}
              </button>
            </nav>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "fr"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                FR
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 p-2 text-gray-700 hover:text-[#005eb8] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("program")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.program}
                </button>
                <button
                  onClick={() => scrollToSection("for-who")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.forWho}
                </button>
                <button
                  onClick={() => scrollToSection("price")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.price}
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {language === "en" ? "Testimonials" : "Témoignages"}
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.faq}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t.hero.headline}
            </h1>
            
            <p className="text-lg mb-6 text-blue-200">
              {t.hero.forWho}
            </p>
            {/* Limited Spots Badge */}
            <div className="mb-8 flex justify-center">
              <div className="bg-[#FFBC00] text-gray-900 px-6 py-2 rounded-full text-sm md:text-base font-bold shadow-lg animate-pulse">
                ⚡ {language === "en" 
                  ? `Only ${remainingSpots} spots left this month!` 
                  : `Il ne reste que ${remainingSpots} places ce mois-ci !`
                }
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection("price")}
                onMouseEnter={() => setCtaHoverState({ ...ctaHoverState, heroPrimary: true })}
                onMouseLeave={() => setCtaHoverState({ ...ctaHoverState, heroPrimary: false })}
                className="bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 group"
              >
                <span className="transition-all duration-200">
                  {ctaHoverState.heroPrimary 
                    ? (language === "en" ? "Fix My Job Search Now" : "Corriger ce qui bloque")
                    : t.hero.ctaPrimary
                  }
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                onClick={() => scrollToSection("program")}
                onMouseEnter={() => setCtaHoverState({ ...ctaHoverState, heroSecondary: true })}
                onMouseLeave={() => setCtaHoverState({ ...ctaHoverState, heroSecondary: false })}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white/30 transition-all duration-200 flex items-center gap-2 group"
              >
                <span className="transition-all duration-200">
                  {ctaHoverState.heroSecondary
                    ? (language === "en" ? "See How It Works" : "Voir comment ça marche")
                    : t.hero.ctaSecondary
                  }
                </span>
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xl md:text-2xl mb-6 font-bold text-black-900 leading-relaxed">
              {t.hero.subheading}
            </p>
          <h2 className="text-2xl md:text-3xl text-center mb-8 text-gray-900">
            {t.socialProof.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {t.socialProof.stats.map((stat, index) => {
              const isVisible = visibleSections.has(`stat-${index}`)
              const animatedValue = animatedStats[index] ?? 0
              const isPercentage = stat.number.includes('%')
              const hasPlus = stat.number.includes('+')
              
              // Format the displayed number
              let displayNumber = stat.number
              if (isVisible && animatedValue > 0) {
                if (isPercentage) {
                  displayNumber = `${animatedValue}%`
                } else if (hasPlus) {
                  displayNumber = `+${animatedValue.toLocaleString()}`
                } else {
                  displayNumber = animatedValue.toString()
                }
              }

              // Calculate progress bar percentage
              const numberStr = stat.number.replace(/[^0-9.]/g, '')
              const maxValue = parseFloat(numberStr)
              const progressPercentage = isVisible && maxValue > 0 ? (animatedValue / maxValue) * 100 : 0

              return (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`stat-${index}`] = el
                  }}
                  className={`bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 rounded-2xl shadow-xl text-white text-center transform transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-5xl md:text-6xl font-bold mb-2 text-[#FFBC00]">
                    {displayNumber}
                  </div>
                  <div className="text-lg md:text-xl font-medium mb-4">{stat.label}</div>
                  {/* Animated Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#FFBC00] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Problem Section - Enhanced */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                {t.problem.title}
              </h2>
              {t.problem.subtitle && (
                <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 italic">
                  {t.problem.subtitle}
                </p>
              )}
              {t.problem.emotional && (
                <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                  {t.problem.emotional}
                </p>
              )}
              {t.problem.positioning && (
                <p className="text-xl md:text-2xl font-bold text-[#005eb8] mb-6">
                  {t.problem.positioning}
                </p>
              )}
              <div className="w-24 h-1 bg-gradient-to-r from-[#005eb8] to-[#FFBC00] mx-auto rounded-full"></div>
            </div>
            <div className="space-y-8">
              {t.problem.reasons.map((reason, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`problem-${index}`] = el
                  }}
                  className={`bg-white p-8 md:p-10 rounded-2xl shadow-xl border-l-4 border-black transform transition-all duration-700 hover:shadow-2xl hover:scale-[1.02] ${
                    visibleSections.has(`problem-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-6 md:gap-8">
                    <div className="flex-shrink-0">
                      <div className="bg-black text-white rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg transform hover:scale-110 transition-transform duration-200">
                        {reason.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {reason.title}
                      </h3>
                      <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      {t.solution && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t.solution.title}
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                {t.solution.subtitle}
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                {t.solution.points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-4xl font-bold text-[#FFBC00] mb-3">{index + 1}</div>
                    <p className="text-lg leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollToSection("price")}
                className="mt-12 bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                {language === "en" ? "Fix What's Blocking My Applications" : "Corriger ce qui bloque mes candidatures"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trainer Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.trainer.title}
            </h2>
            <div
              ref={(el) => {
                sectionRefs.current["trainer"] = el
              }}
              className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ${
                visibleSections.has("trainer") ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 md:p-12 text-white flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full mb-6 border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center relative">
                    {t.trainer.image ? (
                      <Image
                        src={t.trainer.image}
                        alt={t.trainer.name}
                        width={128}
                        height={128}
                        className="object-cover rounded-full"
                        priority
                      />
                    ) : (
                      <Users className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{t.trainer.name}</h3>
                  <p className="text-blue-200 text-center mb-6">{t.trainer.role}</p>
                  <div className="flex gap-4">
                    <a
                      href={t.trainer.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href={t.trainer.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="md:w-2/3 p-8 md:p-12">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {t.trainer.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-[#005eb8] mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {t.trainer.bio.map((paragraph, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#005eb8] mt-1 flex-shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.transformation.title}
            </h2>
            <div className="space-y-4">
              {t.transformation.points.map((point, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`transformation-${index}`] = el
                  }}
                  className={`bg-gradient-to-r from-[#005eb8] to-[#0476D7] p-6 rounded-lg shadow-lg text-white flex items-start gap-4 transform transition-all duration-700 ${
                    visibleSections.has(`transformation-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0 text-[#FFBC00]" />
                  <p className="text-lg flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="program" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.modules.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.modules.items.map((module, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`module-${index}`] = el
                }}
                className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  visibleSections.has(`module-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#005eb8] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section - Enhanced */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                {t.platform.title}
              </h2>
              {t.platform.subtitle && (
                <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 italic">
                  {t.platform.subtitle}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 rounded-2xl shadow-lg">
              <div className="space-y-6">
                {t.platform.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 text-left">
                    <CheckCircle2 className="w-6 h-6 text-[#005eb8] flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="for-who" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.whoItsFor.title}
            </h2>
            <div className="space-y-4">
              {t.whoItsFor.points.map((point, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FFBC00] flex items-start gap-4"
                >
                  <Users className="w-6 h-6 text-[#005eb8] mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section
        id="price"
        ref={(el) => {
          sectionRefs.current["price"] = el
        }}
        className="py-16 md:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.price.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Basic Plan Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform transition-all duration-700 ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-gray-500 line-through">{t.price.plans.basic.originalPrice}</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                  {t.price.plans.basic.currentPrice}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">{t.price.plans.basic.name}</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {t.price.plans.basic.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-600 text-sm leading-relaxed">- {feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setFormData({ ...formData, offer: t.form.offerOptions.xperience })
                  setShowForm(true)
                }}
                onMouseEnter={() => setCtaHoverState({ ...ctaHoverState, basicPlan: true })}
                onMouseLeave={() => setCtaHoverState({ ...ctaHoverState, basicPlan: false })}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 group"
              >
                <span className="transition-all duration-200">
                  {ctaHoverState.basicPlan
                    ? (language === "en" ? "Start Fixing My CV" : "Commencer à corriger")
                    : (language === "en" ? "Choose Basic" : "Choisir Basic")
                  }
                </span>
              </button>
            </div>

            {/* Premium Plan Card */}
            <div
              className={`bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] rounded-2xl shadow-xl border-2 border-[#FFBC00] p-8 transform transition-all duration-700 relative ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              {/* Special Offer Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-[#FFBC00] text-gray-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                  {t.price.plans.premium.specialOffer}
                </span>
              </div>
              {/* Limited Spots Badge */}
              <div className="absolute -top-3 sm:-top-4 right-2 sm:right-4 z-10">
                <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">{remainingSpots} {language === "en" ? "left" : "restantes"}</span>
                  <span className="sm:hidden">{remainingSpots}</span>
                </div>
              </div>
              
              <div className="text-center mb-6 text-white">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-blue-200 line-through">{t.price.plans.premium.originalPrice}</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FFBC00] mb-2">
                  {t.price.plans.premium.currentPrice}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-4">{t.price.plans.premium.name}</h3>
              </div>
              <ul className="space-y-3 mb-8 text-white">
                {t.price.plans.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-white/90 text-sm leading-relaxed">- {feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  setIsHolding(true)
                  setHoldProgress(0)
                  
                  const duration = 1500 // 1.5 seconds (adjustable: 1000-2000ms)
                  const interval = 20 // Update every 20ms
                  const increment = 100 / (duration / interval)
                  
                  let progress = 0
                  holdTimerRef.current = setInterval(() => {
                    progress += increment
                    setHoldProgress(Math.min(progress, 100))
                    
                    if (progress >= 100) {
                      if (holdTimerRef.current) {
                        clearInterval(holdTimerRef.current)
                        holdTimerRef.current = null
                      }
                      setIsHolding(false)
                      setFormData({ ...formData, offer: t.form.offerOptions.xperiencePro })
                      setShowForm(true)
                      setHoldProgress(0)
                    }
                  }, interval)
                }}
                onMouseUp={() => {
                  if (holdTimerRef.current) {
                    clearInterval(holdTimerRef.current)
                    holdTimerRef.current = null
                  }
                  setIsHolding(false)
                  if (holdProgress < 100) {
                    setHoldProgress(0)
                  }
                }}
                onMouseLeave={() => {
                  if (holdTimerRef.current) {
                    clearInterval(holdTimerRef.current)
                    holdTimerRef.current = null
                  }
                  setIsHolding(false)
                  if (holdProgress < 100) {
                    setHoldProgress(0)
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsHolding(true)
                  setHoldProgress(0)
                  
                  const duration = 1500 // 1.5 seconds
                  const interval = 20
                  const increment = 100 / (duration / interval)
                  
                  let progress = 0
                  holdTimerRef.current = setInterval(() => {
                    progress += increment
                    setHoldProgress(Math.min(progress, 100))
                    
                    if (progress >= 100) {
                      if (holdTimerRef.current) {
                        clearInterval(holdTimerRef.current)
                        holdTimerRef.current = null
                      }
                      setIsHolding(false)
                      setFormData({ ...formData, offer: t.form.offerOptions.xperiencePro })
                      setShowForm(true)
                      setHoldProgress(0)
                    }
                  }, interval)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (holdTimerRef.current) {
                    clearInterval(holdTimerRef.current)
                    holdTimerRef.current = null
                  }
                  setIsHolding(false)
                  if (holdProgress < 100) {
                    setHoldProgress(0)
                  }
                }}
                onTouchCancel={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (holdTimerRef.current) {
                    clearInterval(holdTimerRef.current)
                    holdTimerRef.current = null
                  }
                  setIsHolding(false)
                  if (holdProgress < 100) {
                    setHoldProgress(0)
                  }
                }}
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold py-4 px-6 rounded-lg text-lg shadow-2xl transform hover:scale-105 transition-all duration-200 group relative overflow-hidden select-none touch-none"
                style={{
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Lightning/Energy Animation Overlay */}
                {isHolding && holdProgress < 100 && (
                  <>
                    {/* Animated Lightning Bolts */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {/* Lightning bolt 1 */}
                      <svg
                        className="absolute top-0 left-[20%] w-8 h-full opacity-70 animate-lightning-strike"
                        style={{ animationDuration: '0.3s' }}
                        viewBox="0 0 24 100"
                        fill="none"
                      >
                        <path
                          d="M12 0 L8 20 L16 25 L10 40 L18 45 L6 60 L14 65 L4 80 L20 85 L8 100"
                          stroke="white"
                          strokeWidth="2.5"
                          fill="none"
                          className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
                        />
                      </svg>
                      {/* Lightning bolt 2 */}
                      <svg
                        className="absolute top-0 right-[25%] w-8 h-full opacity-60 animate-lightning-strike"
                        style={{ animationDuration: '0.4s', animationDelay: '0.15s' }}
                        viewBox="0 0 24 100"
                        fill="none"
                      >
                        <path
                          d="M12 0 L10 15 L14 20 L8 35 L16 40 L6 55 L18 60 L4 75 L20 80 L10 100"
                          stroke="white"
                          strokeWidth="2.5"
                          fill="none"
                          className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
                        />
                      </svg>
                      {/* Lightning bolt 3 */}
                      <svg
                        className="absolute top-0 left-[50%] w-8 h-full opacity-50 animate-lightning-strike"
                        style={{ animationDuration: '0.35s', animationDelay: '0.25s' }}
                        viewBox="0 0 24 100"
                        fill="none"
                      >
                        <path
                          d="M12 0 L6 18 L18 23 L8 38 L16 43 L10 58 L14 63 L6 78 L20 83 L8 100"
                          stroke="white"
                          strokeWidth="2.5"
                          fill="none"
                          className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
                        />
                      </svg>
                      {/* Lightning bolt 4 (center) */}
                      <svg
                        className="absolute top-0 left-[45%] w-6 h-full opacity-80 animate-lightning-flash"
                        style={{ animationDuration: '0.25s', animationDelay: '0.1s' }}
                        viewBox="0 0 20 100"
                        fill="none"
                      >
                        <path
                          d="M10 0 L6 18 L14 22 L8 38 L12 42 L4 58 L16 62 L2 78 L18 82 L8 100"
                          stroke="white"
                          strokeWidth="3"
                          fill="none"
                          style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,1))' }}
                        />
                      </svg>
                    </div>
                    
                    {/* Electric Spark Particles */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full animate-electric-spark"
                          style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                            animationDelay: `${Math.random() * 0.6}s`,
                            animationDuration: `${0.4 + Math.random() * 0.4}s`,
                            boxShadow: '0 0 8px 3px rgba(255, 255, 255, 1), 0 0 12px 4px rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Glowing Pulse Effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-lightning-flash z-10"
                      style={{ 
                        animationDuration: '0.4s',
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                      }}
                    />
                    
                    {/* Energy Wave Effect */}
                    <div 
                      className="absolute inset-0 z-10 animate-energy-pulse"
                      style={{
                        background: `radial-gradient(circle at ${holdProgress}% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                      }}
                    />
                    
                    {/* Shimmer Effect */}
                    <div 
                      className="absolute inset-0 z-10"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) ${holdProgress}%, transparent 100%)`,
                        animation: 'shimmer 1s ease-in-out infinite',
                      }}
                    />
                  </>
                )}
                
                {/* Progress Bar Background */}
                {isHolding && (
                  <div 
                    className="absolute inset-0 bg-[#e6a800] transition-all duration-20 ease-linear z-0"
                    style={{ width: `${holdProgress}%` }}
                  />
                )}
                
                {/* Button Text */}
                <span className="relative z-30 transition-all duration-200 font-bold">
                  {isHolding && holdProgress < 100
                    ? (language === "en" ? `Hold to confirm... ${Math.round(holdProgress)}%` : `Maintenez pour confirmer... ${Math.round(holdProgress)}%`)
                    : (language === "en" ? "Choose Premium" : "Choisir Premium")
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Carousel */}
      <section id="testimonials" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.testimonials.title}
          </h2>
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentTestimonialIndex * (100 / testimonialsPerView)}%)` 
                }}
              >
                {testimonialImages.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 flex items-center justify-center px-2 ${
                      testimonialsPerView === 1 ? 'min-w-full' : 
                      testimonialsPerView === 2 ? 'min-w-[50%]' : 
                      'min-w-[33.333%]'
                    }`}
                  >
                    <div className="w-full">
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Testimonial ${index + 1}`}
                          width={400}
                          height={300}
                          className="w-full h-auto object-contain max-h-[300px] sm:max-h-[400px]"
                          priority={index < 3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentTestimonialIndex((prev) => 
                prev === 0 ? Math.max(0, testimonialImages.length - testimonialsPerView) : Math.max(0, prev - 1)
              )}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => setCurrentTestimonialIndex((prev) => 
                prev >= testimonialImages.length - testimonialsPerView ? 0 : prev + 1
              )}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.max(1, testimonialImages.length - testimonialsPerView + 1) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    index === currentTestimonialIndex
                      ? "bg-[#005eb8] w-8"
                      : "bg-gray-300 hover:bg-gray-400 w-2"
                  }`}
                  aria-label={`Go to testimonial group ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section - Slideshow */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {language === "en" ? "They trusted us" : "Ils nous ont fait confiance"}
          </h2>
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPartnerIndex * (100 / 6)}%)` }}
              >
                {[
                  "/partenaires/AIESEC.png",
                  "/partenaires/Al_Aoula_Tv_Logo.png",
                  "/partenaires/EMSI.png",
                  "/partenaires/ENCG Casa.png",
                  "/partenaires/ENCG Kenitra.png",
                  "/partenaires/ENCG Oujda.png",
                  "/partenaires/ENCG Tanger.png",
                  "/partenaires/ENCG-S.png",
                  "/partenaires/ENSA Kenitra.png",
                  "/partenaires/ENSA Tetouan.png",
                  "/partenaires/Le-Matinma.png",
                  "/partenaires/logo_alowla.png",
                  "/partenaires/logo_alowla1.png",
                  "/partenaires/Logo_groupe_ISCAE.jpg",
                  "/partenaires/Logo_iav.png",
                  "/partenaires/Logo_inpt.PNG",
                  "/partenaires/Logo_Université_Euromed_de_Fès.png",
                  "/partenaires/M24_tv_logo.jpg",
                  "/partenaires/Universite_Cadi_Ayyad.png",
                ].map((logo, index) => (
                  <div
                    key={index}
                    className="min-w-[16.666%] md:min-w-[16.666%] flex-shrink-0 px-2"
                  >
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-24 md:h-32 group hover:scale-105">
                      <Image
                        src={logo}
                        alt={`Partner ${index + 1}`}
                        width={120}
                        height={80}
                        className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentPartnerIndex((prev) => 
                prev === 0 ? Math.max(0, 19 - 6) : Math.max(0, prev - 1)
              )}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous partners"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPartnerIndex((prev) => 
                prev >= 19 - 6 ? 0 : prev + 1
              )}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next partners"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.faq.title}
          </h2>
          <div className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#005eb8] flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_white.png"
              alt="XPERIENCE Logo"
              width={200}
              height={60}
              className="h-12 md:h-16 w-auto"
            />
          </div>
          <p className="text-gray-400 mb-6">
            {language === "en"
              ? "Transform your job search. Get real results."
              : "Transforme ta recherche d'emploi. Obtiens de vrais résultats."}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={t.trainer.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href={t.trainer.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>

      {/* Micro-Reward Modal - Phase 3 */}
      {showMicroReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-8 shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="text-2xl font-bold text-[#005eb8] mb-2">
                {language === "en" ? "Great Decision!" : "Bonne décision !"}
              </div>
              <CheckCircle2 className="w-16 h-16 text-[#FFBC00] mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowExitIntent(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="mb-4">
                <MessageSquare className="w-16 h-16 text-[#005eb8] mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {language === "en" 
                  ? "You're one click away from fixing what's blocking you"
                  : "Vous êtes à un clic de corriger ce qui vous bloque"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Don't let another opportunity pass by. See how we help candidates get real results."
                  : "Ne laissez pas passer une autre opportunité. Découvrez comment nous aidons les candidats à obtenir de vrais résultats."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowExitIntent(false)
                    scrollToSection("price")
                  }}
                  className="flex-1 bg-[#005eb8] hover:bg-[#0476D7] text-white font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  {language === "en" ? "See Offers" : "Voir les offres"}
                </button>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  {language === "en" ? "Maybe Later" : "Peut-être plus tard"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{t.form.title}</h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ fullName: "", phone: "", lookingFor: "", offer: "" })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <p className="text-gray-600 text-sm">{t.form.subtitle}</p>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.fullName} *
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder={t.form.fields.fullName}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.phone} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.lookingFor} *
                </label>
                <select
                  id="lookingFor"
                  required
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an option" : "Sélectionnez une option"}</option>
                  <option value="stagePFE">{t.form.lookingForOptions.stagePFE}</option>
                  <option value="premierEmploi">{t.form.lookingForOptions.premierEmploi}</option>
                  <option value="progresserCarriere">{t.form.lookingForOptions.progresserCarriere}</option>
                  <option value="reconversion">{t.form.lookingForOptions.reconversion}</option>
                </select>
              </div>

              <div>
                <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.offer} *
                </label>
                <select
                  id="offer"
                  required
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an offer" : "Sélectionnez une offre"}</option>
                  <option value={t.form.offerOptions.xperience}>{t.form.offerOptions.xperience}</option>
                  <option value={t.form.offerOptions.xperiencePro}>{t.form.offerOptions.xperiencePro}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-6 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t.form.fields.submit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

